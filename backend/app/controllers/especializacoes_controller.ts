import type { HttpContext } from '@adonisjs/core/http'
import Especializacao from '#models/especializacao'
import { storeEspecializacaoValidator, updateEspecializacaoValidator } from '#validators/validator_especializacao'

export default class EspecializacaoController {
  
  public async index({ response }: HttpContext) {
    const especializacoes = await Especializacao.all()
    return response.ok(especializacoes)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeEspecializacaoValidator)
      const especializacao = await Especializacao.create(payload)
      
      return response.created(especializacao)
    } catch (error) {
      return response.badRequest({ message: 'Não foi possível cadastrar a especialização.' })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const especializacao = await Especializacao.query()
        .where('id', params.id)
        .preload('profissionais', (query) => {
          query.select('id', 'nome')
        })
        .firstOrFail()

      return response.ok(especializacao)
    } catch {
      return response.notFound({ message: 'Especialização não encontrada.' })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const especializacao = await Especializacao.findOrFail(params.id)
      const payload = await request.validateUsing(updateEspecializacaoValidator)

      especializacao.merge(payload) 
      await especializacao.save()

      return response.ok(especializacao)
    } catch (error) {
      return response.badRequest({ message: 'Não foi possível atualizar os dados da especialização.' })
    } 
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const especializacao = await Especializacao.findOrFail(params.id)
      await especializacao.delete()
      
      return response.ok({ message: 'Especialização removida com sucesso.', data: especializacao })
    } catch {
      return response.notFound({ message: 'Especialização não encontrada.' })
    }
  }
}