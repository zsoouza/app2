import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrai o usuário autenticado da requisição.
 * Uso: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
