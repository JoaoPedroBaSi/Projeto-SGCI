import type { HttpContext } from '@adonisjs/core/http'
import PedidoReposicao from '#models/pedido_reposicao'
import Profissional from '#models/profissional'
import User from '#models/user' // Importação necessária para o cast

export default class PedidoReposicaosController {
  
  public async index({ response }: HttpContext) {
    try {
      const pedidos = await PedidoReposicao.query()
        .preload('inventario')
        .orderBy('createdAt', 'desc') 

      return response.ok(pedidos)
    } catch (error) {
      return response.badRequest({
        message: 'Erro ao listar os pedidos de reposição.',
      })
    }
  }

  public async store({ request, response, auth }: HttpContext) {
    /**
     * CORREÇÃO: Aplicando cast para que 'user.id' seja reconhecido.
     * Sem isso, o build no Render falha com erro TS2339.
     */
    const user = auth.user as unknown as User

    try {
      const perfilProfissional = await Profissional.find(user.id)

      if (!perfilProfissional) {
        return response.forbidden({
          message: 'Apenas profissionais podem solicitar reposição.',
        })
      }
      const { inventarioId, quantidade } = request.only(['inventarioId', 'quantidade'])

      if (!inventarioId || !quantidade) {
        return response.badRequest({ message: 'Dados incompletos.' })
      }

      const novoPedido = await PedidoReposicao.create({
        inventarioId: Number(inventarioId),
        quantidade: Number(quantidade),
        profissionalId: perfilProfissional.id,
        status: 'PENDENTE', 
      })

      return response.created(novoPedido)

    } catch (error: any) {
      return response.badRequest({
        message: 'Erro ao criar solicitação de reposição.',
        error: error.message || error,
      })
    }
  }
}