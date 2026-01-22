// eslint-disable prettier/prettier
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
  
  // ==========================================================
  // 🔐 LOGIN 
  // ==========================================================
  public async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      // 1. Verifica credenciais
      const user = await User.verifyCredentials(email, password)

      // 2. Cria token
      const token = await User.accessTokens.create(user)

      // 3. Lógica para saber quem é quem
      // Se ele é profissional, ele tem acesso total. Se não, é cliente.
      // O 'perfil_tipo' no banco já ajuda, mas vamos garantir.
      
      return response.ok({
        type: 'bearer',
        token: token.value!.release(),
        user: {
            id: user.id,
            email: user.email,
            // Retorna o tipo gravado no banco (profissional ou cliente)
            perfil_tipo: user.perfil_tipo, 
            name: user.fullName
        }
      })

    } catch (error) {
      return response.unauthorized({ message: 'Credenciais inválidas' })
    }
  }

  // ==========================================================
  // 📝 REGISTRO (LÓGICA NOVA: PROFISSIONAL TAMBÉM É CLIENTE)
  // ==========================================================
  public async register({ request, response }: HttpContext) {
    // Validação
    const payload = await request.validateUsing(registerValidator)
    const { fullName, email, password, perfil_tipo } = payload

    // Verifica duplicação de email
    const existing = await User.findBy('email', email)
    if (existing) {
      return response.conflict({ message: 'Email já está em uso' })
    }

    // Validações de campos obrigatórios específicos
    if (perfil_tipo === 'cliente') {
      const required = ['genero', 'dataNascimento', 'cpf', 'telefone']
      for (const key of required) {
        if ((payload as any)[key] === undefined || (payload as any)[key] === null) {
          return response.badRequest({ message: `Campo ${key} é obrigatório para clientes` })
        }
      }
    } else if (perfil_tipo === 'profissional') {
      const required = ['funcao_id', 'genero', 'dataNascimento', 'cpf', 'telefone', 'registro_conselho', 'conselho_uf']
      for (const key of required) {
        if ((payload as any)[key] === undefined || (payload as any)[key] === null) {
          return response.badRequest({ message: `Campo ${key} é obrigatório para profissionais` })
        }
      }
    }

    // Verifica CPF duplicado
    if (payload.cpf) {
      const cpfCliente = await Cliente.findBy('cpf', payload.cpf)
      const cpfProfissional = await Profissional.findBy('cpf', payload.cpf)
      if (cpfCliente || cpfProfissional) {
        return response.conflict({ message: 'CPF já está cadastrado' })
      }
    }

    // --- INÍCIO DA TRANSAÇÃO ---
    const trx = await db.transaction()
    
    try {
      // 1. Cria o Usuário Base (Login)
      const user = new User()
      user.email = email
      user.password = password
      user.fullName = fullName  
      user.perfil_tipo = perfil_tipo 
      user.status = perfil_tipo === 'profissional' ? 'pendente' : 'ativo'

      await user.useTransaction(trx).save()

      // 2. Lógica de Criação dos Perfis
      
      if (perfil_tipo === 'cliente') {
        // CASO 1: É apenas Cliente
        await Cliente.create({
            id: user.id, // ID COMPARTILHADO (Mesmo do User)
            name: fullName,
            genero: payload.genero,
            dataNascimento: payload.dataNascimento ? DateTime.fromJSDate(new Date(payload.dataNascimento)) : DateTime.now(),
            cpf: payload.cpf,
            telefone: payload.telefone,
            email: user.email,
            senha: user.password
          }, { client: trx })
      } 
      else if (perfil_tipo === 'profissional') {
        // CASO 2: É Profissional (E TAMBÉM CLIENTE!)
        
        // A. Cria a ficha técnica do Profissional
        await Profissional.create({
            id: user.id, // ID COMPARTILHADO
            funcaoId: payload.funcao_id,
            nome: fullName,
            genero: payload.genero,
            dataNascimento: payload.dataNascimento ? DateTime.fromJSDate(new Date(payload.dataNascimento)) : DateTime.now(),
            cpf: payload.cpf,
            telefone: payload.telefone,
            email: user.email,
            senha: user.password,
            registro_conselho: payload.registro_conselho,
            conselho_uf: payload.conselho_uf,
            foto_perfil_url: payload.foto_perfil_url || null,
            biografia: payload.biografia || null,
            status: 'pendente', // Profissional nasce pendente
            comprovante_credenciamento_url: payload.comprovante_credenciamento_url || null,
            observacoes_admin: payload.observacoes_admin || null,
          }, { client: trx })

        // B. Cria AUTOMATICAMENTE a ficha de Cliente (Paciente)
        // Isso permite que o médico seja atendido na clínica
        await Cliente.create({
            id: user.id, // O MESMO ID!
            name: fullName,
            genero: payload.genero,
            dataNascimento: payload.dataNascimento ? DateTime.fromJSDate(new Date(payload.dataNascimento)) : DateTime.now(),
            cpf: payload.cpf,
            telefone: payload.telefone,
            email: user.email,
            senha: user.password
          }, { client: trx })
      }

      await trx.commit()

      // Gera o token
      const token = await User.accessTokens.create(user)

      return response.created({
        message: 'Usuário registrado com sucesso',
        type: 'bearer',
        token: token.value!.release(),
        user: { 
            id: user.id, 
            email: user.email,
            perfil_tipo: user.perfil_tipo 
        }
      })

    } catch (error) {
      await trx.rollback()
      console.error(error)
      return response.status(500).json({ message: 'Erro ao registrar usuário', error: error.message })
    }
  }

  // ==========================================================
  // 🚪 LOGOUT
  // ==========================================================
  public async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return response.ok({ message: 'Deslogado com sucesso' })
  }

  // ==========================================================
  // 📧 RECUPERAÇÃO DE SENHA
  // ==========================================================
  public async esqueciSenha({ request, response }: HttpContext) {
    try {
      const { email } = request.only(['email'])
      const user = await User.findByOrFail('email', email)

      const token = crypto.randomBytes(20).toString('hex')
      const expiresAt = DateTime.now().plus({ hours: 1 })

      user.password_reset_token = token
      user.password_reset_token_expires_at = expiresAt
      await user.save()

      // Envia email simulado ou real
      await mail.send((message) => {
        message
          .to(user.email)
          .from('clinicassgci@gmail.com')
          .subject('Recuperação de Senha')
          .htmlView('emails/esqueci_senha', {
            user: user.serialize(),
            link: `http://localhost:3333/redefinir-senha?token=${token}`, // Ajuste para a URL do seu front
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
        .where('password_reset_token', token)
        .where('password_reset_token_expires_at', '>', DateTime.now().toSQL())
        .firstOrFail()

      user.password = password
      user.password_reset_token = null
      user.password_reset_token_expires_at = null
      await user.save()

      return response.ok({ message: 'Senha redefinida com sucesso' })
    } catch (error) {
      return response.badRequest({ message: 'Token inválido ou expirado.' })
    }
  }
}