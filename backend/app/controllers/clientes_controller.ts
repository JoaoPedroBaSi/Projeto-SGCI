import type { HttpContext } from '@adonisjs/core/http'
import Cliente from '#models/cliente'
import { DateTime } from 'luxon'
import { storeClienteValidator, updateClienteValidator } from '#validators/validator_cliente'

export default class ClientesController {
  
  public async index({ auth, response }: HttpContext) {
    const user = await auth.authenticate()

    // CORREÇÃO: perfil_tipo -> perfilTipo
    if (user.perfilTipo === 'cliente') {
      const cliente = await Cliente.query().where('id', user.id).first()
      if (!cliente) return response.notFound({ message: 'Perfil não encontrado' })
      return response.ok(cliente)
    }

    const clientes = await Cliente.all()
    return response.ok(clientes)
  }

  public async show({ params, response }: HttpContext) {
    try {
      const cliente = await Cliente.query()
        .where({ id: params.id })
        .preload('user')
        .preload('atendimentos')
        .firstOrFail()

      return response.ok(cliente)
    } catch {
      return response.notFound({ message: 'Cliente não encontrado' })
    }
  }

  public async store({ request, auth, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeClienteValidator)

      // CORREÇÃO: Tratamento da data para evitar conflito de tipos
      const dataNascimento = payload.dataNascimento 
        ? (payload.dataNascimento instanceof Date 
            ? DateTime.fromJSDate(payload.dataNascimento) 
            : payload.dataNascimento)
        : undefined

      const cliente = await Cliente.create({
        ...payload,
        id: auth.user!.id,
        dataNascimento: dataNascimento as any,
      })

      return response.created(cliente)
    } catch (error: any) {
      return response.badRequest({ 
        message: 'Não foi possível criar o cliente', 
        error: error.message || error 
      })
    }
  }

  public async update({ request, params, response }: HttpContext) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      const payload = await request.validateUsing(updateClienteValidator)

      // CORREÇÃO: Tratamento seguro da data no merge
      const dataNascimento = payload.dataNascimento 
        ? (payload.dataNascimento instanceof Date 
            ? DateTime.fromJSDate(payload.dataNascimento) 
            : payload.dataNascimento)
        : cliente.dataNascimento

      cliente.merge({
        ...payload,
        dataNascimento: dataNascimento as any,
      })

      await cliente.save()
      return response.ok(cliente)
    } catch (error: any) {
      return response.badRequest({ 
        message: 'Não foi possível atualizar o cliente', 
        error: error.message || error 
      })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      await cliente.delete()
      return response.ok(cliente)
    } catch {
      return response.notFound({ message: 'Cliente não encontrado' })
    }
  }
}