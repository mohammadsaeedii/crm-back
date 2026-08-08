import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async provision(input: {
    externalCustomerId: string;
    slug: string;
    name: string;
    email?: string;
  }) {
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

    // Ensure a default company exists for the tenant
    const companyCount = await this.prisma.company.count({
      where: { tenantId: tenant.id },
    });

    if (companyCount === 0) {
      // Create a placeholder owner user for the default company if SSO user not yet created
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

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  async assertHostMatchesTenant(
    hostHeader: string | undefined,
    tenantSlug: string | null | undefined,
    rootDomain: string,
  ) {
    if (!tenantSlug) {
      return;
    }

    const hostname = (hostHeader || '').split(':')[0].toLowerCase();

    // Local / non-subdomain hosts skip strict host checks
    if (
      !hostname ||
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === rootDomain ||
      hostname === `www.${rootDomain}`
    ) {
      return;
    }

    const expected = `${tenantSlug}.${rootDomain}`.toLowerCase();
    if (hostname !== expected) {
      throw new ForbiddenException(
        'Host does not match authenticated tenant',
      );
    }
  }

  async resolveForSsoIdentity(identity: {
    sub: string;
    email: string;
    name?: string;
    customerId: number | string;
    slug: string;
  }) {
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
        throw new UnauthorizedException('User tenant mismatch');
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
    } else {
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
      } else {
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
}