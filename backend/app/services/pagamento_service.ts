/* eslint-disable prettier/prettier */
import Transacao from '#models/transacao'
import { DateTime } from 'luxon'
import env from '#start/env'
import axios from 'axios'
import Reserva from '#models/reserva'

export class PagamentoService {

  private api = axios.create({
    baseURL: env.get('ASAAS_URL'),
    headers: {
      'access_token': env.get('ASAAS_API_KEY'),
      'Content-Type': 'application/json'
    }
  })

  public async iniciarCobranca(
    profissionalId: number,
    clienteId: number,
    valor: number,
    formaPagamento: string,
    atendimentoId?: number
  ) {
    const chave = env.get('ASAAS_API_KEY')
    console.log('--- DEBUG ---')
    console.log('Chave lida do .env:', chave ? 'SIM (Começa com ' + chave.substring(0, 5) + '...)' : 'NÃO (Está vazia!)')
    console.log('-------------')

    // ✅ CORREÇÃO: Usamos apenas o ID que você encontrou e funciona.
    // Sem duplicidade de variáveis.
    const clienteAsaasId = 'cus_000007240314'

    try {
      console.log(`[ASAAS] Processando R$ ${valor} via ${formaPagamento}...`)

      const mapaPagamento: Record<string, string> = {
        'PIX': 'PIX',
        'BOLETO': 'BOLETO',
        'CARTAO': 'CREDIT_CARD',
        'CARTAO_CREDITO': 'CREDIT_CARD',
        'CREDITO': 'CREDIT_CARD'
      }

      const tipoAsaas = mapaPagamento[formaPagamento.toUpperCase()] || 'UNDEFINED'

      if (tipoAsaas === 'UNDEFINED') {
        throw new Error(`Forma de pagamento ${formaPagamento} não suportada pelo gateway.`)
      }

      // Na chamada da API:
      const resposta = await this.api.post('/payments', {
        customer: clienteAsaasId,
        billingType: tipoAsaas, // <--- Usamos o tipo traduzido
        dueDate: DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd'),
        value: valor,
        description: `Consulta Profissional #${profissionalId}`,
      })

      const dadosAsaas = resposta.data

      let statusTransacao = 'PENDENTE'
      if (dadosAsaas.status === 'RECEIVED' || dadosAsaas.status === 'CONFIRMED') {
          statusTransacao = 'CONCLUIDA'
      }

      // 2. REGISTRA NO BANCO
      const transacao = await Transacao.create({
        userId: clienteId,
        atendimentoId: atendimentoId,
        entidadeOrigem: 'clientes',
        entidadeId: clienteId,
        destinatarioTipo: 'profissionais',
        destinatarioId: profissionalId,
        valor: valor,
        tipo: 'ENTRADA',
        finalidade: `Pagamento via ${formaPagamento}`,
        status: statusTransacao as 'PENDENTE' | 'CONCLUIDA',
        referenciaExterna: dadosAsaas.id
      })

      return {
        transacao,
        gateway: {
            id: dadosAsaas.id,
            invoiceUrl: dadosAsaas.invoiceUrl,
            status: dadosAsaas.status
        }
      }

    } catch (error) {
      console.error('[ERRO ASAAS]', error.response?.data || error.message)
      throw new Error('Erro ao comunicar com o Gateway de Pagamento')
    }
  }

  public async iniciarCobrancaReserva(reserva: Reserva, valor: number) {
    const chave = env.get('ASAAS_API_KEY')
    console.log('--- DEBUG ---')
    console.log('Chave lida do .env:', chave ? 'SIM (Começa com ' + chave.substring(0, 5) + '...)' : 'NÃO (Está vazia!)')
    console.log('-------------')

    // ✅ CORREÇÃO: Usamos apenas o ID que você encontrou e funciona.
    // Sem duplicidade de variáveis.
    const clienteAsaasId = 'cus_000007240314'

    try {
      console.log(`[ASAAS] Processando R$ ${valor} via ${reserva.formaPagamento}...`)

      // 1. COBRA NO ASAAS
      const resposta = await this.api.post('/payments', {
        customer: clienteAsaasId,
        billingType: reserva.formaPagamento.toUpperCase(),
        dueDate: DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd'),
        value: valor,
        description: `Consulta Profissional #${reserva.profissionalId}`,
      })

      const dadosAsaas = resposta.data

      let statusTransacao = 'PENDENTE'
      if (dadosAsaas.status === 'RECEIVED' || dadosAsaas.status === 'CONFIRMED') {
          statusTransacao = 'CONCLUIDA'
      }

      // 2. REGISTRA NO BANCO
      const transacao = await Transacao.create({
        userId: Number(reserva.profissionalId),
        entidadeOrigem: 'profissionais',
        entidadeId: Number(reserva.profissionalId),
        destinatarioTipo: 'reservas',
        destinatarioId: Number(reserva.id),
        valor: valor,
        tipo: 'ENTRADA',
        finalidade: `Pagamento via ${reserva.formaPagamento}`,
        status: statusTransacao as 'PENDENTE' | 'CONCLUIDA',
        referenciaExterna: dadosAsaas.id
      })

      return {
        transacao,
        gateway: {
            id: dadosAsaas.id,
            invoiceUrl: dadosAsaas.invoiceUrl,
            status: dadosAsaas.status
        }
      }

    } catch (error) {
      console.error('[ERRO ASAAS]', error.response?.data || error.message)
      throw new Error('Erro ao comunicar com o Gateway de Pagamento')
    }
  }
  public async estornarCobranca(atendimentoId: number) {
    try {
      // 1. Busca a transação original no seu banco para pegar o ID do Asaas
      const transacaoOriginal = await Transacao.query()
        .where('atendimento_id', atendimentoId) // Certifique-se que o campo existe ou use a lógica de busca correta
        .where('status', 'CONCLUIDA')
        .firstOrFail()

      console.log(`[ASAAS] Solicitando estorno para a transação: ${transacaoOriginal.referenciaExterna}`)

      // 2. Chama a API do Asaas para estornar
      // O Asaas permite passar um 'value' se o estorno for parcial,
      // mas aqui faremos o estorno TOTAL.
      const resposta = await this.api.post(`/payments/${transacaoOriginal.referenciaExterna}/refund`, {
        description: `Estorno de atendimento #${atendimentoId} - Cancelado pelo profissional.`
      })

      const dadosAsaas = resposta.data

      // 3. Registra uma transação de SAÍDA no seu banco para auditoria
      await Transacao.create({
        userId: transacaoOriginal.userId,
        entidadeOrigem: 'sistema',
        entidadeId: 1, // ID do sistema/administrador
        destinatarioTipo: 'clientes',
        destinatarioId: transacaoOriginal.userId,
        valor: transacaoOriginal.valor,
        tipo: 'SAIDA', // Agora é uma saída (estorno)
        finalidade: `Estorno Atendimento #${atendimentoId}`,
        status: 'CONCLUIDA',
        referenciaExterna: dadosAsaas.id
      })

      // 4. Atualiza a transação original para 'ESTORNADA' (opcional, mas recomendado)
      transacaoOriginal.status = 'ESTORNADA'
      await transacaoOriginal.save()

      return { success: true, statusAsaas: dadosAsaas.status }

    } catch (error) {
      console.error('[ERRO ESTORNO ASAAS]', error.response?.data || error.message)
      throw new Error('Falha ao processar estorno no gateway')
    }
  }
}
