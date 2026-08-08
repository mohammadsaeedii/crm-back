import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    provision(input: {
        externalCustomerId: string;
        slug: string;
        name: string;
        email?: string;
    }): Promise<{
        id: number;
        externalCustomerId: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findBySlug(slug: string): Promise<{
        id: number;
        externalCustomerId: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    assertHostMatchesTenant(hostHeader: string | undefined, tenantSlug: string | null | undefined, rootDomain: string): Promise<void>;
    resolveForSsoIdentity(identity: {
        sub: string;
        email: string;
        name?: string;
        customerId: number | string;
        slug: string;
    }): Promise<{
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string | null;
        externalUserId: string | null;
        authProvider: string;
        tenantId: number | null;
    }>;
}
