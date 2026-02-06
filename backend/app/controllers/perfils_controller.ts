import type { HttpContext } from '@adonisjs/core/http'
import { atualizarClienteValidator } from '#validators/atualizar_cliente'
import { atualizarProfissionalValidator } from '#validators/atualizar_profissional'
import { DateTime } from 'luxon'

export default class PerfilsController {

  public async show({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      let perfil = null

      // CORREÇÃO: perfil_tipo -> perfilTipo
      if (user.perfilTipo === 'cliente') {
        await user.load('cliente')
        perfil = user.cliente
      } 
      else if (user.perfilTipo === 'profissional') {
        await user.load('profissional')
        perfil = user.profissional
      }

      return response.ok({
        id: user.id,
        email: user.email,
        perfilTipo: user.perfilTipo,
        perfil: perfil || {}, 
        nome: user.fullName 
      })

    } catch (error) {
      return response.internalServerError({ message: 'Erro interno ao buscar perfil.' })
    }
  }

  public async update({ auth, request, response }: HttpContext) {
    const user = auth.user!
    
    try {
      // CORREÇÃO: perfil_tipo -> perfilTipo
      if (user.perfilTipo === 'cliente') {
        const dados = await request.validateUsing(atualizarClienteValidator)
        await user.load('cliente')

        if (!user.cliente) {
             return response.badRequest({ message: 'Ficha de Cliente não encontrada.' })
        }
        
        const { nome, ...dadosPerfil } = dados

        // CORREÇÃO: Tratamento simplificado de data para evitar erros de tipo
        const perfilToMerge = { ...dadosPerfil } as any
        if (perfilToMerge.dataNascimento && !(perfilToMerge.dataNascimento instanceof DateTime)) {
          perfilToMerge.dataNascimento = DateTime.fromJSDate(new Date(perfilToMerge.dataNascimento))
        }
        
        user.cliente.merge(perfilToMerge)
        await user.cliente.save()
        
        if (nome) {
            user.fullName = nome
            await user.save()
        }

        return response.ok(user.cliente)

      } else if (user.perfilTipo === 'profissional') {
        const dados = await request.validateUsing(atualizarProfissionalValidator)
        await user.load('profissional')
        
        if (!user.profissional) {
            return response.badRequest({ message: 'Ficha de Profissional não encontrada.' })
        }

        const { nome, ...dadosPerfil } = dados

        const perfilToMergeProf = { ...dadosPerfil } as any
        if (perfilToMergeProf.dataNascimento && !(perfilToMergeProf.dataNascimento instanceof DateTime)) {
          perfilToMergeProf.dataNascimento = DateTime.fromJSDate(new Date(perfilToMergeProf.dataNascimento))
        }

        user.profissional.merge(perfilToMergeProf)
        await user.profissional.save()
        
        if (nome) {
            user.fullName = nome
            await user.save()
        }

        return response.ok(user.profissional)

      } else {
        return response.badRequest({ message: 'Tipo de perfil inválido.' })
      }

    } catch (error: any) {
      if (error.status === 422) {
          return response.unprocessableEntity({ 
            message: 'Erro de validação', 
            errors: error.messages 
          })
      }
      return response.badRequest({ message: 'Não foi possível atualizar o perfil.', error: error.message })
    }
  }
}