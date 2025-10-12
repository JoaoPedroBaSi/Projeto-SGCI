// eslint-disable prettier/prettier
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'
import { registerValidator } from '#validators/register'
import db from '@adonisjs/lucid/services/db'

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
            user_id: user.id,
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
}
