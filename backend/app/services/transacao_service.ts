import Atendimento from '#models/atendimento'
import Transacao from '#models/transacao'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

interface DadosTransacaoAtendimento {
  atendimentoId: number
  userId: number 
  clienteId: number
  profissionalId: number
  valor: number
  referenciaExterna?: string
}

export class TransacaoService {
  
  public async processarConclusaoAtendimento(
    atendimento: Atendimento,
    usuarioLogado: User,
    valorPagamento: number
  ): Promise<'CONCLUIDO'> {
    try {
      
      if (!atendimento.clienteId) {
        throw new Error('Atendimento não possui um cliente vinculado.')
      }

      await this.criarTransacaoAtendimento({
        atendimentoId: atendimento.id,
        userId: usuarioLogado.id,
        clienteId: atendimento.clienteId,
        profissionalId: atendimento.profissionalId,
        valor: valorPagamento,
        referenciaExterna: 'MANUAL_SISTEMA' 
      })

      return 'CONCLUIDO'

    } catch (error) {
      console.error('Falha ao registrar transação de atendimento:', error)
      throw error 
    }
  }


  private async criarTransacaoAtendimento(dados: DadosTransacaoAtendimento) {
    await db.transaction(async (trx) => {
      
      const novaTransacao = {
        atendimentoId: dados.atendimentoId,
        userId: dados.userId,
        
        entidadeOrigem: 'clientes',
        entidadeId: dados.clienteId,
        
        destinatarioTipo: 'profissionais',
        destinatarioId: dados.profissionalId,
        
        valor: dados.valor,
        tipo: 'ENTRADA' as const, 
        finalidade: 'PAGAMENTO_ATENDIMENTO',
        status: 'CONCLUIDA' as const, 
        
        referenciaExterna: dados.referenciaExterna || null
      }

      await Transacao.create(novaTransacao, { client: trx })
    })
  }
}