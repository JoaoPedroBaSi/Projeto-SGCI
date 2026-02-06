import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import Profissional from '#models/profissional'
import User from '#models/user'
import Funcao from '#models/funcao'
import { updateProfissionalValidator } from '#validators/validator_profissional'

export default class ProfissionaisController {

  public async index({ auth, response }: HttpContext) {
    /**
     * CORREÇÃO: Aplicando cast para User para acessar perfilTipo e id.
     */
    const userLogado = auth.user as unknown as User

    const profissionais = await Profissional.query()
      .preload('user')
      .preload('funcao')
      .preload('disponibilidades', (query) => {
        if (userLogado.perfilTipo === 'profissional') {
          query.where('profissionalId', userLogado.id)
        }
      })

    return response.ok(profissionais)
  }

  public async store({ request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const dados = request.all()

      const newUser = await User.create({
        fullName: dados.nome,
        email: dados.email,
        password: dados.senha,
        perfilTipo: 'profissional', 
        status: 'ativo'
      }, { client: trx })

      const funcao = await Funcao.firstOrCreate(
        { nome: 'MEDICO' },
        { nome: 'MEDICO' },
        { client: trx }
      )

      const profissional = await Profissional.create({
        id: newUser.id,
        funcaoId: funcao.id,
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.telefone,
        genero: dados.genero as any, 
        dataNascimento: dados.dataNascimento ? DateTime.fromISO(dados.dataNascimento) : undefined,
        email: dados.email,
        senha: await hash.make(dados.senha),
        registroConselho: dados.registro_conselho, 
        conselhoUf: dados.uf, 
        biografia: dados.biografia,
        status: 'aprovado'
      }, { client: trx })

      await trx.commit()
      return response.created(profissional)

    } catch (error: any) {
      await trx.rollback()
      console.error(error)
      return response.badRequest({
        message: 'Erro ao cadastrar profissional. Verifique duplicidade de E-mail ou CPF.',
        error: error.message || error
      })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const profissional = await Profissional.query()
        .where('id', params.id)
        .preload('user')
        .preload('funcao')
        .firstOrFail()

      return response.ok(profissional)
    } catch {
      return response.notFound({ message: 'Profissional não encontrado' })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      const payload = await request.validateUsing(updateProfissionalValidator)

      const dadosParaSalvar: any = { ...payload }
      
      if (dadosParaSalvar.dataNascimento && !(dadosParaSalvar.dataNascimento instanceof DateTime)) {
        dadosParaSalvar.dataNascimento = DateTime.fromJSDate(new Date(dadosParaSalvar.dataNascimento))
      }

      profissional.merge(dadosParaSalvar)
      await profissional.save()
      
      return response.ok(profissional)
    } catch (error: any) {
      return response.badRequest({ 
        message: 'Não foi possível atualizar o profissional', 
        error: error.message || error 
      })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      await profissional.delete()
      
      return response.ok({ message: 'Profissional removido com sucesso.', data: profissional })
    } catch {
      return response.notFound({ message: 'Profissional não encontrado para exclusão.' })
    }
  }

  public async associarEspecializacao({ params, request, response }: HttpContext) {
    try {
      const ids = request.input('especializacaoIds') as number[]
      const profissional = await Profissional.findOrFail(params.id)

      await profissional.related('especializacoes').sync(ids)
      await profissional.load('especializacoes')

      return response.ok(profissional)
    } catch (error) {
      return response.badRequest({ message: 'Erro ao associar especializações', error })
    }
  }

  public async atualizarStatus({ params, request, response }: HttpContext) {
    try {
      const profissional = await Profissional.findOrFail(params.id)
      const { status, observacoes_admin } = request.only(['status', 'observacoes_admin'])

      profissional.status = status
      if (observacoes_admin) {
        profissional.observacoesAdmin = observacoes_admin
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
        }
      } catch (mailError) {}

      return response.ok({ message: `Status alterado para ${status}.`, profissional })

    } catch (error) {
      return response.badRequest({ message: 'Erro ao atualizar status', error })
    }
  }
}