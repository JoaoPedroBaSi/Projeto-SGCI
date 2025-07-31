import type { HttpContext } from '@adonisjs/core/http'
import Funcao from '#models/funcao'
import { storeFuncaoValidator } from '#validators/store_funcao'
import { updateFuncaoValidator } from '#validators/update_funcao'

export default class FuncoesController {
  // Testado
  // Lista todas as funções
  public async index({}: HttpContext) {
    return await Funcao.all()
  }

  public async show({ params, response }: HttpContext) {
    // Testado
    // Retorna uma função específica com os profissionais associados
    // Se não encontrar, retorna 404
    const funcao = await Funcao.query().where({ id: params.id }).preload('profissionais').first()
    if (funcao) return funcao
    else return response.status(404)
  }

  public async store({ request, response }: HttpContext) {
    // Testado
    // Cria uma nova função e valida os dados de entrada
    const payload = await request.validateUsing(storeFuncaoValidator)
    const funcao = await Funcao.create(payload)
    return response.status(201).send(funcao)
  }

  public async update({ request, params, response }: HttpContext) {
    // Testado
    // Atualiza os dados de uma função existente após a validação
    const payload = await request.validateUsing(updateFuncaoValidator)

    const funcao = await Funcao.findOrFail(params.id)
    funcao.merge(payload)
    await funcao.save()
    return response.send(funcao)
  }

  public async destroy({ params }: HttpContext) {
    // Testado
    // Exclui uma função existente
    const funcao = await Funcao.findOrFail(params.id)
    await funcao.delete()
    return funcao
  }
}
