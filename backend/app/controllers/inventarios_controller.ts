import type { HttpContext } from '@adonisjs/core/http'
import Inventario from '#models/inventario'
import { storeInventarioValidator, updateInventarioValidator } from '#validators/validator_inventario'

export default class InventariosController {
  
  public async index({ response }: HttpContext) {
    const inventario = await Inventario.query().orderBy('nome', 'asc')
    return response.ok(inventario)
  }

  public async show({ params, response }: HttpContext) {
    try {
      const inventario = await Inventario.query()
        .where('id', params.id)
        .firstOrFail()

      return response.ok(inventario)
    } catch {
      return response.notFound({ message: 'Item não encontrado no inventário.' })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const dados = await request.validateUsing(storeInventarioValidator)

      // CORREÇÃO: Removido o DateTime.fromJSDate pois 'dados.validade' já é um DateTime
      const inventario = await Inventario.create(dados)
      
      return response.created(inventario)

    } catch (error: any) {
      return response.badRequest({ 
        message: 'Não foi possível criar o item no inventário', 
        error: error.message || error 
      })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const inventario = await Inventario.findOrFail(params.id)
      const dados = await request.validateUsing(updateInventarioValidator)

      // CORREÇÃO: 'merge' aceita os 'dados' diretamente porque os tipos já batem
      inventario.merge(dados)
      await inventario.save()

      return response.ok(inventario)
    } catch (error: any) {
      return response.badRequest({ 
        message: 'Não foi possível atualizar o inventário', 
        error: error.message || error 
      })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const inventario = await Inventario.findOrFail(params.id)
      await inventario.delete()
      
      return response.ok({ message: 'Item removido com sucesso.', data: inventario })
    } catch {
      return response.notFound({ message: 'Item não encontrado para exclusão.' })
    }
  }
}