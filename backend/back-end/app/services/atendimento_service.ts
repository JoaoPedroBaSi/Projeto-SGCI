import Disponibilidade from "#models/disponibilidade"
import Atendimento from "#models/atendimento"
import db from "@adonisjs/lucid/services/db"
import { TransactionClientContract } from "@adonisjs/lucid/types/database"
import { DateTime } from 'luxon'
export class AtendimentoService {
  public async criarAtendimento(dados: any, salaReservadaId: number, dataHoraInicioLuxon: DateTime, dataHoraFimLuxon: DateTime, disponibilidadeId: number) {
    await db.transaction(async (trx: TransactionClientContract) => {
            // Criando uma variável/objeto, responsável por armazenar os valores criados para o atendimento
            const atendimentoData = {
                profissionalId: dados.profissional_id,
                clienteId: dados.cliente_id,
                salaId: salaReservadaId,
                observacoes: dados.observacoes,
                formaPagamento: dados.forma_pagamento,
                dataHoraInicio: dataHoraInicioLuxon,
                dataHoraFim: dataHoraFimLuxon,
            }
            
            //Cria/Agenda o atendimento, passando o client: trx
            //Model.create() aceita a opção { client: trx } para usar a transação
            await Atendimento.create(atendimentoData, { client: trx })

            //Salva o novo status do slot da disponibilidade
            //O Model.query() ou db.query() deve receber o { client: trx } para usar a transação
            await Disponibilidade.query({ client: trx })
                .where('id', disponibilidadeId) // Usa o ID do slot
                .update({ status: 'OCUPADO' })

            //Não precisa de trx.commit() ou trx.rollback(). O db.transaction com callback faz isso automaticamente (Managed Transaction).
        })
  }

  public async temDisponibilidade(profissional_id: number, data_hora_inicio: DateTime): Promise<Disponibilidade | null> {
    //Faz a procura pelas informações da disponibilidade
    //Traz as disponibilidades de um profissional específico, a partir da tentativa de inserção
    //Na tabela de Atendimento. Depois disso, com os dados da disponibilidade do profissional
    //Da qual o cliente tá querendo se relacionar via atendimento, verifica a disponibilidade
    const horaConvertidaSql = data_hora_inicio.toSQL()

    if (!horaConvertidaSql) {
        console.error('Data hora de início é inválida após validação:', data_hora_inicio.invalidExplanation);
        return null;
    }
    
    const disponibilidade = await Disponibilidade
        .query()
        .where('profissional_id', profissional_id)
        .where('data_hora_inicio', horaConvertidaSql)
        .first()

    return disponibilidade
  }
  //Obs: o parametro "ignorarId" é opcional, já que somente é necessário para a operação de update
  public async temConflito(profissional_id: number, data_hora_inicio: DateTime, data_hora_fim: DateTime, ignorarId?: number){
    //Verifca se os valores passados (DateTime), são válidos
    if (!data_hora_inicio.isValid || !data_hora_fim.isValid) {
        console.error('Data(s) inválida(s) no Service. Abortando consulta.');
        return null;
    }

    //Converte para SQL para garantir que o query ocorra bem
    const inicioSQL = data_hora_inicio.toSQL()
    const fimSQL = data_hora_fim.toSQL()
    
    if (!inicioSQL || !fimSQL) {
         return null; 
    }

    //Busca atendimentos que estão no mesmo dia, com o mesmo profissional e que tem conflito de horário.
    const conflito = await Atendimento.query()
        .where('profissional_id', profissional_id)
        //Esse trecho só é executado se encontrar o "ignorarId"
        .if(ignorarId, (query) => {
        query.whereNot('id', ignorarId!)
        })
        .where((query) => {
            //Nessa parte, verifica se o horário de começo e fim e do atendimento entra
            //em interseção com outra consulta.
            query.where('data_hora_inicio', '<', fimSQL)
                .andWhere('data_hora_fim', '>', inicioSQL)
        })
        .first()

    return conflito
  }
}