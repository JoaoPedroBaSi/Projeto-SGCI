import { atualizarClienteValidator } from '#validators/atualizar_cliente'
import { atualizarProfissionalValidator } from '#validators/atualizar_profissional'
import type { HttpContext } from '@adonisjs/core/http'
// A importação continua necessária para o tipo no Model, mas não para conversão aqui
import { DateTime } from 'luxon'

export default class PerfilsController {

  // ============================================================
  // 👁️ SHOW: Retorna os dados do perfil logado
  // ============================================================
  public async show({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      
      console.log('=== DEBUG PERFIL (SHOW) ===')
      console.log(`User ID: ${user.id} | Tipo: ${user.perfil_tipo}`)

      let perfil = null

      if (user.perfil_tipo === 'cliente') {
        await user.load('cliente')
        perfil = user.cliente
      } 
      else if (user.perfil_tipo === 'profissional') {
        await user.load('profissional')
        perfil = user.profissional
      }

      if (!perfil) {
        console.warn(`⚠️ ALERTA: Perfil de ${user.perfil_tipo} não encontrado para o ID ${user.id}`)
      } else {
        console.log('✅ Perfil carregado com sucesso.')
      }

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
        // 1. Valida dados
        const dados = await request.validateUsing(atualizarClienteValidator)
        
        // 2. Carrega relacionamento
        await user.load('cliente')

        if (!user.cliente) {
             return response.badRequest({ message: 'Ficha de Cliente não encontrada. Contate o suporte.' })
        }
        
        // 3. CORREÇÃO DA DATA:
        // O erro dizia que 'dados.dataNascimento' já é um DateTime.
        // Então passamos direto. Se ele vier undefined, passamos undefined.
        const dadosFormatados = {
            ...dados,
            // Se o TypeScript reclamar que tipos não batem, o 'as any' resolve, 
            // mas aqui a lógica é: se já é DateTime, usa ele mesmo.
            dataNascimento: dados.dataNascimento as unknown as DateTime
        }

        // 4. Salva
        user.cliente.merge(dadosFormatados)
        await user.cliente.save()
        
        if (dados.nome) {
            user.fullName = dados.nome
            await user.save()
        }

        return response.ok(user.cliente)

      } else if (user.perfil_tipo === 'profissional') {
        // 1. Valida dados
        const dados = await request.validateUsing(atualizarProfissionalValidator)
        
        // 2. Carrega relacionamento
        await user.load('profissional')
        
        if (!user.profissional) {
            return response.badRequest({ message: 'Ficha de Profissional não encontrada. Contate o suporte.' })
        }

        // 3. CORREÇÃO DA DATA
        const dadosFormatados = {
            ...dados,
            // Passamos direto pois o validador já entregou um objeto DateTime
            dataNascimento: dados.dataNascimento as unknown as DateTime
        }

        // 4. Salva
        user.profissional.merge(dadosFormatados)
        await user.profissional.save()
        
        if (dados.nome) {
            user.fullName = dados.nome
            await user.save()
        }

        return response.ok(user.profissional)

      } else {
        return response.badRequest({ message: 'Tipo de perfil inválido para atualização.' })
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