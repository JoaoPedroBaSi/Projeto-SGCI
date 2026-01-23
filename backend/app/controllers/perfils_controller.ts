import { atualizarClienteValidator } from '#validators/atualizar_cliente'
import { atualizarProfissionalValidator } from '#validators/atualizar_profissional'
import type { HttpContext } from '@adonisjs/core/http'
// Importação necessária para tipagem, mas não usada para conversão manual
import { DateTime } from 'luxon'

export default class PerfilsController {

  // ============================================================
  // 👁️ SHOW: Retorna os dados do perfil logado
  // ============================================================
  public async show({ auth, response }: HttpContext) {
    try {
      // 1. Garante que o usuário está autenticado
      const user = auth.user!
      
      console.log('=== DEBUG PERFIL (SHOW) ===')
      console.log(`User ID: ${user.id} | Tipo: ${user.perfil_tipo}`)

      let perfil = null

      // 2. Carrega o relacionamento correto
      if (user.perfil_tipo === 'cliente') {
        await user.load('cliente')
        perfil = user.cliente
      } 
      else if (user.perfil_tipo === 'profissional') {
        await user.load('profissional')
        perfil = user.profissional
      }

      // 3. Monta a resposta
      // ATENÇÃO: Se perfil for null, mandamos um objeto vazio {} para o front não quebrar
      return response.ok({
        id: user.id,
        email: user.email,
        perfil_tipo: user.perfil_tipo,
        perfil: perfil || {}, 
        nome: user.fullName 
      })

    } catch (error) {
      console.error('❌ ERRO FATAL AO BUSCAR PERFIL:', error)
      return response.internalServerError({ message: 'Erro interno ao buscar perfil.' })
    }
  }

  // ============================================================
  // ✏️ UPDATE: Atualiza os dados
  // ============================================================
  public async update({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      console.log('=== DEBUG PERFIL (UPDATE) ===')
      
      if (user.perfil_tipo === 'cliente') {
        // Valida
        const dados = await request.validateUsing(atualizarClienteValidator)
        
        // Carrega
        await user.load('cliente')

        if (!user.cliente) {
             return response.badRequest({ message: 'Ficha de Cliente não encontrada.' })
        }
        
        // CORREÇÃO DA DATA:
        // O validador já retorna um DateTime do Luxon. Não usamos fromJSDate.
        const dadosFormatados = {
            ...dados,
            dataNascimento: dados.dataNascimento as unknown as DateTime
        }

        // Salva
        user.cliente.merge(dadosFormatados)
        await user.cliente.save()
        
        // Sincroniza nome
        if (dados.nome) {
            user.fullName = dados.nome
            await user.save()
        }

        return response.ok(user.cliente)

      } else if (user.perfil_tipo === 'profissional') {
        // Valida
        const dados = await request.validateUsing(atualizarProfissionalValidator)
        
        // Carrega
        await user.load('profissional')
        
        if (!user.profissional) {
            return response.badRequest({ message: 'Ficha de Profissional não encontrada.' })
        }

        // CORREÇÃO DA DATA
        const dadosFormatados = {
            ...dados,
            dataNascimento: dados.dataNascimento as unknown as DateTime
        }

        // Salva
        user.profissional.merge(dadosFormatados)
        await user.profissional.save()
        
        if (dados.nome) {
            user.fullName = dados.nome
            await user.save()
        }

        return response.ok(user.profissional)

      } else {
        return response.badRequest({ message: 'Tipo de perfil inválido.' })
      }

    } catch (error: any) {
      console.error('❌ ERRO AO ATUALIZAR:', error)
      if (error.status === 422) {
          return response.unprocessableEntity(error.messages)
      }
      return response.badRequest({ message: 'Não foi possível atualizar o perfil.' })
    }
  }
}