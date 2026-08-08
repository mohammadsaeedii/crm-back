import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantHostGuard } from './tenant-host.guard';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, TenantHostGuard],
  exports: [TenantsService, TenantHostGuard],
})
export class TenantsModule {}
