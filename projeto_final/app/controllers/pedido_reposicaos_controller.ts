import { HttpContext } from '@adonisjs/core/http'
import PedidoReposicao from '#models/pedido_reposicao'
import Profissional from '#models/profissional'



export default class PedidoReposicaosController {
    public async index({ response }: HttpContext) {
        try {
            const consulta = await PedidoReposicao.all()
            return response.status(200).send(consulta)
        } catch {
            return response.status(500).send({
                message: 'Erro ao listar os pedidos'
            })
        }
    }
    
    public async store({ request, response, auth }: HttpContext) {
        try {
            // Primeiro quem está logado(usuario)
            const idUsuarioLogado = auth.user?.id
            // Verifica se o id do usuario existe
            if(!idUsuarioLogado) {
                return response.unauthorized({
                    message: 'Acesso não autorizado. Faça login novamente.'
                })
            } 
            const perfilProfissional = await Profissional.findBy('userId', idUsuarioLogado)

            if(perfilProfissional === null) {
                return response.forbidden({
                    message: 'Apenas profissionais podem solicitar reposição'
                })
            }
            const dados = await request.only(['idInventario', 'quantidade'])

            const dadosParaSalvar = {
                ...dados,
                // primeiro o nome que tá na coluna e depois o id do profissional que conseguiu aqui na validação
                idProfissional: perfilProfissional?.id,
            }

            const novoPedido = await PedidoReposicao.create(dadosParaSalvar)
            return response.created(novoPedido)

        } catch {
            return response.status(500).send({
                message: 'Erro ao criar um novo pedido'
            })
        }

    }

}