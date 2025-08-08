/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import Atendimento from '#models/atendimento'
import Disponibilidade from '#models/disponibilidade'
import { storeAtendimentoValidator } from '#validators/validator_atendimento'
import { updateAtendimentoValidator } from '#validators/validator_atendimento'

export default class AtendimentosController {
    //TESTADO
    //Mostrar todos os atendimentos
    public async index({}: HttpContext){
        return await Atendimento.all()
    }
    //TESTADO
    //Mostrar atendimentos individualmente
    //Usar o select para traz apenas os dados importantes, 
    //e ocultar dados sensíveis
    public async show({params}: HttpContext){

        return await Atendimento.query().where('id', params.id).preload('cliente', 
            (query) => query.select('id', 'nome', 'email')).preload('profissional',
                (query) => query.select('id', 'nome', 'email')
            )
    }
    //TESTADO
    public async store({request, response}: HttpContext){
        try{
            const validacao = await request.validateUsing(storeAtendimentoValidator)
            
            //Faz a procura pelas informações da disponibilidade
            //Traz as disponibilidades de um profissional específico, a partir da tentativa de inserção
            //Na tabela de Atendimento. Depois disso, com os dados da disponibilidade do profissional
            //Da qual o cliente tá querendo se relacionar via atendimento, verifica a disponibilidade.
            const verificarDisponibilidade = await Disponibilidade.query().where('profissional_id', validacao.profissional_id).andWhere('dia', validacao.dia).first()
            
            //Além disso, é preciso verificar na própria tabela de Atendimento se há algum conflito
            //Se já tem alguém para ser atendido no mesmo horário, no mesmo dia, pelo mesmo profissional
            const verificarConflito = await Atendimento.query().where('profissional_id', validacao.profissional_id).andWhere('dia', validacao.dia).
            andWhere('horario_comeco', validacao.horario_comeco).andWhere('data', validacao.data).first()


            //Se não tem disponibilidade, é porque não está dentro da disponibilidade do profissional
            //Exemplo, tentou criar um atendimento dia 3 (quarta), mas o profissional trabalha
            //Apenas nos dias 1,2 e 4. Com isso, retorna a mensagem de erro.
            if (!verificarDisponibilidade) {
                return response.badRequest({ mensagem: 'Disponibilidade não encontrada.' })
            } else if (verificarConflito){
                return response.badRequest({ mensagem: 'Encontrado conflito com outro atendimento.' })
            }

            //Verificar conflitos entre horários internos do próprio atendimento
            if (validacao.horario_comeco >= verificarDisponibilidade.horarioComeco && validacao.horario_comeco <= verificarDisponibilidade.horarioTermino
                && validacao.horario_termino <= verificarDisponibilidade.horarioTermino &&  validacao.horario_termino >= verificarDisponibilidade.horarioComeco &&
                validacao.horario_comeco <= validacao.horario_termino){
                return await Atendimento.create(validacao)
            } else {
                throw new Error()
            }
        } catch (error){
            return response.status(404).send('Não foi possível cadastrar o atendimento. Tente novamente')
        }
    }
    //TESTADO
    //Atualizar
    public async update({request, response, params}: HttpContext){
        try{
            
            const objAtendimento = await Disponibilidade.findOrFail(params.id)

            const validacao = await request.validateUsing(updateAtendimentoValidator)
            //Faz a procura pelas informações da disponibilidade
            //Traz as disponibilidades de um profissional específico, a partir da tentativa de inserção
            //Na tabela de Atendimento. Depois disso, com os dados da disponibilidade do profissional
            //Da qual o cliente tá querendo se relacionar via atendimento, verifica a disponibilidade.
            
            const verificarDisponibilidade = await Disponibilidade.query().where('profissional_id', validacao.profissional_id).andWhere('dia', validacao.dia).first()
    
            //Além disso, é preciso verificar na própria tabela de Atendimento se há algum conflito
            //Se já tem alguém para ser atendido no mesmo horário, no mesmo dia, pelo mesmo profissional
            const verificarConflito = await Atendimento.query().where('profissional_id', validacao.profissional_id).andWhere('dia', validacao.dia).andWhere('horario_comeco', validacao.horario_comeco).first()
            
            //Se não tem disponibilidade, é porque não está dentro da disponibilidade do profissional
            //Exemplo, tentou criar um atendimento dia 3 (quarta), mas o profissional trabalha
            //Apenas nos dias 1,2 e 4. Com isso, retorna a mensagem de erro.
            if (!verificarDisponibilidade) {
                return response.badRequest({ mensagem: 'Disponibilidade não encontrada.' })
            } else if (verificarConflito) {
                return response.badRequest({ mensagem: 'Encontrado conflito com outro atendimento.' })
            }

            //Verificar se não tem outro atendimento no mesmo horário, com o mesmo profissional, e no mesmo dia
            if (validacao.horario_comeco >= verificarDisponibilidade.horarioComeco && validacao.horario_comeco <= verificarDisponibilidade.horarioTermino){
                //Após a validação, faz o merge com o objeto atendimento, passando os dados validados.
                objAtendimento.merge(validacao) 
                //Retorna o objeto salvo.
                return await objAtendimento.save()
            } else {
                throw new Error()
            }
        } catch (error){
            return response.status(404).send('Não foi possível cadastrar o atendimento. Tente novamente')
        }
    }
    //TESTADO
    //Deletar Atendimento
    public async destroy({params, response}: HttpContext){
        //Try catch para garantir que ao acontecer um erro, (ex: nao encontrar o objeto com o id), 
        //uma mensagem amigável seja levantada.
        try{
            const objAtendimento = await Atendimento.findOrFail(params.id)

            await objAtendimento.delete()

            return objAtendimento
        } catch {
            return response.status(404).send('Não foi possível apagar o atendimento. Tente novamente')
        }
}
}