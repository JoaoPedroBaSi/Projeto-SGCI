import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user' // Certifique-se de importar o Model User

export default class ClienteOrProfissionalOnlyMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    /**
     * CORREÇÃO: Cast duplo para o Model User.
     * Isso permite acessar 'perfilTipo' sem o erro TS2339.
     */
    const user = auth.user as unknown as User

    if (!user) {
      return response.unauthorized({ message: 'Usuário não autenticado.' })
    }

    const temPermissao = user.perfilTipo === 'cliente' || user.perfilTipo === 'profissional'

    if (!temPermissao) {
      return response.forbidden({
        message: 'Acesso negado. Apenas pacientes ou profissionais podem acessar esta rota.',
      })
    }

    await next()
  }
}