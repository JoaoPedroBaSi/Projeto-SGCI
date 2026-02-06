import type { HttpContext } from '@adonisjs/core/http'

export default class ClienteOnlyMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({
        message: 'Usuário não autenticado.',
      })
    }

    // CORREÇÃO: perfil_tipo -> perfilTipo
    if (user.perfilTipo !== 'cliente') {
      return response.forbidden({
        message: 'Acesso negado. Esta funcionalidade é exclusiva para Pacientes.',
      })
    }

    await next()
  }
}