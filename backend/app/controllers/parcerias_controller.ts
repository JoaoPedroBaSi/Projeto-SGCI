import type { HttpContext } from '@adonisjs/core/http'
import Parceria from '#models/parceria'
import { storeParceriaValidator, updateParceriaValidator } from '#validators/validator_parceria'

export default class ParceriasController {
    public async index ({ } : HttpContext) {
        return await Parceria.all()
    }
    public async show ({ params } : HttpContext) {
        return await Parceria.query().where('id', params.id).first()
    }
    public async store ({ auth, request, response } : HttpContext) {
      const usuarioLogado = auth.user

    if (usuarioLogado?.perfil_tipo !== 'admin') {
        return response.status(401).send('Apenas administradores podem cadastrar parcerias.')
    }
    try {
      const dados = await request.validateUsing(storeParceriaValidator)
      // Lógica de EM NEGOCIACAO (usando o objeto mapeado)
      if (dados.status_parceria === 'EM NEGOCIACAO') {
          dados.data_inicio = null // Correto, pois o Model aceita | null
      }

      // Criação com o objeto mapeado
      await Parceria.create(dados)
      console.log('create passou')

      return response.status(201).send('Cadastro de parceria feito com sucesso.')
  } catch (error) {
      return response.status(500).send('Erro ao cadastrar a parceria. Tente novamente.')
  }
}
    public async update({ params, request, response }: HttpContext) {
  try {
    const dados = await request.validateUsing(updateParceriaValidator)
    const parceria = await Parceria.findOrFail(params.id)

    // Merge manual convertendo snake_case para camelCase
    parceria.merge(dados)
    await parceria.save()
    return response.status(200).json({ message: 'Atualizado com sucesso' })
  } catch (error) {
    console.error(error)
    return response.status(error.status || 500).send(error.messages || 'Erro na atualização')
  }
}
    public async destroy ({ params, response } : HttpContext) {
      try{
          const parceria = await Parceria.findOrFail(params.id)

          if(parceria.statusParceria !== 'ATIVO') {
            return response.forbidden({ message: 'Somente parcerias ativas podem ser desativadas.' })
          }

          parceria.statusParceria = 'INATIVO'
          await parceria.save()

          return response.status(201).send('Parceria desativada com sucesso.')
      } catch (error) {
          return response.status(500).send('Erro ao atualizar a parceria. Tente novamente.')
      }
    }
}
