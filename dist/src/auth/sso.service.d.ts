import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
export declare class SsoService {
    private readonly prisma;
    private readonly config;
    private readonly jwtService;
    private readonly tenantsService;
    constructor(prisma: PrismaService, config: ConfigService, jwtService: JwtService, tenantsService: TenantsService);
    start(returnTo?: string): Promise<{
        authorizeUrl: string;
    }>;
    handleCallback(code?: string, state?: string): Promise<{
        redirectTo: string;
    }>;
    exchangeTicket(ticket: string): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            name: string | null;
            tenantId: number;
            slug: string;
            authProvider: string;
        };
    }>;
    private exchangeCode;
    private fetchIdentity;
    private assertNonce;
}
