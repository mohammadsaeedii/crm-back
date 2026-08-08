import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/jwt-payload';
import { TenantsService } from './tenants.service';

type AuthRequest = Request & { user?: JwtPayload };

@Injectable()
export class TenantHostGuard implements CanActivate {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const rootDomain = this.config.get<string>('ROOT_DOMAIN', 'localhost');
    const host =
      (request.headers['x-forwarded-host'] as string | undefined) ||
      request.headers.host;

    await this.tenantsService.assertHostMatchesTenant(
      host,
      request.user?.slug,
      rootDomain,
    );

    return true;
  }
}
