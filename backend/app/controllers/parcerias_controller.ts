import type { HttpContext } from '@adonisjs/core/http'
import Parceria from '#models/parceria'
import { storeParceriaValidator, updateParceriaValidator } from '#validators/validator_parceria'

export default class ParceriasController {
  
  public async index({ response }: HttpContext) {
    const parcerias = await Parceria.all()
    return response.ok(parcerias)
  }

  public async show({ params, response }: HttpContext) {
    try {
      const parceria = await Parceria.findOrFail(params.id)
      return response.ok(parceria)
    } catch {
      return response.notFound({ message: 'Parceria não encontrada.' })
    }
  }

  public async store({ auth, request, response }: HttpContext) {
    const usuarioLogado = auth.user

    // CORREÇÃO: perfil_tipo -> perfilTipo
    if (usuarioLogado?.perfilTipo !== 'admin') {
      return response.forbidden({ message: 'Apenas administradores podem cadastrar parcerias.' })
    }

    try {
      const dados = await request.validateUsing(storeParceriaValidator)

      // CORREÇÃO: status_parceria -> statusParceria e data_inicio -> dataInicio
      if (dados.statusParceria === 'EM NEGOCIACAO') {
        dados.dataInicio = undefined // No TypeScript/Adonis use undefined para campos opcionais
      }

      const parceria = await Parceria.create(dados)

      return response.created({ message: 'Cadastro de parceria realizado com sucesso.', data: parceria })
    } catch (error: any) {
      return response.badRequest({ message: 'Erro ao cadastrar a parceria.', error: error.message || error })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const parceria = await Parceria.findOrFail(params.id)
      const dados = await request.validateUsing(updateParceriaValidator)

      parceria.merge(dados)
      await parceria.save()

      return response.ok({ message: 'Parceria atualizada com sucesso', data: parceria })
    } catch (error: any) {
      return response.badRequest({ message: 'Erro na atualização da parceria.', error: error.message || error })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const parceria = await Parceria.findOrFail(params.id)

      if (parceria.statusParceria !== 'ATIVO') {
        return response.badRequest({ message: 'Somente parcerias ativas podem ser desativadas.' })
      }

      parceria.statusParceria = 'INATIVO'
      await parceria.save()

      return response.ok({ message: 'Parceria desativada com sucesso.' })
    } catch {
      return response.notFound({ message: 'Parceria não encontrada.' })
    }
  }
}