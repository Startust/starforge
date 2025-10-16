import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req =
    ctx.getType() === 'http'
      ? ctx.switchToHttp().getRequest()
      : ((ctx as any).switchToHttp?.().getRequest?.() ??
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('@nestjs/graphql').GqlExecutionContext.create(ctx).getContext().req);
  return req.user;
});
