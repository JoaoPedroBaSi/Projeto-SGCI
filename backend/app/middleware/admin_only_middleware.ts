import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AdminOnlyMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    // Cast duplo para o TS reconhecer as propriedades do seu Model User
    const user = auth.user as unknown as User

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