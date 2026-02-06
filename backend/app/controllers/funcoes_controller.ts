import type { HttpContext } from '@adonisjs/core/http'
import Funcao from '#models/funcao'
import { storeFuncaoValidator, updateFuncaoValidator } from '#validators/validator_funcao'

export default class FuncoesController {
  
  public async index({ response }: HttpContext) {
    const funcoes = await Funcao.all()
    return response.ok(funcoes)
  }

  public async show({ params, response }: HttpContext) {
    try {
      const funcao = await Funcao.query()
        .where('id', params.id)
        .preload('profissionais')
        .firstOrFail()
        
      return response.ok(funcao)
    } catch {
      return response.notFound({ message: 'Função não encontrada.' })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeFuncaoValidator)
      const funcao = await Funcao.create(payload)
      
      return response.created(funcao)
    } catch (error) {
      return response.badRequest({ message: 'Erro ao criar função.', error })
    }
  }

  public async update({ request, params, response }: HttpContext) {
    try {
      const funcao = await Funcao.findOrFail(params.id)
      const payload = await request.validateUsing(updateFuncaoValidator)

      funcao.merge(payload)
      await funcao.save()
      
      return response.ok(funcao)
    } catch {
      return response.badRequest({ message: 'Não foi possível atualizar a função.' })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const funcao = await Funcao.findOrFail(params.id)
      await funcao.delete()
      
      return response.ok({ message: 'Função excluída com sucesso.', data: funcao })
    } catch {
      return response.notFound({ message: 'Função não encontrada.' })
    }
  }
}