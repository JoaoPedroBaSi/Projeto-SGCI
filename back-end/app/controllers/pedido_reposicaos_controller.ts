import type { HttpContext } from '@adonisjs/core/http'
import PedidoReposicao from '#models/pedido_reposicao'

export default class PedidoReposicaosController {
  
  // --- LISTAR (Histórico na direita da tela) ---
  public async index({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      
      const query = PedidoReposicao.query()
        .preload('inventario') // Traz os dados do item
        .orderBy('created_at', 'desc')

      // CORREÇÃO 1: Mudamos de 'perfilTipo' para 'perfil_tipo'
      // O TypeScript sugeriu isso no erro.
      if (user.perfil_tipo !== 'admin') {
        query.where('profissional_id', user.id) // Filtra só os pedidos do usuário se ele não for admin
      }

      const pedidos = await query
      
      // Formata para o front-end
      const resultado = pedidos.map((p) => ({
        id: p.id,
        // CORREÇÃO 2: Mudamos de '.item' para '.nome'
        // Baseado na sua tabela 'inventario' que tem a coluna 'nome'
        item_nome: p.inventario?.nome || 'Item removido',
        quantidade: p.quantidade,
        status: p.status,
        created_at: p.createdAt
      }))

      return response.ok(resultado)
    } catch (error) {
      console.error(error)
      return response.internalServerError({ message: 'Erro ao listar pedidos' })
    }
  }

  // --- CRIAR (Botão Solicitar) ---
  public async store({ request, auth, response }: HttpContext) {
    try {
      const data = request.only(['inventario_id', 'quantidade'])
      const user = auth.user!

      // O ID do Profissional é o mesmo do User
      const profissionalId = user.id

      const pedido = await PedidoReposicao.create({
        profissionalId: profissionalId,
        inventarioId: data.inventario_id,
        quantidade: data.quantidade,
        status: 'pendente'
      })

      return response.created(pedido)
    } catch (error) {
      console.error("ERRO NO CONTROLLER:", error)
      return response.internalServerError({ message: 'Erro ao criar pedido', error })
    }
  }
}