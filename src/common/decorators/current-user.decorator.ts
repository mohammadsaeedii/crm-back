import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { JwtPayload } from '../../auth/jwt-payload';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const userId = request.user?.userId;
    if (!userId) {
      throw new ForbiddenException('Not authenticated');
    }
    return userId;
  },
);
