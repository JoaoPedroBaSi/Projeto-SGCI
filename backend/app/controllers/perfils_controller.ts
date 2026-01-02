import { atualizarClienteValidator } from '#validators/atualizar_cliente'
import { atualizarProfissionalValidator } from '#validators/atualizar_profissional'
import type { HttpContext } from '@adonisjs/core/http'


export default class PerfilsController {

   // Busca e retorna o perfil completo do utilizador autenticado
   // Este método corresponde à rota GET /me no arquivo de rotas
  public async show({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      let perfil

      // 2. Lógica para carregar a "Ficha Cadastral" correta
      // Verificamos a "anotação" no crachá para saber qual gaveta abrir.
      if (user.perfil_tipo === 'cliente') {
        // Se for cliente, carregamos a relação 'cliente'.
        await user.load('cliente')
        perfil = user.cliente
      } else if (user.perfil_tipo === 'profissional') {
        // Se for profissional, carregamos a relação 'profissional'.
        await user.load('profissional')
        perfil = user.profissional
      } else {
        // Medida de segurança caso o perfil não esteja definido.
        return response.notFound({ message: 'Perfil não encontrado.' })
      }

      // 3. Devolver a resposta completa e organizada
      return response.ok({
        id: user.id,
        email: user.email,
        perfil_tipo: user.perfil_tipo,
        perfil: perfil, // O objeto 'perfil' conterá os dados de Cliente ou Profissional
      })
    } catch (error) {
      // Se algo der errado (ex: o relacionamento não está definido no Model), o erro será capturado aqui.
      console.error('Erro ao buscar perfil:', error)
      return response.internalServerError({ message: 'Ocorreu um erro ao buscar o perfil.' })
    }
  }

public async update({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      await user.load('cliente') // Carrega as relações para podermos editá-las
      await user.load('profissional')

      let dados

      // 2. Lógica para escolher o "segurança" (Validator) correto
      if (user.perfil_tipo === 'cliente') {
        dados = await request.validateUsing(atualizarClienteValidator)
        // 3. Aplica as alterações ao perfil de cliente
        user.cliente.merge(dados)
        await user.cliente.save()
        return response.ok(user.cliente)

      } else if (user.perfil_tipo === 'profissional') {
        dados = await request.validateUsing(atualizarProfissionalValidator)
        // 3. Aplica as alterações ao perfil de profissional
        user.profissional.merge(dados)
        await user.profissional.save()
        return response.ok(user.profissional)

      } else {
        return response.badRequest({ message: 'Tipo de perfil inválido para atualização.' })
      }

    } catch (error) {
      // Se a validação falhar, o erro será capturado aqui
      return response.badRequest({ message: 'Não foi possível atualizar o perfil.', errors: error.messages })
    }
  }
}