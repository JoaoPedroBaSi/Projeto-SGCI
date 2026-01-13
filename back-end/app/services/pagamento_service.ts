/* eslint-disable prettier/prettier */
import Transacao from '#models/transacao'
import { DateTime } from 'luxon'
import env from '#start/env' 
import axios from 'axios'

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
    formaPagamento: string
    
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

      // 1. COBRA NO ASAAS
      const resposta = await this.api.post('/payments', {
        customer: clienteAsaasId,
        billingType: formaPagamento.toUpperCase(),
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
        entidadeOrigem: 'cliente',      
        entidadeId: clienteId,          
        destinatarioTipo: 'profissional', 
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
}