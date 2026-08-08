import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { JwtPayload } from '../../auth/jwt-payload';

function getUser(ctx: ExecutionContext): JwtPayload {
  const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
  if (!request.user?.userId) {
    throw new ForbiddenException('Not authenticated');
  }
  return request.user;
}

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => getUser(ctx).userId,
);

export const CurrentTenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const tenantId = getUser(ctx).tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Missing tenant context');
    }
    return tenantId;
  },
);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => getUser(ctx),
);
