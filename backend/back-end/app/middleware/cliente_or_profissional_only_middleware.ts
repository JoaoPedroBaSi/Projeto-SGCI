import type { HttpContext } from '@adonisjs/core/http'
//import type { NextFn } from '@adonisjs/core/types/http'

export default class ClienteOrProfissionalOnlyMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const user = ctx.auth?.user

    if (!user) {
      return ctx.response.unauthorized({
        message: 'Usuário não autenticado',
      })
    }

    if (user.perfil_tipo !== 'cliente' && user.perfil_tipo !== 'profissional') {
      return ctx.response.unauthorized({
        message: 'Acesso negado. Apenas clientes podem acessar.',
      })
    }

    await next()
  }
}