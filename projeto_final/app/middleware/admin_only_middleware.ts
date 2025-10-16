import type { HttpContext } from '@adonisjs/core/http'

// Middleware para permitir acesso apenas a usuários administradores
export default class AdminOnlyMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const user = ctx.auth?.user

    if (!user) {
      return ctx.response.unauthorized({
        message: 'Usuário não autenticado',
      })
    }

    if (user.perfil_tipo !== 'admin') {
      return ctx.response.unauthorized({
        message: 'Acesso negado. Apenas administradores podem acessar.',
      })
    }

    await next()
  }
}
