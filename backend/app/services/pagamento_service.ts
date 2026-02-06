import Transacao from '#models/transacao'
import Reserva from '#models/reserva'
import { DateTime } from 'luxon'
import env from '#start/env'
import axios from 'axios'

export class PagamentoService {
  private api = axios.create({
    baseURL: env.get('ASAAS_URL'),
    headers: {
      'access_token': env.get('ASAAS_API_KEY'),
      'Content-Type': 'application/json',
    },
  })

  private readonly CLIENTE_ASAAS_PADRAO = 'cus_000007240314'

  public async iniciarCobranca(
    profissionalId: number,
    clienteId: number,
    valor: number,
    formaPagamento: string,
    atendimentoId?: number
  ) {
    try {
      const tipoAsaas = this.getBillingType(formaPagamento)

      const resposta = await this.api.post('/payments', {
        customer: this.CLIENTE_ASAAS_PADRAO,
        billingType: tipoAsaas,
        dueDate: DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd'),
        value: valor,
        description: `Consulta Profissional #${profissionalId}`,
      })

      const dadosAsaas = resposta.data
      const statusTransacao = this.traduzirStatusAsaas(dadosAsaas.status)

      const transacao = await Transacao.create({
        userId: clienteId,
        atendimentoId: atendimentoId,
        entidadeOrigem: 'clientes',
        entidadeId: clienteId,
        destinatarioTipo: 'profissionais',
        destinatarioId: profissionalId,
        valor: valor,
        tipo: 'ENTRADA',
        finalidade: `Pagamento Consulta via ${formaPagamento}`,
        status: statusTransacao,
        referenciaExterna: dadosAsaas.id,
        formaPagamento: formaPagamento as any, 
      })

      return {
        transacao,
        gateway: {
          id: dadosAsaas.id,
          invoiceUrl: dadosAsaas.invoiceUrl,
          status: dadosAsaas.status,
        },
      }
    } catch (error) {
      this.handleError(error, 'Erro ao cobrar consulta')
    }
  }

  public async iniciarCobrancaReserva(reserva: Reserva, valor: number) {
    try {
      const tipoAsaas = this.getBillingType(reserva.formaPagamento)

      const resposta = await this.api.post('/payments', {
        customer: this.CLIENTE_ASAAS_PADRAO,
        billingType: tipoAsaas,
        dueDate: DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd'),
        value: valor,
        description: `Aluguel Sala - Reserva #${reserva.id}`,
      })

      const dadosAsaas = resposta.data
      const statusTransacao = this.traduzirStatusAsaas(dadosAsaas.status)

      const transacao = await Transacao.create({
        userId: Number(reserva.profissionalId), 
        entidadeOrigem: 'profissionais',
        entidadeId: Number(reserva.profissionalId),
        destinatarioTipo: 'reservas',
        destinatarioId: Number(reserva.id),
        valor: valor,
        tipo: 'ENTRADA',
        finalidade: `Pagamento Aluguel Sala via ${reserva.formaPagamento}`,
        status: statusTransacao,
        referenciaExterna: dadosAsaas.id,
        formaPagamento: reserva.formaPagamento as any, 
      })

      return {
        transacao,
        gateway: {
          id: dadosAsaas.id,
          invoiceUrl: dadosAsaas.invoiceUrl,
          status: dadosAsaas.status,
        },
      }
    } catch (error) {
      this.handleError(error, 'Erro ao cobrar reserva')
    }
  }

  public async estornarCobranca(atendimentoId: number) {
    try {
      const transacaoOriginal = await Transacao.query()
        .where('atendimentoId', atendimentoId) 
        .where('status', 'CONCLUIDA')
        .firstOrFail()

      const resposta = await this.api.post(
        `/payments/${transacaoOriginal.referenciaExterna}/refund`,
        {
          description: `Cancelamento Atendimento #${atendimentoId}`,
        }
      )

      const dadosAsaas = resposta.data

      await Transacao.create({
        userId: transacaoOriginal.userId,
        entidadeOrigem: 'sistema', 
        entidadeId: 1,
        destinatarioTipo: 'clientes',
        destinatarioId: transacaoOriginal.userId,
        valor: transacaoOriginal.valor,
        tipo: 'SAIDA',
        finalidade: `Estorno Atendimento #${atendimentoId}`,
        status: 'CONCLUIDA', 
        referenciaExterna: dadosAsaas.id,
        formaPagamento: transacaoOriginal.formaPagamento as any,
      })

      transacaoOriginal.status = 'ESTORNADA'
      await transacaoOriginal.save()

      return { success: true, statusAsaas: dadosAsaas.status }
    } catch (error) {
      this.handleError(error, 'Erro ao estornar cobrança')
    }
  }

  private getBillingType(formaPagamento: string): string {
    const mapa: Record<string, string> = {
      PIX: 'PIX',
      BOLETO: 'BOLETO',
      CARTAO: 'CREDIT_CARD',
      CARTAO_CREDITO: 'CREDIT_CARD',
      CREDITO: 'CREDIT_CARD',
      DEBITO: 'DEBIT_CARD', 
    }

    const tipo = mapa[formaPagamento?.toUpperCase()]
    if (!tipo) {
      return 'BOLETO'
    }
    return tipo
  }

  private traduzirStatusAsaas(statusAsaas: string): 'PENDENTE' | 'CONCLUIDA' {
    if (statusAsaas === 'RECEIVED' || statusAsaas === 'CONFIRMED') {
      return 'CONCLUIDA'
    }
    return 'PENDENTE'
  }

  private handleError(error: any, contextMessage: string): never {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data?.errors?.[0]?.description || error.message
      console.error(`[ASAAS ERROR] ${contextMessage}:`, apiError)
      throw new Error(`${contextMessage}: ${apiError}`)
    }
    console.error(`[INTERNAL ERROR] ${contextMessage}:`, error)
    throw new Error(contextMessage)
  }
}