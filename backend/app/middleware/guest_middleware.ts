import type { HttpContext } from '@adonisjs/core/http'

export default class GuestMiddleware {

  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    const isAuthenticated = await auth.check()

    if (isAuthenticated) {
      return response.badRequest({
        message: 'Você já está autenticado e não pode acessar esta rota como visitante.',
      })
    }

    await next()
  }
}