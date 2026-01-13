import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'
import Funcao from '#models/funcao'
import { registerValidator } from '#validators/register'
import db from '@adonisjs/lucid/services/db'
import crypto from 'node:crypto'
import mail from '@adonisjs/mail/services/main'

export default class AuthController {
  
  // --- LOGIN ---
  public async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      // CORREÇÃO CRUCIAL: Forçar minúsculo para evitar erro de Case Sensitive
      const emailFinal = email.toLowerCase().trim()

      const user = await User.verifyCredentials(emailFinal, password)
      const token = await User.accessTokens.create(user)

      return response.ok({
        message: 'Login realizado com sucesso.',
        token: token,
        user: user.serialize(),
      })
    } catch (error) {
      return response.unauthorized({ message: 'E-mail ou senha incorretos.' })
    }
  }

  // --- REGISTRO ---
  public async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const { fullName, email, password, perfil_tipo } = payload

    // CORREÇÃO CRUCIAL: Forçar minúsculo ao registrar
    const emailFinal = email.toLowerCase().trim()

    // Verifica duplicidade no USER (Usando o email tratado)
    const existing = await User.findBy('email', emailFinal)
    if (existing) return response.conflict({ message: 'Email já está em uso no sistema.' })

    // Validação específica de profissional
    if (perfil_tipo === 'profissional') {
       if (!payload.funcao_id) return response.badRequest({ message: 'Selecione uma profissão.' })
       
       const funcId = Number(payload.funcao_id)
       const funcaoExiste = await Funcao.find(funcId)
       
       if (!funcaoExiste) await Funcao.create({ id: funcId, nome: 'Profissional de Saúde' })
    }

    // Verifica CPF duplicado
    if (payload.cpf) {
      const cpfCliente = await Cliente.findBy('cpf', payload.cpf)
      const cpfProfissional = await Profissional.findBy('cpf', payload.cpf)
      if (cpfCliente || cpfProfissional) return response.conflict({ message: 'CPF já está cadastrado.' })
    }

    const trx = await db.transaction()
    try {
      // 1. Cria o User
      const user = new User()
      user.fullName = fullName
      user.email = emailFinal // <--- Salva minúsculo
      user.password = password 
      user.perfil_tipo = perfil_tipo
      user.status = perfil_tipo === 'profissional' ? 'pendente' : 'ativo'
      await user.useTransaction(trx).save()

      // 2. Cria o Perfil Específico
      if (perfil_tipo === 'cliente') {
        await Cliente.create({
            userId: user.id, 
            id: user.id, 
            nome: fullName, 
            genero: payload.genero,
            dataNascimento: payload.dataNascimento ? DateTime.fromJSDate(new Date(payload.dataNascimento)) : undefined,
            cpf: payload.cpf, 
            telefone: payload.telefone,
          }, { client: trx })
      } 
      else if (perfil_tipo === 'profissional') {
        await Profissional.create({
            userId: user.id, 
            id: user.id, 
            funcaoId: Number(payload.funcao_id),
            nome: fullName,
            email: emailFinal, // <--- Salva minúsculo aqui também
            genero: payload.genero,
            dataNascimento: payload.dataNascimento ? DateTime.fromJSDate(new Date(payload.dataNascimento)) : undefined,
            cpf: payload.cpf, 
            telefone: payload.telefone, 
            registro_conselho: payload.registro_conselho,
            conselho_uf: payload.conselho_uf, 
            biografia: payload.biografia, 
            status: 'pendente'
          }, { client: trx })
      }
      
      await trx.commit()
      return response.created({ message: 'Cadastro realizado com sucesso!', user })
    } catch (error) {
      await trx.rollback()
      console.error('Erro no registro:', error)
      return response.status(500).json({ message: 'Erro interno ao salvar usuário.', details: error.message })
    }
  }

  // --- ESQUECI SENHA ---
  public async esqueciSenha({ request, response }: HttpContext) {
    const { email } = request.only(['email'])
    
    // CORREÇÃO: Trata o email aqui também
    const emailFinal = email ? email.toLowerCase().trim() : ''

    try {
      const user = await User.findByOrFail('email', emailFinal)
      const token = crypto.randomBytes(20).toString('hex')
      const expiresAt = DateTime.now().plus({ hours: 1 })
      user.password_reset_token = token
      user.password_reset_token_expires_at = expiresAt
      await user.save()
      
      console.log(`LINK: http://localhost:5173/redefinir-senha?token=${token}`)
      
      try {
        await mail.send((message) => {
           message.to(user.email).from('nao-responda@sgci.com').subject('Recuperação de Senha')
           .html(`Clique aqui: <a href="http://localhost:5173/redefinir-senha?token=${token}">Recuperar Senha</a>`)
        })
      } catch (e) { console.log("Erro SMTP (ignorável em dev):", e.message) }

      return response.ok({ message: 'Se o e-mail estiver correto, um link foi enviado.' })
    } catch (error) {
      return response.ok({ message: 'Se o e-mail estiver correto, um link foi enviado.' })
    }
  }

  // --- REDEFINIR SENHA ---
  public async redefinirSenha({ request, response }: HttpContext) {
    try {
      const body = request.all()
      const token = body.token
      const rawPassword = body.password || body.newPassword || body.senha
      
      if (!rawPassword) return response.badRequest({ message: 'Nova senha é obrigatória.' })

      const user = await User.query()
        .where('password_reset_token', token)
        .where('password_reset_token_expires_at', '>', DateTime.now().toSQL())
        .firstOrFail()

      user.password = rawPassword
      user.password_reset_token = null
      user.password_reset_token_expires_at = null
      await user.save() 
      
      return response.ok({ message: 'Senha redefinida com sucesso.' })
    } catch (error) {
      return response.badRequest({ message: 'Token inválido ou expirado.' })
    }
  }

  // --- TROCAR SENHA (LOGADO) ---
  public async changePassword({ request, response, auth }: HttpContext) {
    const body = request.all()
    const currentPassword = body.currentPassword || body.current_password
    const newPassword = body.newPassword || body.new_password
    const user = auth.user!

    try {
      // Verifica se a senha atual está correta
      await User.verifyCredentials(user.email, currentPassword)
      
      user.password = newPassword
      await user.save()
      
      return response.ok({ message: 'Senha alterada com sucesso.' })
    } catch (error) {
      return response.badRequest({ message: 'A senha atual informada está incorreta.' })
    }
  }
}