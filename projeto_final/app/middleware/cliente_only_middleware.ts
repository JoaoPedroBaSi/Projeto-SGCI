import type { HttpContext } from '@adonisjs/core/http'
//import type { NextFn } from '@adonisjs/core/types/http'

export default class ClienteOnlyMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const user = ctx.auth?.user

    if (!user) {
      return ctx.response.unauthorized({
        message: 'Usuário não autenticado',
      })
    }

    if (user.perfil_tipo !== 'cliente') {
      return ctx.response.unauthorized({
        message: 'Acesso negado. Apenas clientes podem acessar.',
      })
    }

    await next()
  }
}