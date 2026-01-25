import { HttpContext } from '@adonisjs/core/http'
import PedidoReposicao from '#models/pedido_reposicao'
import Profissional from '#models/profissional'

export default class PedidoReposicaosController {
  public async index({ response }: HttpContext) {
    try {
      const consulta = await PedidoReposicao.query()
        .preload('inventario')
        .orderBy('created_at', 'desc')
      return response.status(200).send(consulta)
    } catch (error) {
      console.error('Erro ao listar pedidos:', error)
      return response.status(500).send({
        message: 'Erro ao listar os pedidos',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }
  }

  public async store({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'Acesso negado.' })
      }

      // Busca o profissional pelo ID do usuário
      const perfilProfissional = await Profissional.find(user.id)

      if (!perfilProfissional) {
        return response.forbidden({
          message: 'Apenas profissionais podem solicitar reposição',
        })
      }

      // 1. AJUSTE AQUI: Mude os nomes para bater com o Model
      const dados = await request.only(['inventarioId', 'idInventario', 'quantidade'])

      // 2. AJUSTE AQUI: Use profissionalId e inventarioId
      const novoPedido = await PedidoReposicao.create({
        // Se vier como inventarioId use ele, se não, tente idInventario
        inventarioId: dados.inventarioId || dados.idInventario,
        quantidade: dados.quantidade,
        profissionalId: perfilProfissional.id,
        status: 'pendente',
      })

      return response.created(novoPedido)
    } catch (error) {
      console.error('ERRO AO CRIAR PEDIDO:', error)
      return response.status(500).send({
        message: 'Erro ao criar um novo pedido',
        debug: error.message,
      })
    }
  }
}
