"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SsoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const tenants_service_1 = require("../tenants/tenants.service");
const SSO_STATE_TTL_MS = 10 * 60 * 1000;
const AUTH_TICKET_TTL_MS = 60 * 1000;
let SsoService = class SsoService {
    prisma;
    config;
    jwtService;
    tenantsService;
    constructor(prisma, config, jwtService, tenantsService) {
        this.prisma = prisma;
        this.config = config;
        this.jwtService = jwtService;
        this.tenantsService = tenantsService;
    }
    async start(returnTo) {
        const clientId = this.config.getOrThrow('OIDC_CLIENT_ID');
        const issuer = this.config.getOrThrow('OIDC_ISSUER');
        const redirectUri = this.config.getOrThrow('OIDC_REDIRECT_URI');
        const state = (0, crypto_1.randomBytes)(24).toString('base64url');
        const nonce = (0, crypto_1.randomBytes)(24).toString('base64url');
        const codeVerifier = (0, crypto_1.randomBytes)(32).toString('base64url');
        const codeChallenge = (0, crypto_1.createHash)('sha256')
            .update(codeVerifier)
            .digest('base64url');
        await this.prisma.ssoState.create({
            data: {
                id: state,
                codeVerifier,
                nonce,
                returnTo: returnTo || undefined,
                expiresAt: new Date(Date.now() + SSO_STATE_TTL_MS),
            },
        });
        const authorizeUrl = new URL('/oauth/authorize', issuer);
        authorizeUrl.searchParams.set('response_type', 'code');
        authorizeUrl.searchParams.set('client_id', clientId);
        authorizeUrl.searchParams.set('redirect_uri', redirectUri);
        authorizeUrl.searchParams.set('scope', 'openid profile email');
        authorizeUrl.searchParams.set('state', state);
        authorizeUrl.searchParams.set('nonce', nonce);
        authorizeUrl.searchParams.set('code_challenge', codeChallenge);
        authorizeUrl.searchParams.set('code_challenge_method', 'S256');
        return { authorizeUrl: authorizeUrl.toString() };
    }
    async handleCallback(code, state) {
        if (!code || !state) {
            throw new common_1.BadRequestException('code and state are required');
        }
        const ssoState = await this.prisma.ssoState.findUnique({
            where: { id: state },
        });
        if (!ssoState || ssoState.expiresAt.getTime() < Date.now()) {
            throw new common_1.UnauthorizedException('Invalid or expired SSO state');
        }
        await this.prisma.ssoState.delete({ where: { id: state } });
        const tokens = await this.exchangeCode(code, ssoState.codeVerifier);
        const identity = await this.fetchIdentity(tokens.access_token);
        if (tokens.id_token) {
            this.assertNonce(tokens.id_token, ssoState.nonce);
        }
        const user = await this.tenantsService.resolveForSsoIdentity(identity);
        if (!user.tenantId) {
            throw new common_1.UnauthorizedException('SSO user is missing tenant');
        }
        const ticket = (0, crypto_1.randomBytes)(32).toString('base64url');
        await this.prisma.authTicket.create({
            data: {
                id: ticket,
                userId: user.id,
                expiresAt: new Date(Date.now() + AUTH_TICKET_TTL_MS),
            },
        });
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
        const completeUrl = new URL('/auth/sso/complete', frontendUrl);
        completeUrl.searchParams.set('ticket', ticket);
        if (ssoState.returnTo) {
            completeUrl.searchParams.set('returnTo', ssoState.returnTo);
        }
        return { redirectTo: completeUrl.toString() };
    }
    async exchangeTicket(ticket) {
        const record = await this.prisma.authTicket.findUnique({
            where: { id: ticket },
        });
        if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
            throw new common_1.UnauthorizedException('Invalid or expired login ticket');
        }
        await this.prisma.authTicket.update({
            where: { id: ticket },
            data: { usedAt: new Date() },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: record.userId },
            include: { tenant: true },
        });
        if (!user || !user.tenantId || !user.tenant) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const payload = {
            userId: user.id,
            tenantId: user.tenantId,
            slug: user.tenant.slug,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                tenantId: user.tenantId,
                slug: user.tenant.slug,
                authProvider: user.authProvider,
            },
        };
    }
    async exchangeCode(code, codeVerifier) {
        const issuer = this.config.getOrThrow('OIDC_ISSUER');
        const clientId = this.config.getOrThrow('OIDC_CLIENT_ID');
        const clientSecret = this.config.getOrThrow('OIDC_CLIENT_SECRET');
        const redirectUri = this.config.getOrThrow('OIDC_REDIRECT_URI');
        const response = await fetch(new URL('/oauth/token', issuer), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
                code_verifier: codeVerifier,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new common_1.UnauthorizedException(`Token exchange failed: ${text}`);
        }
        return (await response.json());
    }
    async fetchIdentity(accessToken) {
        const issuer = this.config.getOrThrow('OIDC_ISSUER');
        const response = await fetch(new URL('/oauth/userinfo', issuer), {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
            throw new common_1.UnauthorizedException('Failed to load userinfo');
        }
        const identity = (await response.json());
        if (!identity.sub || !identity.email || !identity.slug || identity.customerId == null) {
            throw new common_1.UnauthorizedException('Incomplete identity from IdP');
        }
        return identity;
    }
    assertNonce(idToken, expectedNonce) {
        const parts = idToken.split('.');
        if (parts.length < 2) {
            throw new common_1.UnauthorizedException('Invalid id_token');
        }
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (payload.nonce !== expectedNonce) {
            throw new common_1.UnauthorizedException('Invalid nonce');
        }
    }
};
exports.SsoService = SsoService;
exports.SsoService = SsoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        jwt_1.JwtService,
        tenants_service_1.TenantsService])
], SsoService);
//# sourceMappingURL=sso.service.js.map