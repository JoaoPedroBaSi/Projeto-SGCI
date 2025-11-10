import Cliente from "#models/cliente"
import Profissional from "#models/profissional"
import Transacao from "#models/transacao"
import { DateTime } from "luxon"

export class PagamentoService {
  public async iniciarCobranca(profissionalId: number, clienteId: number, valor: number, formaPagamento: string) {
        
        let transacaoData = {
            profissionalId: profissionalId,
            clienteId: clienteId,
            valor: valor,
            formaPagamento: formaPagamento,
            status: 'PENDENTE' as const, // Status inicial
            dataHoraTransacao: DateTime.now()
        }

        if (formaPagamento === 'BOLETO') {
            //Lógica para chamar a API do banco/gateway para gerar o boleto
            //const linkBoleto = await this.gateway.gerar(transacaoData) 

            //Registra a transação como PENDENTE
            const transacao = await Transacao.create(transacaoData)
            
            //Lógica para enviar o boleto ao cliente
            //this.emailService.enviar(linkBoleto, clienteId)
            
            return transacao // Retorna a transação pendente
            
        } else if (formaPagamento === 'DEBITO' || formaPagamento === 'DINHEIRO' || formaPagamento === 'PIX') {
            //Pagamento Presencial: A transação deve ser registrada como PAGA IMEDIATAMENTE
            //transacaoData.status = 'PAGO' as const
            const transacao = await Transacao.create(transacaoData)
            return transacao

        } else {
            //Outras formas de pagamento...
        }
    }
  public async etapaPagamento(){
    //Aqui irá chamar o gateway
    //Acontecerá a mudança do status_pagamento, de acordo com a etapa que se encontra
    //Depois que status_pagamento = 'CONCLUIDO', 
    //gera o boleto e cria um registro na tabela 'Transação'
  }
  public async gerarBoleto(profissional_id: number, cliente_id: number, valor_atendimento: number) {
    const cliente = await Cliente.query().where('id', Number(cliente_id)).first()
    const profissional = await Profissional.query().where('id', Number(profissional_id)).first()

    if (valor_atendimento){          
      //Informações para serem passadas no recibo
      cliente?.id
      cliente?.nome //Nome do cliente
      cliente?.cpf //CPF do cliente
      valor_atendimento //Valor da consulta
      DateTime.now() //Data da geração do recibo
      profissional?.nome //Nome do profissional
      profissional?.id //Id do profissional

      //talvez informações do atendimento

      return 'Boleto gerado com sucesso.'
      }
      return 'Não foi possível gerar o boleto.'
  }


}