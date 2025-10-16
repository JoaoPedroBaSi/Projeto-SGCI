import type { HttpContext } from '@adonisjs/core/http'
import Cliente from '#models/cliente'
import { DateTime } from 'luxon'
import { storeClienteValidator, updateClienteValidator } from '#validators/validator_cliente'

export default class ClientesController {
  // Lista todos os clientes
  public async index({ response }: HttpContext) {
    try {
      const clientes = await Cliente.all()
      return response.status(200).send(clientes)
    } catch {
      return response.status(500).send({ message: 'Erro ao listar clientes' })
    }
  }

  // Retorna um cliente específico com os atendimentos associados
  public async show({ params, response }: HttpContext) {
    try {
      const cliente = await Cliente.query()
        .where({ id: params.id })
        .preload('atendimentos')
        .firstOrFail()

      return response.status(200).send(cliente)
    } catch {
      return response.status(404).send({ message: 'Cliente não encontrado' })
    }
  }

  // Cria um novo cliente
  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeClienteValidator)

      // Converte o campo dataNascimento de Date para DateTime antes de criar
      const cliente = await Cliente.create({
        ...payload,
        dataNascimento: DateTime.fromJSDate(payload.dataNascimento).toJSDate(),
      })

      return response.status(201).send(cliente)
    } catch (error) {
      console.log(error)
      return response.status(400).send({ message: 'Não foi possível criar o cliente', error })
    }
  }

  // Atualiza os dados de um cliente existente
  public async update({ request, params, response }: HttpContext) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      const payload = await request.validateUsing(updateClienteValidator)

      // Converte a data se ela existir no payload
      cliente.merge({
        ...payload,
        dataNascimento:
          payload.dataNascimento instanceof DateTime
            ? payload.dataNascimento.toJSDate()
            : payload.dataNascimento,
      })

      await cliente.save()
      return response.status(200).send(cliente)
    } catch (error) {
      console.log(error)
      return response.status(400).send({ message: 'Não foi possível atualizar o cliente', error })
    }
  }

  // Exclui um cliente existente
  public async destroy({ params, response }: HttpContext) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      await cliente.delete()
      return response.status(200).send(cliente)
    } catch {
      return response.status(404).send({ message: 'Cliente não encontrado' })
    }
  }
}
