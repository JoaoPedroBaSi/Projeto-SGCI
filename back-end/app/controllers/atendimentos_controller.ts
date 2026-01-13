/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Atendimento from '#models/atendimento'
//import Disponibilidade from '#models/disponibilidade'
import Cliente from '#models/cliente'
import Sala from '#models/sala'
//import Transacao from '#models/transacao'
import { storeAtendimentoValidator } from '#validators/validator_atendimento'
import { updateAtendimentoValidator } from '#validators/validator_atendimento'
import { inject } from '@adonisjs/core';
import { AtendimentoService } from '#services/atendimento_service'
import { PagamentoService } from '#services/pagamento_service'
import { TransacaoService } from '#services/transacao_service'
//import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Disponibilidade from '#models/disponibilidade'

@inject() 
export default class AtendimentosController {
    constructor(protected atendimentoService: AtendimentoService,
        protected pagamentoService: PagamentoService,
        protected transacaoService: TransacaoService
    ) {}
    //Mostra todos os atendimentos
    public async index({}: HttpContext){
        return await Atendimento.all()
    }
    //Mostra atendimentos individualmente
    //Usa o select para traz apenas os dados importantes, e oculta dados sensíveis
    public async show ({ params }: HttpContext){

        return await Atendimento.query().where('id', params.id).preload('cliente', 
            (query) => query.select('id', 'nome')).preload('profissional',
                (query) => query.select('id', 'nome'))

    }
    //Finalizado
    public async store ({ request, response }: HttpContext){
        try {
            const dados = await request.validateUsing(storeAtendimentoValidator)

            //Converte o Date nativo do JS para o Luxon DateTime
            const dataHoraInicioLuxon = DateTime.fromISO(dados.data_hora_inicio, { zone: 'utc' })

            //Verifica se a solicitação é para uma data/hora que já passou
            const horarioExpirado = dataHoraInicioLuxon < DateTime.now().setZone('utc')
            if (horarioExpirado) {
                throw new Error('A solicitação de atendimento tem uma data inválida.')
            }

            //Verifica se o horário solicitado tem ao menos 24 horas de antecedência 
            const limiteAntecedencia = DateTime.now().setZone('utc').plus({ hours: 24 })
            const semAntecedenciaMinima = dataHoraInicioLuxon < limiteAntecedencia
            if (semAntecedenciaMinima) {
                throw new Error('A solicitação de atendimento precisa ser feita com ao menos 24 horas de antecedência.')
            }
            
            //Chama a função "temDisponibilidade" para verificar se o profissional tem disponibilidade
            const disponibilidade = await this.atendimentoService.temDisponibilidade(dados.profissional_id, dataHoraInicioLuxon)
            console.log('A função temDisponibilidade foi chamada')

            if (!disponibilidade) {
                throw new Error('A solicitação de atendimento não está na disponibilidade do profissional.')
            }

            //Indica conflitos. Se o horário solicitado já tem outro acontecimento
            const slotOcupado = disponibilidade.status === 'OCUPADO' 
            if (slotOcupado) {
                throw new Error('O horário solicitado já está marcado para outro atendimento.')
            }
            const slotBloqueado = disponibilidade.status === 'BLOQUEADO'
            if (slotBloqueado) {
                throw new Error('O profissional se encontra indisponível para este horário.')
            }

            //Procura pela sala em que o profissional atende
            const salaReservada = await Sala.query().where('profissional_id', dados.profissional_id).first()
            console.log('A salaReservada foi consultada')

            if (!salaReservada){
                throw new Error('O profissional escolhido para consulta não tem nenhum sala reservada.')
            }

            //Se tem disponibilidade nesse horário, é definido que o final do atendimento será
            //Igual ao final do slot
            const dataHoraFimLuxon = disponibilidade.dataHoraFim

            await this.atendimentoService.criarAtendimento(dados, salaReservada.id, dataHoraInicioLuxon, dataHoraFimLuxon, disponibilidade.id)

            //Retorna um status 201, representando que o agendamento foi feito com sucesso
            return response.status(201).send('Agendamento realizado com sucesso.')

        //Retorna uma mensagem de erro para qualquer desvio na execução desse try
        } catch (error){
            let message = 'Ocorreu um erro desconhecido.'
            let status = 500
            if (error instanceof Error) {
                if (error.message === 'A solicitação de atendimento tem uma data inválida.') {
                    message = 'Tente informar uma data válida.'
                    status = 400
                } else if (error.message === 'A solicitação de atendimento precisa ser feita com ao menos 24 horas de antecedência.') {
                    message = 'Só é possível agendar atendimentos com ao menos 24 horas de antecedência.'
                } else if (error.message === 'A solicitação de atendimento não está na disponibilidade do profissional.') {
                    message = 'Verifique em quais horários o profissional está disponível.'
                    status = 400
                } else if (error.message === 'O horário solicitado já está marcado para outro atendimento.') {
                    message = 'O horário solicitado entra em conflito com outro atendimento.'
                    status = 400
                } else if (error.message === 'O profissional se encontra indisponível para este horário.') {
                    message = 'O profissional se encontra indisponível no horário solicitado.'
                    status = 400
                } else if (error.message === 'O profissional escolhido para consulta não tem nenhum sala reservada.') {
                    message = 'O profissional não tem uma sala para consulta, portanto não é possível realizar a consulta.'
                    status = 400
                }
                return response.status(status).send({ message })
            }
        }
    }
    //Atualizar
    public async update ({ request, response, params, auth }: HttpContext) {
        try {
            const atendimento = await Atendimento.findOrFail(params.id)
            const dados = await request.validateUsing(updateAtendimentoValidator)
            const usuarioLogado = auth.user!;
            
            if (atendimento.status === 'CANCELADO' || atendimento.status === 'CONCLUIDO') {
                throw new Error('Não é possível atualizar um atendimento que está cancelado ou concluido.')
            }

            const horarioAtendimento = atendimento.dataHoraInicio
            const horarioExpirado = horarioAtendimento < DateTime.now()
            if (horarioExpirado) {
                throw new Error('A solicitação de atendimento tem uma data inválida.')
            }

            const limiteMinimo = DateTime.now().plus({ hours: 24 }) 
            if (horarioAtendimento < limiteMinimo) { // Condição corrigida para clareza
                throw new Error('A modificação do atendimento tem que ser feita com ao menos 24 horas de antecedência.')
            }
            
            // Obter os dados atuais do slot antigo para eventual liberação
            const slotAntigo = await this.atendimentoService.temDisponibilidade(
                atendimento.profissionalId, 
                atendimento.dataHoraInicio
            )
            
            let disponibilidadeSlotNovo = null
            let dadosParaUpdate = { ...dados } as any; 

            //Verifica se o profissional mudou
            const profissionalMudou = dados.profissional_id && dados.profissional_id !== atendimento.profissionalId
            //Verifica se o usuário informou uma nova data hora para começar o atendimento
            const horarioMudou = dados.data_hora_inicio && 
                                 DateTime.fromJSDate(dados.data_hora_inicio).toSeconds() !== atendimento.dataHoraInicio.toSeconds()

            // Se o horário ou profissional mudou, precisamos validar o novo slot
            if (horarioMudou || profissionalMudou) {
                
                const dataHoraInicioLuxon = DateTime.fromJSDate(dados.data_hora_inicio || atendimento.dataHoraInicio.toJSDate())
                const profissionalIdNovo = dados.profissional_id || atendimento.profissionalId
                
                disponibilidadeSlotNovo = await this.atendimentoService.temDisponibilidade(
                    profissionalIdNovo, 
                    dataHoraInicioLuxon
                )

                if (!disponibilidadeSlotNovo) {
                    throw new Error('O novo horário solicitado não está na disponibilidade do profissional.')
                }

                if (disponibilidadeSlotNovo.status === 'OCUPADO') {
                    // O slot pode estar ocupado pelo PRÓPRIO atendimento que está sendo movido.
                    // Isso requer uma verificação mais profunda, mas por simplicidade:
                    throw new Error('O horário solicitado já está marcado para outro atendimento.')
                }
                if (disponibilidadeSlotNovo.status === 'BLOQUEADO') {
                    throw new Error('O profissional se encontra indisponível para este horário.')
                }

                // Sala (Se o profissional mudar, busca-se a nova sala)
                const salaReservada = await Sala.query().where('profissional_id', profissionalIdNovo).first()
                if (!salaReservada) {
                    throw new Error('Este profissional não tem nenhum sala reservada.')
                }
                
                //Adiciona informações do novo slot ao update
                dadosParaUpdate.salaId = salaReservada.id;
                dadosParaUpdate.dataHoraInicio = dataHoraInicioLuxon;
                dadosParaUpdate.dataHoraFim = disponibilidadeSlotNovo.dataHoraFim;
            }

            const usuarioValido = usuarioLogado.perfil_tipo === 'profissional' || usuarioLogado.perfil_tipo === 'admin'
            
            if (!usuarioValido) { //Se for cliente, remove campos restritos
                const camposRestritos = ['valor', 'status_pagamento', 'status']; 
                for (const campo of camposRestritos) {
                    delete dadosParaUpdate[campo];
                }
            }

            const statusFinal = dadosParaUpdate.status ?? atendimento.status
            const statusConcluido = statusFinal === 'CONCLUIDO'
            dadosParaUpdate.status = statusFinal // <<-- GARANTE que o status correto será salvo no final

            const valorPagamento = dadosParaUpdate.valor ?? atendimento.valor 
            dadosParaUpdate.valor = valorPagamento // <<-- GARANTE que o valor correto será salvo no final

            //Processa se estiver 'CONCLUIDO' E o valor for > 0.
            const valorPositivo = typeof valorPagamento === 'number' && valorPagamento > 0
            const deveProcessarPagamento = statusConcluido && valorPositivo

            if (deveProcessarPagamento) {
                dadosParaUpdate.status_pagamento = 'PENDENTE'
                //Status pagamento pendente indica que o processo de pagamento iniciou
                //Lógica de pagamento aqui
                //await this.pagamentoService.iniciarCobranca(/* ... argumentos ... */)
                //Chama o gateway. Essa etapa que modificará o status_pagamento para outros status
                try {
                    //Após a etapa de gateway, acontece o registro da transação e o envio do recibo

                    //Registro da transação
                    //Busca o id do user
                    const user = await Cliente.query().where('id', atendimento.clienteId).first()

                    if (!user) {
                        //Lança um erro se o cliente associado ao atendimento não for encontrado
                        throw new Error('Não foi possível encontrar o cliente para registrar a transação.')
                    }

                    const clienteId = dadosParaUpdate.clienteId ?? atendimento.clienteId 
                    const profissionalId = dadosParaUpdate.profissionalId ?? atendimento.profissionalId

                    await this.transacaoService.criarTransacaoAtendimento(user.id, clienteId, profissionalId, valorPagamento)
                    
                    //Envio do recibo - Para a geração usei a biblioteca pupeeteer - Chama a função própria para isso

                } catch (error) {
                    console.error('Falha ao criar Transação ou Enviar Recibo:', error)
                    
                    dadosParaUpdate.status_pagamento = 'NEGADO' 
                    
                    // Isso forçará a interrupção da execução, impedindo o salvamento do atendimento como 'CONCLUIDO'
                    throw new Error('A transação falhou. Tente novamente mais tarde.')
                }
            }
            
            await db.transaction(async (trx: TransactionClientContract) => {
                
                //Libera o Slot Antigo (Se houve mudança de tempo ou profissional)
                if (slotAntigo && horarioMudou || dados.profissional_id !== atendimento.profissionalId) {
                    //Apenas liberamos se ele estava ocupado
                    if (slotAntigo?.status === 'OCUPADO') {
                         await Disponibilidade.query({ client: trx })
                            .where('id', slotAntigo.id)
                            .update({ status: 'LIVRE' })
                    }
                }
                
                //Ocupa o Slot Novo (Se houve mudança de tempo ou profissional)
                if (disponibilidadeSlotNovo) {
                     await Disponibilidade.query({ client: trx })
                        .where('id', disponibilidadeSlotNovo.id)
                        .update({ status: 'OCUPADO' })
                }

                //Salvando o atendimento
                atendimento.merge(dadosParaUpdate) 
                atendimento.useTransaction(trx) 
                await atendimento.save()
            })

            return response.status(200).send('Agendamento atualizado com sucesso.')
            
        } catch (error) {
            let message = 'Ocorreu um erro desconhecido.'
            let status = 500

            if (error.messages && error.messages.errors) {
                message = error.messages.errors[0].message
                status = 400
            } 
            else if (error instanceof Error) {
                message = error.message
                status = 400 // Erros de regra de negócio costumam ser 400 Bad Request
            }
            
            return response.status(status).send({ message: message })
        }
    }

