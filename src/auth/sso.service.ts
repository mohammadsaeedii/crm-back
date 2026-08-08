import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import type { JwtPayload } from './jwt-payload';

const SSO_STATE_TTL_MS = 10 * 60 * 1000;
const AUTH_TICKET_TTL_MS = 60 * 1000;

type OidcIdentity = {
  sub: string;
  email: string;
  name?: string;
  customerId: number | string;
  slug: string;
};

@Injectable()
export class SsoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tenantsService: TenantsService,
  ) {}

  async start(returnTo?: string) {
    const clientId = this.config.getOrThrow<string>('OIDC_CLIENT_ID');
    const issuer = this.config.getOrThrow<string>('OIDC_ISSUER');
    const redirectUri = this.config.getOrThrow<string>('OIDC_REDIRECT_URI');

    const state = randomBytes(24).toString('base64url');
    const nonce = randomBytes(24).toString('base64url');
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256')
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

  async handleCallback(code?: string, state?: string) {
    if (!code || !state) {
      throw new BadRequestException('code and state are required');
    }

    const ssoState = await this.prisma.ssoState.findUnique({
      where: { id: state },
    });

    if (!ssoState || ssoState.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Invalid or expired SSO state');
    }

    await this.prisma.ssoState.delete({ where: { id: state } });

    const tokens = await this.exchangeCode(code, ssoState.codeVerifier);
    const identity = await this.fetchIdentity(tokens.access_token);

    if (tokens.id_token) {
      this.assertNonce(tokens.id_token, ssoState.nonce);
    }

    const user = await this.tenantsService.resolveForSsoIdentity(identity);
    if (!user.tenantId) {
      throw new UnauthorizedException('SSO user is missing tenant');
    }

    const ticket = randomBytes(32).toString('base64url');
    await this.prisma.authTicket.create({
      data: {
        id: ticket,
        userId: user.id,
        expiresAt: new Date(Date.now() + AUTH_TICKET_TTL_MS),
      },
    });

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const completeUrl = new URL('/auth/sso/complete', frontendUrl);
    completeUrl.searchParams.set('ticket', ticket);
    if (ssoState.returnTo) {
      completeUrl.searchParams.set('returnTo', ssoState.returnTo);
    }

    return { redirectTo: completeUrl.toString() };
  }

  async exchangeTicket(ticket: string) {
    const record = await this.prisma.authTicket.findUnique({
      where: { id: ticket },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Invalid or expired login ticket');
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
      throw new UnauthorizedException('User not found');
    }

    const payload: JwtPayload = {
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

  private async exchangeCode(code: string, codeVerifier: string) {
    const issuer = this.config.getOrThrow<string>('OIDC_ISSUER');
    const clientId = this.config.getOrThrow<string>('OIDC_CLIENT_ID');
    const clientSecret = this.config.getOrThrow<string>('OIDC_CLIENT_SECRET');
    const redirectUri = this.config.getOrThrow<string>('OIDC_REDIRECT_URI');

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
      throw new UnauthorizedException(`Token exchange failed: ${text}`);
    }

    return (await response.json()) as {
      access_token: string;
      id_token?: string;
      refresh_token?: string;
      token_type: string;
      expires_in: number;
    };
  }

  private async fetchIdentity(accessToken: string): Promise<OidcIdentity> {
    const issuer = this.config.getOrThrow<string>('OIDC_ISSUER');
    const response = await fetch(new URL('/oauth/userinfo', issuer), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to load userinfo');
    }

    const identity = (await response.json()) as OidcIdentity;
    if (!identity.sub || !identity.email || !identity.slug || identity.customerId == null) {
      throw new UnauthorizedException('Incomplete identity from IdP');
    }

    return identity;
  }

  private assertNonce(idToken: string, expectedNonce: string) {
    const parts = idToken.split('.');
    if (parts.length < 2) {
      throw new UnauthorizedException('Invalid id_token');
    }
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8'),
    ) as { nonce?: string };
    if (payload.nonce !== expectedNonce) {
      throw new UnauthorizedException('Invalid nonce');
    }
  }
}
