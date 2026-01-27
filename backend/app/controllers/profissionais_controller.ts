/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import Profissional from '#models/profissional'
import User from '#models/user'
import Funcao from '#models/funcao'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { updateProfissionalValidator } from '#validators/validator_profissional'
import mail from '@adonisjs/mail/services/main'
import hash from '@adonisjs/core/services/hash' // <--- 1. IMPORTAMOS O HASH

export default class ProfissionaisController {
  
  // --- LISTAR TODOS ---
  public async index({ response }: HttpContext) {
    try {
      const profissionais = await Profissional.query()
        .preload('user')
        .preload('funcao')
      
      return response.status(200).send(profissionais)
    } catch (error) {
      console.error("ERRO AO LISTAR PROFISSIONAIS:", error)
      return response.status(500).send({ message: 'Erro ao listar profissionais', originalError: error })
    }
  }

  // --- CRIAR (MÉTODO DO ADMIN) ---
  public async store({ request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const dados = request.all()
      
      console.log("Tentando cadastrar profissional:", dados.email)

      // 2. Cria o Usuário de Acesso (Tabela users)
      // O Model User já criptografa sozinho
      const newUser = await User.create({
        fullName: dados.nome,
        email: dados.email,
        password: dados.senha,
        perfil_tipo: 'profissional',
        status: 'ativo'
      }, { client: trx })

      // 3. Busca ou Cria a Função "MEDICO"
      const funcao = await Funcao.firstOrCreate(
        { nome: 'MEDICO' },
        { nome: 'MEDICO' },
        { client: trx }
      )

      // 4. Cria o Perfil Profissional (Tabela profissionais)
      const profissional = await Profissional.create({
        id: newUser.id,
        funcaoId: funcao.id,
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.telefone,
        
        genero: dados.genero as any,
        
        dataNascimento: dados.dataNascimento ? DateTime.fromISO(dados.dataNascimento) : undefined,
        
        email: dados.email,
        
        // CORREÇÃO DE SEGURANÇA AQUI:
        // Criptografamos a senha manualmente antes de salvar na tabela profissionais
        senha: await hash.make(dados.senha), 

        registro_conselho: dados.registro_conselho,
        conselho_uf: dados.uf,
        biografia: dados.biografia,
        status: 'aprovado'
      }, { client: trx })

      // 5. Confirma a transação
      await trx.commit()

      return response.created(profissional)

    } catch (error) {
      await trx.rollback()
      console.error("ERRO AO CRIAR PROFISSIONAL:", error)
      
      return response.badRequest({ 
        message: 'Erro ao cadastrar profissional. Verifique se o e-mail ou CPF já existem.',
        error: error.message || error 
      })
    }
  }

  // --- MOSTRAR UM ---
  public async show({ params, response }: HttpContext) {
    try {
      const profissional = await Profissional.query()
        .where('id', params.id)
        .preload('user')
        .preload('funcao')
        .firstOrFail()

      return response.status(200).send(profissional)
    } catch {
      return response.status(404).send({ message: 'Profissional não encontrado' })
    }
  }

  // --- ATUALIZAR ---
  public async update({ params, request, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      const payload = await request.validateUsing(updateProfissionalValidator)

      profissional.merge({
        ...payload,
        genero: payload.genero as any,
        dataNascimento: payload.dataNascimento
            ? DateTime.fromJSDate(payload.dataNascimento)
            : profissional.dataNascimento,
      })

      await profissional.save()
      return response.status(200).send(profissional)
    } catch (error) {
      console.error(error)
      return response.status(400).send({ message: 'Não foi possível atualizar o profissional', error })
    }
  }

  // --- DELETAR ---
  public async destroy({ params, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      await profissional.delete()
      return response.status(200).send(profissional)
    } catch {
      return response.status(404).send({ message: 'Profissional não encontrado' })
    }
  }

  // --- ESPECIALIZAÇÕES ---
  public async associarEspecializacao({ params, request, response }: HttpContext) {
    try {
      const ids = request.input('especializacaoIds') as number[]
      const profissional = await Profissional.findOrFail(params.id)

      await profissional.related('especializacoes').sync(ids)
      await profissional.load('especializacoes')

      return response.status(200).send(profissional)
    } catch (error) {
      return response.status(400).send({ message: 'Erro ao associar especializações', error })
    }
  }

  // --- APROVAÇÃO/REJEIÇÃO ---
  public async atualizarStatus({ params, request, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      const { status, observacoes_admin } = request.only(['status', 'observacoes_admin'])

      profissional.status = status
      if (observacoes_admin) {
        profissional.observacoes_admin = observacoes_admin
      }
      
      await profissional.save()

      try {
        const user = await profissional.related('user').query().first()
        
        if (user) {
            await mail.send((message) => {
            message
                .to(user.email)
                .from('clinicassgci@gmail.com')
                .subject(`SGCI: Atualização de Cadastro - ${status.toUpperCase()}`)
                .html(`
                  <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Olá, ${profissional.nome}!</h2>
                    <p>Informamos que o status do seu cadastro no sistema SGCI foi atualizado para:</p>
                    <h3 style="color: ${status === 'aprovado' ? 'green' : 'red'};">${status.toUpperCase()}</h3>
                    
                    ${observacoes_admin ? `
                      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; margin: 20px 0;">
                        <strong>Observação do Administrador:</strong><br>
                        ${observacoes_admin}
                      </div>
                    ` : ''}
                    
                    <p>Atenciosamente,<br>Equipe SGCI</p>
                  </div>
                `)
            })
            console.log(`E-mail de ${status} enviado para ${user.email}`)
        }
      } catch (mailError) {
        console.warn("ALERTA: Status salvo, mas e-mail falhou.", mailError)
      }

      return response.status(200).send({ message: `Status alterado para ${status}.`, profissional })
    
    } catch (error) {
      console.error("ERRO AO ATUALIZAR STATUS:", error)
      return response.status(400).send({ message: 'Erro ao atualizar status', error })
    }
  }
}