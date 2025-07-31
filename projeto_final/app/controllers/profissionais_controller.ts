/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import Profissional from '#models/profissional'
import { storeProfissionalValidator } from '#validators/validator_profissional'
import { updateProfissionalValidator } from '#validators/validator_profissional'
//Lembrando -> não há referencias a especializacao pq é uma relacao de muitos para muitos.
//Haverá uma tabela pivô Especializacao/Profissional para criar os relacionamentos.
export default class ProfissionaisController {
    //Testado
    //Lista todos os profissionais
    public async index({}: HttpContext){
        return await Profissional.all()
    }
    //Testado
    //Cria profissionais e seus atributos
    public async store({request, response}: HttpContext){
        //Try catch para capturar erros, semelhante ao que acontece no Python, em que temos try except.
        //Ao tentar realizar a operação de criação, e encontrar um erro no caminho, será levantada
        //a mensagem de erro amigável.
        try{
            //Faz a validação dos dados do profissional, usando o validator 'storeProfissionalValidator'.
            const validacao = await request.validateUsing(storeProfissionalValidator)
            //Retorna o objeto criado, após a validação
            return await Profissional.create(validacao)
        } catch (error){
            return response.status(404).send('Não foi possível cadastrar o profissional. Tente novamente')
        }
    }
    //Testado
    //Mostra os profissionais de maneira individual, pelo id.
    public async show({params}: HttpContext){
        return await Profissional.query().where('id', params.id).preload('especializacoes').preload('funcao')
    }
    //Testado no patch / Só a senha é alterável
    //Atualiza informações dos profissionais de maneira individual, pelo id
    public async update({ params, request, response }: HttpContext) {
        //Ao tentar realizar a operação de atualização, e encontrar um erro no caminho, será levantada
        //a mensagem de erro amigável.
        try{
            //Procura o objeto com o id correspondente. Se não encontrar, retorna uma mensagem de erro.
            const objProfissional = await Profissional.findOrFail(params.id)
            //Faz a validação do objeto encontrado, usando o validator 'updateProfissionalValidator'.
            const validacao = await request.validateUsing(updateProfissionalValidator)
            //Após a validação, faz o merge com o objeto profissional, passando os dados validados.
            objProfissional.merge(validacao) 
            //Retorna o objeto salvo.
            return await objProfissional.save()
        } catch (error){
            return response.status(404).send('Não foi possível atualizar os dados do profissional. Tente novamente')
        } 
        }
    //Testado
    //Apaga o registro de profissional indicado pelo id
    public async destroy({params, response}: HttpContext){
        //Try catch para garantir que ao acontecer um erro, (ex: nao encontrar o objeto com o id), 
        //uma mensagem amigável seja levantada.
        try{
            const objProfissional = await Profissional.findOrFail(params.id)

            await objProfissional.delete()

            return objProfissional
        } catch {
            return response.status(404).send('Não foi possível apagar o profissional. Tente novamente')
        }
    }
}