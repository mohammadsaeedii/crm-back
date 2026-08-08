import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantsService } from './tenants.service';
export declare class TenantHostGuard implements CanActivate {
    private readonly tenantsService;
    private readonly config;
    constructor(tenantsService: TenantsService, config: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
