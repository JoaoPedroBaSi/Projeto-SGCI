import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'
import { registerValidator } from '#validators/register'
import db from '@adonisjs/lucid/services/db'
import crypto from 'node:crypto'
import mail from '@adonisjs/mail/services/main'

export default class AuthController {
  
  public async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      // CORREÇÃO: Usamos (User as any) para acessar o método injetado pelo mixin
      const user = await (User as any).verifyCredentials(email, password)
      
      if (!user) {
        return response.unauthorized({ message: 'Credenciais inválidas' })
      }

      const token = await (User as any).accessTokens.create(user)

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
    } catch (error) {
      console.error(error)
      return response.internalServerError({ message: 'Erro ao realizar login' })
    }
  }

  public async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const { fullName, email, password, perfilTipo } = payload

    const existing = await User.findBy('email', email)
    if (existing) {
      return response.conflict({ message: 'Email já está em uso' })
    }

    if (perfilTipo === 'cliente') {
      const required = ['genero', 'dataNascimento', 'cpf', 'telefone'] as const
      for (const key of required) {
        if (payload[key] === undefined || payload[key] === null) {
          return response.badRequest({ message: `Campo ${key} é obrigatório para clientes` })
        }
      }
    } else if (perfilTipo === 'profissional') {
      const required = ['funcaoId', 'genero', 'dataNascimento', 'cpf', 'telefone', 'registroConselho', 'conselhoUf'] as const
      for (const key of required) {
        if ((payload as any)[key] === undefined || (payload as any)[key] === null) {
          return response.badRequest({ message: `Campo ${key} é obrigatório para profissionais` })
        }
      }
    }

    if (payload.cpf) {
      const cpfCliente = await Cliente.findBy('cpf', payload.cpf)
      const cpfProfissional = await Profissional.findBy('cpf', payload.cpf)
      if (cpfCliente || cpfProfissional) {
        return response.conflict({ message: 'CPF já está cadastrado' })
      }
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
      
      if (perfilTipo === 'cliente') {
        await Cliente.create({
            id: user.id, 
            nome: fullName,
            genero: payload.genero as 'MASCULINO' | 'FEMININO',
            dataNascimento: payload.dataNascimento ? DateTime.fromJSDate(new Date(payload.dataNascimento)) : DateTime.now(),
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
            genero: payload.genero as 'MASCULINO' | 'FEMININO',
            dataNascimento: payload.dataNascimento ? DateTime.fromJSDate(new Date(payload.dataNascimento)) : DateTime.now(),
            cpf: payload.cpf,
            telefone: payload.telefone,
            email: user.email,
            senha: user.password,
            registroConselho: payload.registroConselho,
            conselhoUf: payload.conselhoUf,
            fotoPerfilUrl: payload.fotoPerfilUrl || null,
            biografia: payload.biografia || null,
            status: 'pendente',
            comprovanteCredenciamentoUrl: payload.comprovanteCredenciamentoUrl || null,
            observacoesAdmin: payload.observacoesAdmin || null,
          }, { client: trx })

        await Cliente.create({
            id: user.id, 
            nome: fullName,
            genero: payload.genero as 'MASCULINO' | 'FEMININO',
            dataNascimento: payload.dataNascimento ? DateTime.fromJSDate(new Date(payload.dataNascimento)) : DateTime.now(),
            cpf: payload.cpf,
            telefone: payload.telefone,
            email: user.email,
            senha: user.password
          }, { client: trx })
      }

      await trx.commit()

      const token = await (User as any).accessTokens.create(user)

      return response.created({
        message: 'Usuário registrado com sucesso',
        type: 'bearer',
        token: token.value!.release(),
        user: { 
            id: user.id, 
            email: user.email,
            perfilTipo: user.perfilTipo 
        }
      })

    } catch (error: any) {
      await trx.rollback()
      console.error(error)
      return response.status(500).json({ message: 'Erro ao registrar usuário', error: error.message || error })
    }
  }

  public async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    // CORREÇÃO: Casting para acessar propriedades dinâmicas do auth
    await (User as any).accessTokens.delete(user, (auth.user as any).currentAccessToken.identifier)
    return response.ok({ message: 'Deslogado com sucesso' })
  }

  public async esqueciSenha({ request, response }: HttpContext) {
    try {
      const { email } = request.only(['email'])
      const user = await User.findByOrFail('email', email)

      const token = crypto.randomBytes(20).toString('hex')
      const expiresAt = DateTime.now().plus({ hours: 1 })

      // CORREÇÃO: Usando casting para as colunas de token
      ;(user as any).passwordResetToken = token
      ;(user as any).passwordResetTokenExpiresAt = expiresAt
      await user.save()

      await mail.send((message) => {
        message
          .to(user.email)
          .from('clinicassgci@gmail.com')
          .subject('Recuperação de Senha')
          .htmlView('emails/esqueci_senha', {
            user: user.serialize(),
            link: `https://projeto-sgci.vercel.app/redefinir-senha?token=${token}`,
          })
      })

      return response.ok({ message: 'Se o e-mail estiver correto, um link foi enviado.' })
    } catch (error) {
      console.error(error)
      return response.ok({ message: 'Se o e-mail estiver correto, um link foi enviado.' })
    }
  }

  public async redefinirSenha({ request, response }: HttpContext) {
    try {
      const { token, password } = request.only(['token', 'password'])
      const user = await User.query()
        .where('passwordResetToken', token)
        .where('passwordResetTokenExpiresAt', '>', DateTime.now().toSQL())
        .firstOrFail()

      user.password = password
      ;(user as any).passwordResetToken = null
      ;(user as any).passwordResetTokenExpiresAt = null
      await user.save()

      return response.ok({ message: 'Senha redefinida com sucesso' })
    } catch (error) {
      return response.badRequest({ message: 'Token inválido ou expirado.' })
    }
  }
}