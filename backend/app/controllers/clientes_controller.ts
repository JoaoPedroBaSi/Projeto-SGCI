import type { HttpContext } from '@adonisjs/core/http'
import Cliente from '#models/cliente'
import { DateTime } from 'luxon'
import { storeClienteValidator, updateClienteValidator } from '#validators/validator_cliente'

export default class ClientesController {
  // Lista todos os clientes
  public async index({ auth, response }: HttpContext) {
  const user = await auth.authenticate()

  // Se o usuário logado for um CLIENTE, ele vê apenas o próprio perfil
  if (user.perfil_tipo === 'cliente') {
    const cliente = await Cliente.query().where('id', user.id).first()
    if (!cliente) return response.notFound({ message: 'Perfil não encontrado' })
    return response.ok(cliente)
  }

  // Se for PROFISSIONAL ou ADMIN, ele pode ver a lista de clientes para o Dashboard
  const clientes = await Cliente.all()
  return response.ok(clientes)
}

  // Retorna um cliente específico com os atendimentos associados
  public async show({ params, response }: HttpContext) {
    try {
      const cliente = await Cliente.query()
        .where({ id: params.id })
        .preload('user')
        .preload('atendimentos')
        .firstOrFail()

      return response.status(200).send(cliente)
    } catch {
      return response.status(404).send({ message: 'Cliente não encontrado' })
    }
  }

  // Cria um novo cliente
  public async store({ request, auth, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeClienteValidator)

      // Converte o campo dataNascimento de Date para DateTime antes de criar
      const cliente = await Cliente.create({
        ...payload,
        id: auth.user!.id,
        dataNascimento: DateTime.fromJSDate(payload.dataNascimento),
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
        dataNascimento: payload.dataNascimento
          ? DateTime.fromJSDate(payload.dataNascimento)
          : cliente.dataNascimento,
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
