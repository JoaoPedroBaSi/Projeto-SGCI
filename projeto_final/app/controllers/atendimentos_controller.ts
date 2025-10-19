/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Atendimento from '#models/atendimento'
//import Disponibilidade from '#models/disponibilidade'
import { storeAtendimentoValidator } from '#validators/validator_atendimento'
import { updateAtendimentoValidator } from '#validators/validator_atendimento'
import { inject } from '@adonisjs/core';
import { AtendimentoService } from '#services/atendimento_service'

//Obs: os testes deixei para depois (o mais breve possível) pois tem depêndencia 
//com outras tabelas
@inject() 
export default class AtendimentosController {
    constructor(protected atendimentoService: AtendimentoService) {}
    //A TESTAR (O MAIS BREVE POSSÍVEL)
    //Mostra todos os atendimentos
    public async index({}: HttpContext){
        return await Atendimento.all()
    }
    //A TESTAR (O MAIS BREVE POSSÍVEL)
    //Mostra atendimentos individualmente
    //Usa o select para traz apenas os dados importantes, e oculta dados sensíveis
    public async show({params}: HttpContext){

        return await Atendimento.query().where('id', params.id).preload('cliente', 
            (query) => query.select('id', 'nome', 'email')).preload('profissional',
                (query) => query.select('id', 'nome', 'email'))

    }
    //A TESTAR (O MAIS BREVE POSSÍVEL)
    public async store({request, response}: HttpContext){
        //Essas variáveis representam o range de horário em que as consultas podem ser
        //marcadas. Isto é, garantem que o usuário não vá criar um atendimento que
        //não esteja dentro do funcionamento da clínica. 
        //A clínica abre às 07:00 e fecha às 21:00, mas considerando que os atendimentos
        //duram 30 minutos (na teoria), o último atendimento possível tem que ser
        //marcado para às 20:30
        const primeiro_atendimento = '07:00:00'
        const ultimo_atendimento = '20:30:00'
        try {
            const dados = await request.validateUsing(storeAtendimentoValidator)
            
            //Chama a função "temDisponibilidade" para verificar se o profissional tem disponibilidade
            const disponibilidade = await this.atendimentoService.temDisponibilidade(dados.profissional_id, dados.dia)
            
            if (!disponibilidade) {
                throw new Error()
            }

            //Chama a função "converteStringParaDate", que converte o horário solicitado de String para Date.
            //Esse detalhe é importante pois facilita as comparações, somas, etc
            const horarioComecoSolicitado = await this.atendimentoService.converteStringParaDate(dados.horario_comeco)

            //Garante que o horário após ser convertido para date, esteja válido.
            if (!horarioComecoSolicitado.isValid) {
                throw new Error()
            }

            const duracaoAtendimento = 30 //Minutos

            //Pega o horário solicitado pelo cliente, que já foi convertido, e adiciona 30 minutos
            //para o horário de término da consulta
            const horarioTerminoSolicitado = horarioComecoSolicitado.plus({ minutes: duracaoAtendimento })

            //Converte os Luxon DateTime para strings SQL TIME (HH:mm:ss)
            //No caso, a conversão anterior utilizava também utilizava o formato de data,
            //para evitar viradas de dia com a soma das horas
            const novoInicioSQL = horarioComecoSolicitado.toSQLTime()      
            const novoTerminoSQL = horarioTerminoSolicitado.toSQLTime()

            //Verifica se o horário solicitado pelo cliente está fora do horário de funcionamento da clínica
            if (novoInicioSQL < primeiro_atendimento || novoInicioSQL > ultimo_atendimento) {
                throw new Error()
            }

            //Verifica se o horário solicitado pelo cliente está fora do horário de disponibilidade do profissional
            if (novoInicioSQL < disponibilidade.horarioComeco || novoTerminoSQL > disponibilidade.horarioTermino) {
                throw new Error()
            }
            
            const conflito = await this.atendimentoService.temConflito(dados.profissional_id, dados.dia, dados.data, novoInicioSQL, novoTerminoSQL)

            //Se o profissional não tiver disponibilidade no horário solicitado pelo cliente, ou tiver
            //conflito com algum atendimento já cadastrado, sobe um erro
            if (conflito){
                throw new Error()
            }

            //Cria o atendimento, e o uso de "..." garante que os valores horarioComeco seja sobreescrito
            await Atendimento.create({ ...dados, horarioComeco: novoInicioSQL, horarioTermino: novoTerminoSQL })

            //Retorna um status 201, representando que o agendamento foi feito com sucesso
            return response.status(201).send('Agendamento realizado com sucesso.')

        //Retorna uma mensagem de erro para qualquer desvio na execução desse try
        } catch (error){
            return response.status(404).send('Não foi possível cadastrar o atendimento. Tente novamente')
        }
    }
    //A TESTAR (O MAIS BREVE POSSÍVEL)
    //Atualizar
    public async update({ request, response, params }: HttpContext){
        const horarioAtual = DateTime.now()

        //O horário limite para atualizar é 24 horas antes do atendimento
        const limiteAtualizacao = horarioAtual.plus({ hours: 24 })

        //A grande diferença do update para o store é que a verificação de conflito tem que desconsiderar o 
        //o próprio atendimento. Se não o fizer, a atualização sempre vai retornar erro
        const primeiro_atendimento = '07:00:00'
        const ultimo_atendimento = '20:30:00'
        try{
            const objAtendimento = await Atendimento.findOrFail(params.id)

            const dados = await request.validateUsing(updateAtendimentoValidator)

            const horarioAtendimento = objAtendimento.horarioComeco

            //Converte o horarioAtendimento, que é uma string, para DateTime
            const horarioConvertido = DateTime.fromISO(horarioAtendimento, { zone: 'utc' })

            //Se tiver menos de 24 horas para o atendimento, sobe a mensagem de erro,
            //informando que não é possível realizar a atualização
            if (horarioConvertido < limiteAtualizacao) {
                throw new Error()
            }
            
            const disponibilidade = await this.atendimentoService.temDisponibilidade(dados.profissional_id, dados.dia)
            
            if (!disponibilidade) {
                throw new Error()
            }

            const horarioComecoSolicitado = await this.atendimentoService.converteStringParaDate(dados.horario_comeco)

            if (!horarioComecoSolicitado.isValid) {
                throw new Error()
            }

            const duracaoAtendimento = 30 //Minutos

            const horarioTerminoSolicitado = horarioComecoSolicitado.plus({ minutes: duracaoAtendimento })

            const novoInicioSQL = horarioComecoSolicitado.toSQLTime()      
            const novoTerminoSQL = horarioTerminoSolicitado.toSQLTime()

            if (novoInicioSQL < primeiro_atendimento || novoInicioSQL > ultimo_atendimento) {
                throw new Error()
            }

            if (novoInicioSQL < disponibilidade.horarioComeco || novoTerminoSQL > disponibilidade.horarioTermino) {
                throw new Error()
            }
            
            //Verifica conflito com outros atendimentos, ignorando o próprio atendimento já criado (por meio do params.id)
            const conflito = await this.atendimentoService.temConflito(dados.profissional_id, dados.dia, dados.data, novoInicioSQL, novoTerminoSQL, Number(params.id))

            if (conflito){
                throw new Error()
            }

            objAtendimento.merge({...dados, horarioComeco: novoInicioSQL, horarioTermino: novoTerminoSQL}) 
            //Retorna um status 201, representando que o agendamento foi atualizado com sucesso
            return response.status(201).send('Agendamento realizado com sucesso.')

        } catch (error){
            return response.status(404).send('Não foi possível cadastrar o atendimento. Tente novamente.')
        }
    }
    //A TESTAR (O MAIS BREVE POSSÍVEL)
    //Deleta Atendimento / Cancela Atendimento
    public async destroy({ params, response }: HttpContext){
        const horarioAtual = DateTime.now()

        //O horário limite para cancelamento é 24 horas antes do atendimento
        const limiteCancelamento = horarioAtual.plus({ hours: 24 })
        //Try catch para garantir que ao acontecer um erro, (ex: nao encontrar o objeto com o id), 
        //uma mensagem amigável seja levantada.
        try{
            const objAtendimento = await Atendimento.findOrFail(params.id)

            const horarioAtendimento = objAtendimento.horarioComeco

            //Converte o horarioAtendimento, que é uma string, para DateTime
            const horarioConvertido = DateTime.fromISO(horarioAtendimento, { zone: 'utc' })

            //Se tiver menos de 24 horas para o atendimento, sobe a mensagem de erro,
            //informando que não é possível realizar o cancelamento
            if (horarioConvertido < limiteCancelamento) {
                throw new Error()
            }

            await objAtendimento.delete()

            return response.status(204).send('Cancelamento realizado com sucesso.')
        } catch {
            return response.status(404).send('Não foi possível apagar o atendimento. Tente novamente.')
        }
}
}