    //Deleta Atendimento / Cancela Atendimento
    public async destroy ({ params, response }: HttpContext){
        //Try catch para garantir que ao acontecer um erro, (ex: nao encontrar o objeto com o id), 
        //uma mensagem amigável seja levantada.
        try{
            const atendimento = await Atendimento.findOrFail(params.id)

            const horarioAtendimento = atendimento.dataHoraInicio

            if (atendimento.status !== 'CONFIRMADO') {
                throw new Error('Não é possível cancelar um atendimento finalizado ou já cancelado.')
            }

            //Se tiver menos de 24 horas para o atendimento, sobe a mensagem de erro,
            //informando que não é possível realizar o cancelamento
            const cancelamentoProibido = horarioAtendimento <= DateTime.now().plus({ hours: 24 })
            if (cancelamentoProibido) {
                throw new Error('A solicitação de cancelamento precisa ser feito com pelo menos 24 horas de antecedência.')
            }

            //Busca o slot da disponibilidade
            const slotDisponibilidade = await Disponibilidade.query()
                .where('profissional_id', atendimento.profissionalId)
                .andWhere('data_hora_inicio', atendimento.dataHoraInicio.toJSDate())
                .andWhere('data_hora_fim', atendimento.dataHoraFim.toJSDate())
                .andWhere('status', 'OCUPADO')
                .first()

            if (!slotDisponibilidade) {
                throw new Error('Slot de disponibilidade não encontrado')
            }
            
            await db.transaction(async (trx: TransactionClientContract) => {
                
                //Atualiza o status da disponibilidade para 'LIVRE'
                await Disponibilidade.query({ client: trx })
                    .where('id', slotDisponibilidade.id)
                    .update({ status: 'LIVRE' })

                //Atualiza o status do atendimento para 'CANCELADO'
                await Atendimento.query({ client: trx })
                    .where('id', atendimento.id)
                    .update({ status: 'CANCELADO' })
            })

            return response.status(204).send('Cancelamento realizado com sucesso.')

        } catch (error){
            let message = 'Ocorreu um erro desconhecido.'
            let status = 500
            if (error instanceof Error) {
                if (error.message === 'A solicitação de cancelamento precisa ser feito com pelo menos 24 horas de antecedência.') {
                    message = 'Perdão, não é possível fazer o cancelamento desta consulta.'
                    status = 400
                } else if (error.message === 'Não é possível cancelar um atendimento finalizado ou já cancelado.') {
                    message = 'O atendimento correspondente já foi finalizado ou cancelado. Tente novamente.'
                    status = 400 
                } 
                return response.status(status).send({ message })        
            }
        }
    }
}