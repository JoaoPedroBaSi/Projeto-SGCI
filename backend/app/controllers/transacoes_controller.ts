import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Transacao from '#models/transacao'
import { storeTransacaoValidator } from '#validators/validator_transacao'
import { PagamentoService } from '#services/pagamento_service'

@inject()
export default class TransacoesController {
  
  constructor(protected pagamentoService: PagamentoService) {}

  public async index({ response }: HttpContext) {
    const transacoes = await Transacao.all()
    return response.ok(transacoes)
  }

  public async show({ params, response }: HttpContext) {
    try {
      const transacao = await Transacao.findOrFail(params.id)
      return response.ok(transacao)
    } catch {
      return response.notFound({ message: 'Transação não encontrada.' })
    }
  }

  public async store({ auth, request, response }: HttpContext) {
    const usuarioLogado = auth.user!
    
    if (usuarioLogado.perfilTipo !== 'admin') {
      return response.forbidden({ message: 'Apenas administradores podem registrar transações manuais.' })
    }

    try {
      const dados = await request.validateUsing(storeTransacaoValidator)
      const transacao = await Transacao.create(dados)
      
      return response.created({ message: 'Transação registrada com sucesso!', data: transacao })
    } catch (error: any) {
      return response.badRequest({ message: 'Erro ao registrar transação.', error: error.message || error })
    }
  }

  public async realizarPagamento({ auth, request, response }: HttpContext) {
    const cliente = auth.user!
    const { profissionalId, valor, formaPagamento } = request.only(['profissionalId', 'valor', 'formaPagamento'])

    if (!profissionalId || !valor || !formaPagamento) {
        return response.badRequest({ message: 'Dados incompletos (profissionalId, valor, formaPagamento são obrigatórios).' })
    }

    try {
        const transacao = await this.pagamentoService.iniciarCobranca(
            profissionalId,
            cliente.id,
            valor,
            formaPagamento
        )

        return response.ok({
            message: 'Processamento de pagamento iniciado!',
            transacao: transacao
        })

    } catch (error: any) {
        return response.badRequest({ 
          message: 'Erro ao processar pagamento.', 
          error: error.message || error 
        })
    }
  }

  public async contarSaldo({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    let saldoTotal = 0

    try {
      if (user.perfilTipo === 'cliente') {
        const resultado = await Transacao.query()
          .where('entidadeId', user.id) 
          .where('status', 'CONCLUIDA')
          .sum('valor as total')
          .first()

        saldoTotal = resultado?.$extras.total || 0
      } else {
        const resultado = await Transacao.query()
          .where('destinatarioId', user.id) 
          .where('status', 'CONCLUIDA')
          .sum('valor as total')
          .first()

        saldoTotal = resultado?.$extras.total || 0
      }

      return response.ok({ saldoTotal: Number(saldoTotal) })
    } catch (error) {
      return response.badRequest({ message: 'Erro ao calcular saldo.' })
    }
  }
}