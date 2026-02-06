import type { HttpContext } from '@adonisjs/core/http'
import { atualizarClienteValidator } from '#validators/atualizar_cliente'
import { atualizarProfissionalValidator } from '#validators/atualizar_profissional'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class PerfilsController {

  public async show({ auth, response }: HttpContext) {
    try {
      /**
       * CORREÇÃO DO CAST:
       * Convertemos para 'unknown' primeiro e depois para 'User'.
       * Isso silencia o erro ts(2352).
       */
      const user = auth.user as unknown as User
      let perfil = null

      if (user.perfilTipo === 'cliente') {
        await user.load('cliente' as any)
        perfil = user.cliente
      } 
      else if (user.perfilTipo === 'profissional') {
        await user.load('profissional' as any)
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
      console.error(error)
      return response.internalServerError({ message: 'Erro interno ao buscar perfil.' })
    }
  }

  public async update({ auth, request, response }: HttpContext) {
    // Aplicamos a mesma correção de cast aqui
    const user = auth.user as unknown as User
    
    try {
      if (user.perfilTipo === 'cliente') {
        const dados = await request.validateUsing(atualizarClienteValidator)
        await user.load('cliente' as any)

        if (!user.cliente) {
             return response.badRequest({ message: 'Ficha de Cliente não encontrada.' })
        }
        
        const { nome, ...dadosPerfil } = dados

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
        await user.load('profissional' as any)
        
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