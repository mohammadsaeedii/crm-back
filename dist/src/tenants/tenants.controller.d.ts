import { ConfigService } from '@nestjs/config';
import { TenantsService } from './tenants.service';
declare class ProvisionTenantDto {
    externalCustomerId: string;
    slug: string;
    name: string;
    email?: string;
}
export declare class TenantsController {
    private readonly tenantsService;
    private readonly config;
    constructor(tenantsService: TenantsService, config: ConfigService);
    provision(secret: string | undefined, dto: ProvisionTenantDto): Promise<{
        id: number;
        externalCustomerId: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
