/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import Especializacao from '#models/especializacao'

export default class EspecializacoesController {
  //Testado
  //Lista todas as especializações
  public async index({}: HttpContext) {
    return await Especializacao.all()
  }
  //Testado
  //Cria novas especializações
  public async store({request, response}: HttpContext) {

    // Cria uma variável, que recebe o que foi digitado pelo usuário. 
    // Fazer isso facilita a verificação dos dados.
    const especializacaoCriada = request.only(['nome'])
    
    //Verifica se a variável especializacaoCriada realmente existe/não é nulo,
    // e verifica se o tamanho do 'nome' da especializacao é maior ou igual a 4.
    if (especializacaoCriada && especializacaoCriada.nome.length >= 4) {
      //Antes de criar a especialização, formata o 'nome' 
      // digitado para que a primeira letra seja maiúscula, 
      // e o restante das letras seja minúscula.
        especializacaoCriada.nome = especializacaoCriada.nome.charAt(0).toUpperCase() 
        + especializacaoCriada.nome.slice(1).toLowerCase()

        //Retorna a variável especializacaoCriada com o 
        // objeto Especializacao que acabou de ser criado.
        return await Especializacao.create(especializacaoCriada)

    //Se a variável especializacaoCriada não existir ou se o tamanho
    // do 'nome' for menor que 4, retorna a mensagem de erro.
    } else {
        return response.abort({
            Message: 'Os campos digitados são inválidos. Tente novamente'
        }, 400)
    }
  }
  //Testado
  //Exibe objeto único especificado pelo id
  public async show({ params }: HttpContext) {

    //Procura objetos com o id indicado, e retorna os objetos de especializacao.
    // + os profissionais vinculados a eles.
    return await Especializacao.query().where('id', params.id).preload('profissionais')

    }
    //Testado
    //Atualiza/modifica objetos individualmente da tabela já criados 
  public async update({ params, request, response }: HttpContext) {
    //Procura o objeto com o id correspondente. Se não encontrar, retorna uma mensagem de erro.
    const idEspecializacao = await Especializacao.findOrFail(params.id)

    //Semelhante ao 'store'. Cria uma variável associada a requisição.
    const especializacaoCriada = request.only(['nome'])
    
    //Verifica se a variável especializacaoCriada não é nula, e se o tamanho é maior ou igual a 4.
    if (especializacaoCriada && especializacaoCriada.nome.length >= 4){
        //Faz o merge com a variável criada a partir da requisição.
        idEspecializacao.merge(especializacaoCriada)
        //salva o merge
        await idEspecializacao.save()
        //retorna o objeto após a etapa de merge e salvamento.
        return idEspecializacao
    } else {
        //Se as condições não forem atendidas, retorna uma mensagem de erro.
        return response.abort({
            Message: 'Os campos digitados são inválidos. Tente novamente'
        }, 400)
    }
  }
  //Testado
  //Deleta um objeto individual pelo id.
  public async destroy({ params }: HttpContext) {
    const idEspecializacao = await Especializacao.findOrFail(params.id)

    //Apaga o registro/objeto indicado pela busca a partir do params.id.
    await idEspecializacao.delete()
    //Após isso, retorna o objeto deletado.
    return idEspecializacao
  }
}