import type { HttpContext } from '@adonisjs/core/http'

export default class AdminOnlyMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({
        message: 'Usuário não autenticado.',
      })
    }

    if (user.perfilTipo !== 'admin') {
      return response.forbidden({
        message: 'Acesso negado. Apenas administradores podem acessar esta rota.',
      })
    }

    await next()
  }
}