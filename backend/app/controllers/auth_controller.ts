import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'
import { registerValidator } from '#validators/register'
import db from '@adonisjs/lucid/services/db'

export default class AuthController {
  
  public async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.autenticar(email, password)
      
      if (!user) {
        return response.unauthorized({ message: 'Credenciais inválidas' })
      }

      const token = await User.accessTokens.create(user)

      return response.ok({
        type: 'bearer',
        token: token.value!.release(),
        user: {
            id: user.id,
            email: user.email,
            perfilTipo: user.perfilTipo,
            name: user.fullName
        }
      })
    } catch (error: any) {
      console.error('Erro no Login:', error)
      return response.internalServerError({ 
        message: 'Erro interno ao realizar login',
        debug: error.message 
      })
    }
  }

  public async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const { fullName, email, password, perfilTipo } = payload

    const existing = await User.findBy('email', email)
    if (existing) {
      return response.conflict({ message: 'Email já está em uso' })
    }

    const trx = await db.transaction()
    
    try {
      const user = new User()
      user.email = email
      user.password = password
      user.fullName = fullName  
      user.perfilTipo = perfilTipo
      user.status = perfilTipo === 'profissional' ? 'pendente' : 'ativo'

      await user.useTransaction(trx).save()
      
      const dataNasc = payload.dataNascimento 
        ? DateTime.fromJSDate(new Date(payload.dataNascimento)) 
        : DateTime.now()

      if (perfilTipo === 'cliente') {
        await Cliente.create({
            id: user.id, 
            nome: fullName,
            genero: payload.genero as any,
            dataNascimento: dataNasc,
            cpf: payload.cpf,
            telefone: payload.telefone,
            email: user.email,
            senha: user.password
          }, { client: trx })
      } 
      else if (perfilTipo === 'profissional') {
        await Profissional.create({
            id: user.id,
            funcaoId: payload.funcaoId,
            nome: fullName,
            genero: payload.genero as any,
            dataNascimento: dataNasc,
            cpf: payload.cpf,
            telefone: payload.telefone,
            email: user.email,
            senha: user.password,
            registroConselho: payload.registroConselho,
            conselhoUf: payload.conselhoUf,
            status: 'pendente',
          }, { client: trx })

        await Cliente.create({
            id: user.id, 
            nome: fullName,
            genero: payload.genero as any,
            dataNascimento: dataNasc,
            cpf: payload.cpf,
            telefone: payload.telefone,
            email: user.email,
            senha: user.password
          }, { client: trx })
      }

      await trx.commit()

      const token = await User.accessTokens.create(user)

      return response.created({
        message: 'Usuário registrado com sucesso',
        type: 'bearer',
        token: token.value!.release(),
        user: { id: user.id, email: user.email, perfilTipo: user.perfilTipo }
      })

    } catch (error: any) {
      await trx.rollback()
      return response.status(500).json({ message: 'Erro ao registrar', error: error.message })
    }
  }

  public async logout({ auth, response }: HttpContext) {
    /**
     * CORREÇÃO TS(2345):
     * Aplicamos o cast 'as unknown as User' para que o método delete
     * reconheça o usuário como uma instância válida de User.
     */
    const user = auth.user as unknown as User
    
    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    /**
     * Capturamos o identificador do token atual através do cast em auth.user
     */
    const currentTokenId = (auth.user as any).currentAccessToken.identifier
    await User.accessTokens.delete(user, currentTokenId)
    
    return response.ok({ message: 'Deslogado com sucesso' })
  }
}