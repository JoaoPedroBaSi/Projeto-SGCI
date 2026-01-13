// eslint-disable prettier/prettier
import type { HttpContext } from '@adonisjs/core/http'
import Profissional from '#models/profissional'
import { DateTime } from 'luxon'
import { storeProfissionalValidator, updateProfissionalValidator } from '#validators/validator_profissional'
import mail from '@adonisjs/mail/services/main'

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

  // --- CRIAR ---
  public async store({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeProfissionalValidator)
      
      const profissional = await Profissional.create({
        ...payload,
        userId: auth.user!.id,
        dataNascimento: DateTime.fromJSDate(payload.dataNascimento),
      })

      return response.status(201).send(profissional)
    } catch (error) {
      console.error("ERRO AO CRIAR PROFISSIONAL:", error)
      return response.status(400).send({ message: 'Não foi possível criar o profissional', error })
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

  // --- APROVAÇÃO/REJEIÇÃO (COM EMAIL E OBSERVAÇÃO) ---
  public async atualizarStatus({ params, request, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      // Captura status e a observação (se houver)
      const { status, observacoes_admin } = request.only(['status', 'observacoes_admin'])

      // 1. Atualiza no Banco
      profissional.status = status
      if (observacoes_admin) {
        profissional.observacoes_admin = observacoes_admin
      }
      
      await profissional.save()

      // 2. Envia E-mail
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
        console.warn("ALERTA: Status salvo, mas e-mail falhou (Verifique SMTP).", mailError)
      }

      return response.status(200).send({ message: `Status alterado para ${status}.`, profissional })
    
    } catch (error) {
      console.error("ERRO AO ATUALIZAR STATUS:", error)
      return response.status(400).send({ message: 'Erro ao atualizar status', error })
    }
  }
}