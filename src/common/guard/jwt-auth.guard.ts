import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(ctx);
  }

  getRequest(ctx: ExecutionContext) {
    if (ctx.getType() === 'http') return ctx.switchToHttp().getRequest();
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GqlExecutionContext } = require('@nestjs/graphql');
      return GqlExecutionContext.create(ctx).getContext().req;
    } catch {
      return ctx.switchToHttp().getRequest();
    }
  }

  handleRequest(err: any, user: any) {
    if (err || !user) throw err || new UnauthorizedException('Invalid or expired token');
    return user;
  }
}
