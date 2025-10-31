import type { HttpContext } from '@adonisjs/core/http'
import Inventario from '#models/inventario'
import {
  storeInventarioValidator,
  updateInventarioValidator,
} from '#validators/validator_inventario'

export default class InventariosController {
  public async index({ response }: HttpContext) {
    try {
      const inventario = await Inventario.query().orderBy('nome', 'asc')
      return response.status(200).send(inventario)
    } catch (error) {
      return response.status(500).send({ message: 'Erro ao listar itens do inventário', error })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const inventario = await Inventario.query().where('id', params.id).firstOrFail()
      return response.status(200).send(inventario)
    } catch (error) {
      return response.status(404).send({ message: 'Item não encontrado no inventário.', error })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const dados = await request.validateUsing(storeInventarioValidator)
      const inventario = await Inventario.create(dados)
      return response.status(201).send(inventario)
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Não foi possível criar o item no inventário', error })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const inventario = await Inventario.findOrFail(params.id)
      const dados = await request.validateUsing(updateInventarioValidator)

      inventario.merge(dados)
      await inventario.save()

      return response.status(200).send(inventario)
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Não foi possível atualizar o inventario', error })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const inventario = await Inventario.findOrFail(params.id)
      await inventario.delete()
      return response.status(200).send(inventario)
    } catch (error) {
      return response
        .status(404)
        .send({ message: 'Não foi possível encontrar o item no inventário para deletá-lo', error })
    }
  }
}
