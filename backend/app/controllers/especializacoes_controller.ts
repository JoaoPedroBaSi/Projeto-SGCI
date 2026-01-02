/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import Especializacao from '#models/especializacao'
import { storeEspecializacaoValidator } from '#validators/validator_especializacao'
import { updateEspecializacaoValidator } from '#validators/validator_especializacao'

export default class EspecializacaoController {
  //Testado
  //Lista todas as especializações
  public async index({}: HttpContext) {
    return await Especializacao.all()
  }
  //Testado
  //Cria novas especializações
  public async store({request, response}: HttpContext) {
    //Try catch para capturar erros, semelhante ao que acontece no Python, em que temos try except.
    //Ao tentar realizar a operação de criação, e encontrar um erro no caminho, será levantada
    //a mensagem de erro amigável.
    try{
        //Faz a validação dos dados da especialização, usando o validator 'storeEspecializacaoValidator'.
        const validacao = await request.validateUsing(storeEspecializacaoValidator)
        //Retorna o objeto criado, após a validação
        return await Especializacao.create(validacao)
    } catch (error){
        return response.status(404).send('Não foi possível cadastrar a especialização. Tente novamente')
    }
  }
  //Testado
  //Exibe objeto único especificado pelo id
  public async show({ params }: HttpContext) {

    //Procura por um objeto com o id indicado, e retorna um objeto da tabela de especializacao.
    // + os profissionais vinculados a eles.
    //traz apenas os campos id, nome e email atraves do select
    return await Especializacao.query().where('id', params.id).preload('profissionais', (query) => {
    query.select('id', 'nome', 'email')
  })

    }
    //Testado
    //Atualiza/modifica objetos individualmente da tabela já criados 
  public async update({ params, request, response }: HttpContext) {
    //Ao tentar realizar a operação de atualização, e encontrar um erro no caminho, será levantada
    //a mensagem de erro amigável.
    try{
        //Procura o objeto com o id correspondente. Se não encontrar, retorna uma mensagem de erro.
        const objProfissional = await Especializacao.findOrFail(params.id)
        //Faz a validação do objeto encontrado, usando o validator 'updateEspecializacaoValidator'.
        const validacao = await request.validateUsing(updateEspecializacaoValidator)
        //Após a validação, faz o merge com o objeto especializacao, passando os dados validados.
        objProfissional.merge(validacao) 
        //Retorna o objeto salvo.
        return await objProfissional.save()
    } catch (error){
        return response.status(404).send('Não foi possível atualizar os dados da especialização. Tente novamente')
    } 
  }
  //Testado
  //Deleta um objeto individual pelo id.
  public async destroy({ params }: HttpContext) {
    const objEspecializacao = await Especializacao.findOrFail(params.id)

    //Apaga o registro/objeto indicado pela busca a partir do params.id.
    await objEspecializacao.delete()
    //Após isso, retorna o objeto deletado.
    return objEspecializacao
  }
}