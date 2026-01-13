import type { HttpContext } from '@adonisjs/core/http'
import MovimentacaoInventario from '#models/movimentacao_inventario'
import Inventario from '#models/inventario'
import { storeMovInventarioValidator } from '#validators/validator_mov_inventario'

export default class MovInventariosController {
  public async index({ response }: HttpContext) {
    try {
      const movimentacaoInventario = await MovimentacaoInventario.query()
        .preload('inventario')
        .preload('profissional')
        .orderBy('createdAt', 'desc')
      return response.status(200).send(movimentacaoInventario)
    } catch (error) {
      return response
        .status(500)
        .send({ message: 'Erro ao listar as movimentações de inventário', error })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const movimentacaoInventario = await MovimentacaoInventario.query()
        .where('id', params.id)
        .firstOrFail()
      return response.status(200).send(movimentacaoInventario)
    } catch (error) {
      return response
        .status(404)
        .send({ message: 'Movimentação de inventário não encontrada', error })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const dados = await request.validateUsing(storeMovInventarioValidator)

      // Função para ajustar a quantidade de itens no inventário conforme a movimentação
      const item = await Inventario.findOrFail(dados.inventario_id)
      // Após buscar nos dados da movimentação, ela verifica se é uma movimentação de entrada ou saída
      if (dados.tipo === 'ENTRADA') {
        item.quantidade += dados.quantidade
        // se for entrada, adiciona a quantidade ao inventário
      } else {
        if (item.quantidade < dados.quantidade) {
          // se for saída, verifica se há quantidade suficiente no inventário, se não houver, retorna uma bad request
          return response.badRequest({
            message: `Quantidade insuficiente no inventário para realizar a saída. Disponível: ${item.quantidade}`,
          })
        }

        // se houver quantidade suficiente, subtrai a quantidade do inventário
        item.quantidade -= dados.quantidade
      }
      await item.save()
      const movimentacao = await MovimentacaoInventario.create(dados)

      return response.status(201).send({ movimentacao, novo_estoque: item.quantidade })
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Não foi possível cadastrar a movimentação de inventário', error })
    }
  }
}

// Não coloquei update nem destroy, pois não encontrei sentido em atualizar uma movimentação já existente
// E também não acho recomendado apagar movimentações de inventário, pois isso poderia comprometer o controle do estoque
