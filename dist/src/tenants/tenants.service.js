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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TenantsService = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async provision(input) {
        const tenant = await this.prisma.tenant.upsert({
            where: { externalCustomerId: input.externalCustomerId },
            update: {
                slug: input.slug,
                name: input.name,
            },
            create: {
                externalCustomerId: input.externalCustomerId,
                slug: input.slug,
                name: input.name,
            },
        });
        const companyCount = await this.prisma.company.count({
            where: { tenantId: tenant.id },
        });
        if (companyCount === 0) {
            let owner = await this.prisma.user.findFirst({
                where: { tenantId: tenant.id },
                orderBy: { id: 'asc' },
            });
            if (!owner && input.email) {
                owner = await this.prisma.user.create({
                    data: {
                        email: input.email.toLowerCase(),
                        name: input.name,
                        authProvider: 'add-pnale',
                        externalUserId: `customer_${input.externalCustomerId}`,
                        tenantId: tenant.id,
                        passwordHash: null,
                    },
                });
            }
            if (owner) {
                await this.prisma.company.create({
                    data: {
                        name: `${input.name} Company`,
                        ownerId: owner.id,
                        tenantId: tenant.id,
                    },
                });
            }
        }
        return tenant;
    }
    async findBySlug(slug) {
        return this.prisma.tenant.findUnique({ where: { slug } });
    }
    async assertHostMatchesTenant(hostHeader, tenantSlug, rootDomain) {
        if (!tenantSlug) {
            return;
        }
        const hostname = (hostHeader || '').split(':')[0].toLowerCase();
        if (!hostname ||
            hostname === 'localhost' ||
            hostname.endsWith('.localhost') ||
            hostname === rootDomain ||
            hostname === `www.${rootDomain}`) {
            return;
        }
        const expected = `${tenantSlug}.${rootDomain}`.toLowerCase();
        if (hostname !== expected) {
            throw new common_1.ForbiddenException('Host does not match authenticated tenant');
        }
    }
    async resolveForSsoIdentity(identity) {
        const externalCustomerId = String(identity.customerId);
        const tenant = await this.provision({
            externalCustomerId,
            slug: identity.slug,
            name: identity.name || identity.email,
            email: identity.email,
        });
        let user = await this.prisma.user.findUnique({
            where: { externalUserId: identity.sub },
        });
        if (user) {
            if (user.tenantId !== tenant.id) {
                throw new common_1.UnauthorizedException('User tenant mismatch');
            }
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    email: identity.email.toLowerCase(),
                    name: identity.name || user.name,
                    authProvider: 'add-pnale',
                    passwordHash: null,
                },
            });
        }
        else {
            const byEmail = await this.prisma.user.findFirst({
                where: {
                    tenantId: tenant.id,
                    email: identity.email.toLowerCase(),
                },
            });
            if (byEmail) {
                user = await this.prisma.user.update({
                    where: { id: byEmail.id },
                    data: {
                        externalUserId: identity.sub,
                        authProvider: 'add-pnale',
                        name: identity.name || byEmail.name,
                        passwordHash: null,
                    },
                });
            }
            else {
                user = await this.prisma.user.create({
                    data: {
                        email: identity.email.toLowerCase(),
                        name: identity.name || null,
                        externalUserId: identity.sub,
                        authProvider: 'add-pnale',
                        tenantId: tenant.id,
                        passwordHash: null,
                    },
                });
            }
        }
        const companyCount = await this.prisma.company.count({
            where: { tenantId: tenant.id },
        });
        if (companyCount === 0) {
            await this.prisma.company.create({
                data: {
                    name: `${identity.name || identity.email} Company`,
                    ownerId: user.id,
                    tenantId: tenant.id,
                },
            });
        }
        return user;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map