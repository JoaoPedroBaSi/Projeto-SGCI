import Atendimento from '#models/atendimento'
import Cliente from '#models/cliente'
import Transacao from '#models/transacao'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
export class TransacaoService {
  public async processarConclusaoAtendimento(
    atendimento: Atendimento,
    usuarioLogado: User,
    valorPagamento: number
  ): Promise<'CONCLUIDO'> {
    // Retorna o status de sucesso

    try {
      // Busca do Cliente (transferida do Controller)
      const cliente = await Cliente.query().where('id', atendimento.clienteId).first()
      if (!cliente) {
        // Lança um erro que será pego pelo catch no Controller
        throw new Error('Não foi possível encontrar o cliente para registrar a transação.')
      }

      // O Service sabe quem está registrando (usuarioLogado.id), quem é o cliente (cliente.id) e o valor.
      await this.criarTransacaoAtendimento(
        usuarioLogado.id,
        cliente.id,
        atendimento.profissionalId,
        valorPagamento,
        atendimento.id
      )
      return 'CONCLUIDO' // Retorna o status de sucesso
    } catch (error) {
      // O erro deve ser logado e depois relançado
      //console.error('Falha ao criar Transação ou Enviar Recibo:', error)

      // Se houver falha, você pode registrar uma transação com status 'FALHOU' aqui se quiser manter o histórico de tentativas.
      // ...this.criarTransacaoFalha(...)

      // Lança a exceção para que o Controller a pegue e defina o status_pagamento = 'NEGADO'
      throw error // Relança a exceção
    }
  }
  public async criarTransacaoAtendimento(
    atendimentoId: Number,
    userId: Number,
    clienteId: Number,
    profissionalId: Number,
    valorPagamento: Number
  ) {
    await db.transaction(async (trx: TransactionClientContract) => {
      //Independente do status de pagamento após o gateway, faz a inserção na tabela de Transacoes
      const dadosTransacao = {
        atendimentoId: Number(atendimentoId),
        userId: Number(userId),
        entidadeOrigem: 'clientes',
        entidadeId: Number(clienteId),
        destinatarioTipo: 'profissionais',
        destinatarioId: Number(profissionalId),
        valor: Number(valorPagamento),
        tipo: 'ENTRADA' as const,
        finalidade: 'PAGAMENTO_ATENDIMENTO',
        //Coloquei um valor genérico no 'status' para testar. O status que será
        //passado, será o status após o processo do gateway
        //status: 'CONCLUIDA' as const,
        status: 'CONCLUIDA' as const,
        referenciaExterna: 'TESTE', //gateway.id
      }

      await Transacao.create(dadosTransacao, { client: trx })
    })
  }
}
