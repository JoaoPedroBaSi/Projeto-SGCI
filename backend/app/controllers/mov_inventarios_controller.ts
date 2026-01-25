import type { HttpContext } from '@adonisjs/core/http'
import MovimentacaoInventario from '#models/movimentacao_inventario'
import Inventario from '#models/inventario'
import { storeMovInventarioValidator } from '#validators/validator_mov_inventario'

export default class MovInventariosController {
  public async index({ response }: HttpContext) {
    try {
      const movimentacoes = await MovimentacaoInventario.query()
        .preload('inventario')
        .preload('usuario')
        .orderBy('created_at', 'desc')

      return response.status(200).send(movimentacoes)
    } catch (error) {
      console.error('ERRO NO INDEX DE MOVIMENTAÇÃO:', error)

      return response.status(500).send({
        message: 'Erro ao listar as movimentações',
        error: error.message,
      })
    }
  }

  public async store({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user!

      const dados = await request.validateUsing(storeMovInventarioValidator)

      const item = await Inventario.findOrFail(dados.inventario_id)

      if (dados.tipo === 'ENTRADA') {
        item.quantidade += dados.quantidade
      } else {
        if (item.quantidade < dados.quantidade) {
          return response.badRequest({
            message: `Quantidade insuficiente no inventário. Disponível: ${item.quantidade}`,
          })
        }
        item.quantidade -= dados.quantidade
      }

      await item.save()

      const movimentacao = await MovimentacaoInventario.create({
        inventarioId: dados.inventario_id,
        profissionalId: user.id,
        tipo: dados.tipo,
        quantidade: dados.quantidade,
        observacao: dados.observacao,
      })

      return response.status(201).send({
        message: 'Movimentação registrada com sucesso!',
        movimentacao,
        novo_estoque: item.quantidade,
      })
    } catch (error) {
      console.error('ERRO NO STORE DE MOVIMENTAÇÃO:', error)

      return response.status(error.status || 400).send({
        message: 'Não foi possível cadastrar a movimentação',
        error: error.messages || error.message,
      })
    }
  }
}
