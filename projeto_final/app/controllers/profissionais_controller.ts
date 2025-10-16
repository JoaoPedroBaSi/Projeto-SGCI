/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import Profissional from '#models/profissional'
import { DateTime } from 'luxon'
import { storeProfissionalValidator, updateProfissionalValidator } from '#validators/validator_profissional'
import mail from '@adonisjs/mail/services/main'

// Lembrando -> não há referências a especialização pois é uma relação de muitos para muitos.
// Haverá uma tabela pivô Especializacao/Profissional para criar os relacionamentos.
export default class ProfissionaisController {
  // Lista todos os profissionais
  public async index({ response }: HttpContext) {
    try {
      const profissionais = await Profissional.all()
      return response.status(200).send(profissionais)
    } catch {
      return response.status(500).send({ message: 'Erro ao listar profissionais' })
    }
  }

  // Cria profissionais e seus atributos
  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeProfissionalValidator)
      // Converte dataNascimento para DateTime antes de criar
      const profissional = await Profissional.create({
        ...payload,
        dataNascimento: DateTime.fromJSDate(payload.dataNascimento),
      })

      return response.status(201).send(profissional)
    } catch (error) {
      console.log(error)
      return response.status(400).send({ message: 'Não foi possível criar o profissional', error })
    }
  }

  // Mostra um profissional específico pelo id
  public async show({ params, response }: HttpContext) {
    try {
      const profissional = await Profissional.query()
        .where('id', params.id)
        .preload('especializacoes')
        .preload('funcao')
        .firstOrFail()

      return response.status(200).send(profissional)
    } catch {
      return response.status(404).send({ message: 'Profissional não encontrado' })
    }
  }

  // Atualiza informações de um profissional pelo id
  public async update({ params, request, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      const payload = await request.validateUsing(updateProfissionalValidator)

      // Converte dataNascimento se existir no payload
      profissional.merge({
    ...payload,
    dataNascimento: payload.dataNascimento
        ? DateTime.fromJSDate(payload.dataNascimento)
        : profissional.dataNascimento,
    })

      await profissional.save()
      return response.status(200).send(profissional)
    } catch (error) {
      console.log(error)
      return response.status(400).send({ message: 'Não foi possível atualizar o profissional', error })
    }
  }

  // Apaga o registro de profissional indicado pelo id
  public async destroy({ params, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      await profissional.delete()
      return response.status(200).send(profissional)
    } catch {
      return response.status(404).send({ message: 'Profissional não encontrado' })
    }
  }

  // Associa especializações a um profissional
  public async associarEspecializacao({ params, request, response }: HttpContext) {
    try {
      const ids = request.input('especializacaoIds') as number[]

      const profissional = await Profissional.findOrFail(params.id)

      await profissional.related('especializacoes').sync(ids)
      await profissional.load('especializacoes')

      return response.status(200).send(profissional)
    } catch (error) {
      return response.status(400).send({ message: 'Não foi possível atualizar o profissional', error })
    }
  }

  // Aprovação/Rejeição de profissionais
  public async atualizarStatus({ params, request, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      const novoStatus = request.input('status') // 'aprovado' ou 'rejeitado'

      profissional.status = novoStatus
      await profissional.save()

      // Busca o usuário associado ao profissional
      const user = await profissional.related('user').query().firstOrFail()

      if (!user) {
        return response.status(404).send({ message: 'Usuário associado ao profissional não encontrado' })
      }

      // Envia o email de notificação
      await mail.send((message) => {
        message
          .to(user.email)
          .from('clinicassgci@gmail.com')
          .subject(`Seu status como profissional foi atualizado para "${novoStatus}"`)
          .text(`Olá ${profissional.nome}, seu status como profissional foi atualizado para "${novoStatus}".`) // Futuramente, trocar para htmlView (frontend)
      })

      return response.status(200).send({ message: `Status do profissional alterado para ${novoStatus}.`, profissional })
    } catch (error) {
      return response.status(400).send({ message: 'Não foi possível atualizar o status do profissional', error })
    }
  }
}
