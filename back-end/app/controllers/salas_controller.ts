import type { HttpContext } from '@adonisjs/core/http'
import Sala from '#models/sala'
import { storeSalaValidator, updateSalaValidator } from '#validators/validator_sala'

export default class SalasController {
  // Testado
  // Lista todas as salas
  public async index({}: HttpContext) {
    return await Sala.all()
  }

  // Testado
  // Retorna uma sala específica com o profissional associado
  // Se não encontrar, retorna 404
  public async show({ params, response }: HttpContext) {
    const sala = await Sala.query().where({ id: params.id }).preload('profissional').first()
    if (sala) return sala
    else return response.status(404).send({ message: 'Sala não encontrada' })
  }

  // Testado
  // Cria uma nova sala e valida os dados de entrada
  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(storeSalaValidator)
    const sala = await Sala.create(payload)
    return response.status(201).send(sala)
  }

  // Testado
  // Atualiza uma sala existente após validar os dados de entrada
  public async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateSalaValidator)

    const sala = await Sala.findOrFail(params.id)
    sala.merge(payload)
    await sala.save()
    return response.status(200).send(sala)
  }

  // Testado
  // Exclui uma sala específica
  public async destroy({ params }: HttpContext) {
    const sala = await Sala.findOrFail(params.id)
    await sala.delete()
    return sala
  }
}
