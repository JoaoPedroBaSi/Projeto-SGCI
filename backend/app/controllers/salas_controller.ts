import type { HttpContext } from '@adonisjs/core/http'
import Sala from '#models/sala'
import { storeSalaValidator, updateSalaValidator } from '#validators/validator_sala'

export default class SalasController {
  
  public async index({ response }: HttpContext) {
    const salas = await Sala.all()
    return response.ok(salas)
  }

  public async show({ params, response }: HttpContext) {
    try {
      const sala = await Sala.findOrFail(params.id)
      return response.ok(sala)
    } catch {
      return response.notFound({ message: 'Sala não encontrada.' })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeSalaValidator)
      const sala = await Sala.create(payload)
      
      return response.created(sala)
    } catch (error: any) {
      return response.badRequest({ 
        message: 'Não foi possível cadastrar a sala.', 
        error: error.message || error 
      })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const sala = await Sala.findOrFail(params.id)
      const payload = await request.validateUsing(updateSalaValidator)

      sala.merge(payload)
      await sala.save()
      
      return response.ok(sala)
    } catch (error: any) {
      return response.badRequest({ 
        message: 'Não foi possível atualizar a sala.',
        error: error.message || error
      })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const sala = await Sala.findOrFail(params.id)
      await sala.delete()
      
      return response.ok({ message: 'Sala removida com sucesso.', data: sala })
    } catch {
      return response.notFound({ message: 'Sala não encontrada.' })
    }
  }
}