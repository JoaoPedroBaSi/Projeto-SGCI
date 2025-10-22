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
  public async register({ request, response }: HttpContext) {
    // Validação dos campos básicos e adicionais do usuário cliente ou profissional
    const payload = await request.validateUsing(registerValidator)

    // Salva os dados compartilhados entre cliente e profissional no payload
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { fullName, email, password, perfil_tipo } = payload

    // Validações adicionais antes de salvar os dados
    // Verifica se o email já está em uso
    const existing = await User.findBy('email', email)
    if (existing) {
      return response.conflict({ message: 'Email já está em uso' })
    }

    // Valida a obrigatoriedade dos campos específicos para cada tipo de perfil
    // Cliente
    if (perfil_tipo === 'cliente') {
      const required = ['genero', 'dataNascimento', 'cpf', 'telefone']
      for (const key of required) {
        if ((payload as any)[key] === undefined || (payload as any)[key] === null) {
          return response.badRequest({ message: `Campo ${key} é obrigatório para clientes` })
        }
      }
    }
    // Profissional
    else if (perfil_tipo === 'profissional') {
      const required = [
        'funcao_id',
        'genero',
        'dataNascimento',
        'cpf',
        'telefone',
        'registro_conselho',
        'conselho_uf',
      ]
      for (const key of required) {
        if ((payload as any)[key] === undefined || (payload as any)[key] === null) {
          return response.badRequest({ message: `Campo ${key} é obrigatório para profissionais` })
        }
      }
    }

    // Valida se o CPF já está cadastrado no sistema
    if (payload.cpf) {
      const cpfCliente = await Cliente.findBy('cpf', payload.cpf)
      const cpfProfissional = await Profissional.findBy('cpf', payload.cpf)
      if (cpfCliente || cpfProfissional) {
        return response.conflict({ message: 'CPF já está cadastrado' })
      }
    }

    // trx garante que um usuário só será criado se todas as transações forem concluídas com sucesso (user + cliente || user + profissional)
    const trx = await db.transaction()
    try {
      // Criação do usuário
      const user = new User()
      user.fullName = fullName
      user.email = email
      user.password = password
      user.perfil_tipo = perfil_tipo
      user.status = perfil_tipo === 'profissional' ? 'pendente' : 'ativo'

      await user.useTransaction(trx).save()

      if (perfil_tipo === 'cliente') {
        await Cliente.create(
          {
            user_id: user.id,
            nome: fullName,
            genero: payload.genero,
            dataNascimento: payload.dataNascimento ? new Date(payload.dataNascimento) : undefined,
            cpf: payload.cpf,
            telefone: payload.telefone,
          },
          { client: trx }
        )
      } else if (perfil_tipo === 'profissional') {
        await Profissional.create(
          {
            userId: user.id,
            funcaoId: payload.funcao_id,
            nome: fullName,
            genero: payload.genero,
            dataNascimento: payload.dataNascimento
              ? DateTime.fromJSDate(new Date(payload.dataNascimento))
              : undefined,
            cpf: payload.cpf,
            telefone: payload.telefone,
            registro_conselho: payload.registro_conselho,
            conselho_uf: payload.conselho_uf,
            foto_perfil_url: payload.foto_perfil_url || null,
            biografia: payload.biografia || null,
            status: 'pendente', // Profissionais começam como pendentes
            comprovante_credenciamento_url: payload.comprovante_credenciamento_url || null,
            observacoes_admin: payload.observacoes_admin || null,
          },
          { client: trx }
        )
      } else if (perfil_tipo === 'admin') {
        // Admin criado apenas no User, sem tabelas de perfil
        // O hook do model garante que a senha será criptografada
      }

      await trx.commit()
      return response.created({ message: 'Usuário registrado com sucesso' })
    } catch (error) {
      await trx.rollback()
      return response.status(500).json({ message: 'Erro ao registrar usuário', error })
    }
  }

  public async esqueciSenha({ request, response }: HttpContext) {
    try {
      const { email } = request.only(['email'])

      // --- PARTE 1: LÓGICA INTERNA (Atualizar o Banco) ---
      const user = await User.findByOrFail('email', email)

      const token = crypto.randomBytes(20).toString('hex')
      const expiresAt = DateTime.now().plus({ hours: 1 })

      user.password_reset_token = token
      user.password_reset_token_expires_at = expiresAt
      await user.save()

      // --- PARTE 2: LÓGICA EXTERNA (Enviar o E-mail) ---
      await mail.send((message) => {
        message
          .to(user.email)
          .from('clinicassgci@gmail.com')
          .subject('Recuperação de Senha do seu App')
          // Dizendo ao Adonis para usar o molde que criamos
          .htmlView('emails/esqueci_senha', {
            // Enviando os dados para preencher o molde
            user: user.serialize(),
            link: `http://localhost:3333/redefinir-senha?token=${token}` // Link para o seu Front-end
          })
      })

      return response.ok({ message: "Se o e-mail estiver correto, um link foi enviado." })

    } catch (error) {
      // É uma boa prática dar a mesma resposta para não confirmar se um e-mail existe ou não
      console.error(error) // Para você ver o erro no terminal
      return response.ok({ message: "Se o e-mail estiver correto, um link foi enviado." })
    }
  }

  public async redefinirSenha({request, response}: HttpContext) {
    // 1. Crie um Validator para isto para garantir que o token e a senha são enviados!
    try {
      const { token, password } = request.only(['token', 'password'])
      const user = await User.query()
      .where('password_reset_token', token)
      .where('password_reset_token_expires_at', '>', DateTime.now().toSQL()).firstOrFail()

      user.password = password

      user.password_reset_token = null
      user.password_reset_token_expires_at = null
      await user.save()

      return response.ok({
        message: 'Senha redefinida com sucesso'
      })
    } catch (error) {
      return response.badRequest({
        message: 'Token inválido, expirado ou a senha não cumpre os requisitos.'
      })
    }
  }
    // NOVO MÉTODO PARA MOSTRAR A PÁGINA
  public async showRedefinirSenha({ view, request }: HttpContext) {
    // Pega o token da URL (ex: ?token=abc)
    const { token } = request.only(['token'])

    // Renderiza a página HTML e passa o token para ela
    // O token será enviado de volta no formulário
    return view.render('emails/redefinir_senha_form', { token }) 
  }
  }

