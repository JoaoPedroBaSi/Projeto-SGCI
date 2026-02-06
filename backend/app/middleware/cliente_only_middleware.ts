import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class ClienteOnlyMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    const user = auth.user as unknown as User

    if (!user) {
      return response.unauthorized({
        message: 'Usuário não autenticado.',
      })
    }

    if (user.perfilTipo !== 'cliente') {
      return response.forbidden({
        message: 'Acesso negado. Esta funcionalidade é exclusiva para Pacientes.',
      })
    }

    await next()
  }
}