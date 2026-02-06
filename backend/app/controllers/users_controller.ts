import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'

export default class UsersController {
  
  public async index({ auth, response }: HttpContext) {
    /**
     * CORREÇÃO: Cast duplo para o TypeScript reconhecer as propriedades do seu Model User.
     */
    const usuario = auth.user as unknown as User

    if (usuario.perfilTipo !== 'admin') {
      return response.forbidden({ message: 'Acesso negado. Apenas administradores.' })
    }

    const users = await User.all()
    return response.ok(users)
  }

  public async show({ auth, params, response }: HttpContext) {
    const usuarioLogado = auth.user as unknown as User
    const idSolicitado = Number(params.id)

    if (usuarioLogado.perfilTipo !== 'admin' && usuarioLogado.id !== idSolicitado) {
      return response.forbidden({ message: 'Você não tem permissão para visualizar estes dados.' })
    }

    try {
      const targetUser = await User.findOrFail(idSolicitado)

      if (targetUser.status !== 'ativo') {
        return response.badRequest({ message: 'Usuário inativo ou suspenso.' })
      }

      if (targetUser.perfilTipo === 'cliente') {
        const cliente = await Cliente.query().where('id', targetUser.id).firstOrFail()
        return response.ok(cliente)

      } else if (targetUser.perfilTipo === 'profissional') {
        const profissional = await Profissional.query()
          .where('id', targetUser.id)
          .preload('especializacoes')
          .preload('funcao')
          .firstOrFail()
          
        return response.ok(profissional)
      } 
      
      return response.ok(targetUser)

    } catch {
      return response.notFound({ message: 'Usuário não encontrado.' })
    }
  }
}