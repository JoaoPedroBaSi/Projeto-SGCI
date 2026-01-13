/* eslint-disable prettier/prettier */
import Transacao from '#models/transacao'
import type { HttpContext } from '@adonisjs/core/http'
import { storeTransacaoValidator } from '#validators/validator_transacao'
import { PagamentoService } from '#services/pagamento_service'

export default class TransacoesController {

    // ============================================================
    // 🆕 MÉTODOS NOVOS (Para a Tela de Pagamento do Profissional)
    // ============================================================

    // 1. Busca as dívidas pendentes e o histórico
    public async minhasDividas({ auth, response }: HttpContext) {
        const user = auth.user!

        try {
            // Busca cobranças PENDENTES
            const pendentes = await Transacao.query()
                .where('user_id', user.id)
                .where('status', 'PENDENTE')
                .orderBy('created_at', 'asc')

            // Busca histórico de CONCLUÍDAS (Antigo "PAGO")
            // CORREÇÃO: Mudado de 'PAGO' para 'CONCLUIDA' para bater com o Model
            const historico = await Transacao.query()
                .where('user_id', user.id)
                .where('status', 'CONCLUIDA') 
                .orderBy('updated_at', 'desc')
                .limit(10)

            return response.ok({ pendentes, historico })
        } catch (error) {
            console.error("Erro ao buscar minhas finanças:", error)
            return response.internalServerError({ message: 'Erro ao buscar dados financeiros.' })
        }
    }

    // 2. Processa o pagamento de uma transação específica
    public async pagar({ params, auth, response }: HttpContext) {
        const user = auth.user!
        const idTransacao = params.id

        try {
            // Busca a transação e garante que pertence ao usuário logado
            const transacao = await Transacao.query()
                .where('id', idTransacao)
                .where('user_id', user.id)
                .firstOrFail()

            // CORREÇÃO: Mudado de 'PAGO' para 'CONCLUIDA'
            if (transacao.status === 'CONCLUIDA') {
                return response.badRequest({ message: 'Esta conta já foi paga.' })
            }

            // Atualiza status
            // CORREÇÃO: Mudado de 'PAGO' para 'CONCLUIDA'
            transacao.status = 'CONCLUIDA'
            await transacao.save()

            return response.ok({ message: 'Pagamento confirmado com sucesso!', transacao })
        } catch (error) {
            return response.badRequest({ message: 'Erro ao processar pagamento. Transação não encontrada ou inválida.' })
        }
    }

    // ============================================================
    // 📦 MÉTODOS ANTIGOS (Mantidos para compatibilidade)
    // ============================================================

    public async index ({ auth, response } : HttpContext) {
        try {
            const user = auth.user
            if (!user) return response.unauthorized()

            // Busca todas as transações do usuário (Geral)
            const transacoes = await Transacao.query()
                .where('user_id', user.id) 
                .orderBy('created_at', 'desc')

            return response.ok(transacoes)
        } catch (error) {
            console.error("Erro ao buscar financeiro:", error)
            return response.internalServerError({ message: 'Erro ao buscar transações.' })
        }
    }

    public async show ({ params } : HttpContext) {
      return await Transacao.query().where('id', params.id).first()
    }
    
    public async store ({ auth, request, response } : HttpContext) {
      try{
        const usuarioLogado = auth.user!;
        const dados = await request.validateUsing(storeTransacaoValidator)
        const adminLogado = usuarioLogado.perfil_tipo === 'admin'
        
        if (!adminLogado) return response.forbidden('Apenas administradores podem criar cobranças.')
        
        await Transacao.create(dados)
        return response.status(200).send('Transação registrada com sucesso!')
        } catch (error) {
          return response.status(500).send('Erro ao registrar transação.')
        }
    }

    public async realizarPagamento({ auth, request, response }: HttpContext) {
        const cliente = auth.user!
        const dados = request.only(['profissionalId', 'valor', 'formaPagamento'])
        
        if (!dados.valor || !dados.formaPagamento) {
            return response.badRequest({ message: 'Dados incompletos para pagamento.' })
        }

        const service = new PagamentoService()

        try {
            const transacao = await service.iniciarCobranca(
                dados.profissionalId || 0,
                cliente.id,    
                dados.valor,
                dados.formaPagamento
            )

            return response.ok({
                message: 'Processamento de pagamento iniciado!',
                transacao: transacao
            })

        } catch (error) {
            console.error(error)
            return response.badRequest({ message: 'Erro ao processar pagamento.' })
        }
    }
}