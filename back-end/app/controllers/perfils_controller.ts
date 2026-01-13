import { atualizarClienteValidator } from '#validators/atualizar_cliente'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import vine from '@vinejs/vine' 

export default class PerfilsController {

  public async show({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      let perfil = null

      if (user.perfil_tipo === 'cliente') {
        await user.load('cliente')
        perfil = user.cliente
      } else if (user.perfil_tipo === 'profissional') {
        await user.load('profissional')
        perfil = user.profissional
      }

      return response.ok({
        id: user.id,
        email: user.email,
        perfil_tipo: user.perfil_tipo,
        perfil: perfil,
      })
    } catch (error) {
      return response.internalServerError({ message: 'Erro ao buscar perfil' })
    }
  }

  public async update({ auth, request, response }: HttpContext) {
    // Mudei a mensagem do log para termos CERTEZA que o arquivo atualizou
    console.log('🚀 [NOVO ARQUIVO RODANDO] Front enviou:', request.all())

    try {
      const user = auth.user!
      await user.load('cliente')
      await user.load('profissional')

      const toDateTime = (val: any) => {
        if (!val) return undefined
        if (DateTime.isDateTime(val)) return val
        if (val instanceof Date) return DateTime.fromJSDate(val)
        return DateTime.fromISO(val)
      }

      if (user.perfil_tipo === 'cliente') {
        const dados = await request.validateUsing(atualizarClienteValidator)
        const dadosAny = dados as any
        user.cliente.merge({
            nome: dados.nome,
            cpf: dadosAny.cpf,
            telefone: dados.telefone,
            genero: dadosAny.genero,
            dataNascimento: toDateTime(dados.dataNascimento || dadosAny.data_nascimento)
        })
        await user.cliente.save()
        return response.ok(user.cliente)

      } else if (user.perfil_tipo === 'profissional') {
        
        // DEFININDO A REGRA AQUI MESMO PARA NÃO TER ERRO DE IMPORTAÇÃO
        const schema = vine.object({
            funcao_id: vine.number().optional(),
            nome: vine.string().optional(),
            genero: vine.enum(['MASCULINO', 'FEMININO']).optional(),
            cpf: vine.string().optional(),
            telefone: vine.string().optional(),
            // Aceita os dois jeitos (camelCase e snake_case)
            dataNascimento: vine.date().optional(),
            data_nascimento: vine.date().optional(),
            registro_conselho: vine.string().optional(),
            conselho_uf: vine.string().optional(),
            biografia: vine.string().optional(),
            foto_perfil_url: vine.string().optional(),
            status: vine.enum(['pendente', 'aprovado', 'rejeitado']).optional(),
            observacoes_admin: vine.string().optional(),
        })

        const validator = vine.compile(schema)
        const dados = await validator.validate(request.all())
        const dadosLimpos = dados as any
        
        console.log('✅ [VALIDADO E COMPLETO]:', dadosLimpos)

        user.profissional.merge({
          nome: dadosLimpos.nome,
          cpf: dadosLimpos.cpf,
          telefone: dadosLimpos.telefone,
          genero: dadosLimpos.genero,
          biografia: dadosLimpos.biografia,
          registro_conselho: dadosLimpos.registro_conselho,
          conselho_uf: dadosLimpos.conselho_uf,
          dataNascimento: toDateTime(dadosLimpos.dataNascimento || dadosLimpos.data_nascimento)
        })

        await user.profissional.save()
        console.log('💾 [SALVO] Banco atualizado!')
        return response.ok(user.profissional)
      }
    } catch (error: any) {
      console.error('❌ [ERRO]:', error)
      return response.badRequest({ message: 'Erro ao atualizar', errors: error.messages })
    }
  }
}