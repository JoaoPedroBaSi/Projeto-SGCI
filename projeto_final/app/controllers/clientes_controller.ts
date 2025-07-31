import type { HttpContext } from '@adonisjs/core/http'
import Cliente from '#models/cliente'
import { storeClienteValidator } from '#validators/store_cliente'
import { updateClienteValidator } from '#validators/update_cliente'

export default class ClientesController {
  public async index({}: HttpContext) {
    // Testado
    // Lista todos os clientes
    return await Cliente.all()
  }

  public async show({ params, response }: HttpContext) {
    // Testado
    // Retorna um cliente específico com os atendimentos associados
    // Se não encontrar, retorna 404
    const cliente = await Cliente.query().where({ id: params.id }).preload('atendimentos').first()
    if (cliente) return cliente
    else return cliente ?? response.status(404)
  }

  public async store({ request, response }: HttpContext) {
    // Testado
    // Cria um novo cliente e valida os dados de entrada
    const payload = await request.validateUsing(storeClienteValidator)
    const cliente = await Cliente.create(payload)
    return response.status(201).send(cliente)
  }

  public async update({ request, params, response }: HttpContext) {
    // Testado
    // Atualiza os dados de um cliente existente após a validação
    const payload = await request.validateUsing(updateClienteValidator)
    const cliente = await Cliente.findOrFail(params.id)

    cliente.merge(payload)
    await cliente.save()
    return response.send(cliente)
  }

  public async destroy({ params }: HttpContext) {
    // Testado
    // Exclui um cliente existente
    const cliente = await Cliente.findOrFail(params.id)
    await cliente.delete()
    return cliente
  }
}
