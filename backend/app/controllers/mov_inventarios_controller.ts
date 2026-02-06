import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import MovimentacaoInventario from '#models/movimentacao_inventario'
import Inventario from '#models/inventario'
import { storeMovInventarioValidator } from '#validators/validator_mov_inventario'

export default class MovInventariosController {
  
  public async index({ response }: HttpContext) {
    const movimentacoes = await MovimentacaoInventario.query()
      .preload('inventario')
      .preload('user') // CORREÇÃO: No Model mudamos para 'user'
      .orderBy('createdAt', 'desc')

    return response.ok(movimentacoes)
  }

  public async store({ request, response, auth }: HttpContext) {
    const user = auth.user!
    
    try {
      const dados = await request.validateUsing(storeMovInventarioValidator)
      
      // CORREÇÃO: Usando inventarioId (CamelCase)
      const item = await Inventario.findOrFail(dados.inventarioId)

      if (dados.tipo === 'SAIDA' && item.quantidade < dados.quantidade) {
        return response.badRequest({
          message: `Quantidade insuficiente. Disponível: ${item.quantidade}`,
        })
      }

      const resultado = await db.transaction(async (trx) => {
        if (dados.tipo === 'ENTRADA') {
          item.quantidade += dados.quantidade
        } else {
          item.quantidade -= dados.quantidade
        }

        item.useTransaction(trx)
        await item.save()

        const movimentacao = await MovimentacaoInventario.create({
          inventarioId: dados.inventarioId,
          userId: user.id, 
          tipo: dados.tipo,
          quantidade: dados.quantidade,
          observacao: dados.observacao || null,
        }, { client: trx })

        return { movimentacao, novo_estoque: item.quantidade }
      })

      return response.created({
        message: 'Movimentação registrada com sucesso!',
        movimentacao: resultado.movimentacao,
        novo_estoque: resultado.novo_estoque,
      })

    } catch (error: any) {
      console.error(error)
      return response.badRequest({
        message: 'Não foi possível registrar a movimentação.',
        error: error.message || error,
      })
    }
  }
}