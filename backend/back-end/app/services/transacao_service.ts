import Transacao from '#models/transacao';
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from "@adonisjs/lucid/types/database";
export class TransacaoService {
  public async criarTransacaoAtendimento (userId: Number, clienteId: Number, profissionalId: Number, valorPagamento: Number) {
    await db.transaction(async (trx: TransactionClientContract) => {
      //Independente do status de pagamento após o gateway, faz a inserção na tabela de Transacoes
      const dadosTransacao = {
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
          referenciaExterna: 'TESTE' //gateway.id
      }

      await Transacao.create(dadosTransacao, { client: trx });

    })
  }
}