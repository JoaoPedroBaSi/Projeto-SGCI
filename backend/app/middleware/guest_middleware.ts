import type { HttpContext } from '@adonisjs/core/http'

export default class GuestMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    try {
      // Tenta verificar a autenticação
      const isAuthenticated = await auth.check()

      if (isAuthenticated) {
        return response.badRequest({
          message: 'Você já está autenticado e não pode acessar esta rota como visitante.',
        })
      }
    } catch (error) {
      // Se der erro de accessTokens (undefined), logamos mas deixamos o visitante passar
      console.error('Erro de validação no GuestMiddleware:', error.message)
    }

    await next()
  }
}