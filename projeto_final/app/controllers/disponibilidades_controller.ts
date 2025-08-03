/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import Disponibilidade from '#models/disponibilidade'
import { storeDisponibilidadeValidator } from '#validators/validator_disponibilidade'
import { updateDisponibilidadeValidator } from '#validators/validator_disponibilidade'

export default class DisponibilidadesController {
    //Lista todas as disponibilidades
    public async index({}: HttpContext){
        return await Disponibilidade.all()
    }
    //Lista um registro de disponibilidade especificado pelo id
    public async show({params}: HttpContext){
        return await Disponibilidade.query().where('id', params.id)
    }
    //Cria uma nova disponibilidade
    public async store({request, response}:HttpContext){
        //Ao tentar realizar a operação de criação, e encontrar um erro no caminho, será levantada
        //a mensagem de erro amigável.
        try {
            //Faz a validação dos dados da disponibilidade, usando o validator 'storeDisponibilidadeValidator'.
            const validacao = await request.validateUsing(storeDisponibilidadeValidator)
            //Verifica se a disponibilidade do profissional está dentro do horário de disponibilidade
            //do prédio. Se não estiver, sobe o erro e o catch é acionado.
            if (validacao.horario_comeco > '06:00:00' && validacao.horario_termino < '22:00:00'){
                //Retorna o objeto criado, após a validação
                return await Disponibilidade.create(validacao)
            } else {
                throw new Error()
            }
        } catch (error){
            return response.status(404).send('Não foi possível cadastrar a disponibilidade. Tente novamente')
        }
    }
    public async update({params, request, response}: HttpContext){
        //Ao tentar realizar a operação de atualização, e encontrar um erro no caminho, será levantada
        //a mensagem de erro amigável.
        try{
            //Procura o objeto com o id correspondente. Se não encontrar, retorna uma mensagem de erro.
            const objDisponibilidade = await Disponibilidade.findOrFail(params.id)
            //Faz a validação do objeto encontrado, usando o validator 'updateDisponibilidadeValidator'.
            const validacao = await request.validateUsing(updateDisponibilidadeValidator)
            //Verifica se a disponibilidade do profissional está dentro do horário de disponibilidade
            //do prédio. Se não estiver, sobe o erro e o catch é acionado.
            if (validacao.horario_comeco > '06:00:00' && validacao.horario_termino < '22:00:00'){    
                //Após a validação, faz o merge com o objeto disponibilidade, passando os dados validados.
                objDisponibilidade.merge(validacao) 
                //Retorna o objeto salvo.
                return await objDisponibilidade.save()
            } else {
                throw new Error()
            }
        } catch (error){
            return response.status(404).send('Não foi possível atualizar os dados da disponibilidade. Tente novamente')
        } 
    }
    public async destroy({params, response}: HttpContext){
            //Try catch para garantir que ao acontecer um erro, (ex: nao encontrar o objeto com o id), 
            //uma mensagem amigável seja levantada.
            try{
                const objDisponibilidade = await Disponibilidade.findOrFail(params.id)
    
                await objDisponibilidade.delete()
    
                return objDisponibilidade
            } catch {
                return response.status(404).send('Não foi possível apagar o profissional. Tente novamente')
            }
    }
}