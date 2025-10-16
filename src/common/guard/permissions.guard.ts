import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorator/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required?.length) return true;
    const req = ctx.switchToHttp().getRequest();
    const userPerms: string[] = req.user?.permissions ?? [];
    return required.every(
      (p) => userPerms.includes(p) || userPerms.includes(`${p.split(':')[0]}:manage`),
    );
  }
}
