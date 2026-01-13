import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export default class UsersController {

  // GET /me
  public async show({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      
      // Normaliza o tipo para evitar erros de maiúscula/minúscula
      const tipo = (user.perfil_tipo || '').toLowerCase().trim()
      
      let perfilData = null

      if (tipo === 'cliente') {
        await user.load('cliente')
        perfilData = user.cliente
      } 
      else if (tipo === 'profissional') {
        await user.load('profissional')
        perfilData = user.profissional
      }

      const userJSON = user.serialize()
      
      return response.ok({
        ...userJSON,
        perfil: perfilData // Envia o perfil carregado separadamente
      })

    } catch (error) {
      console.error(error)
      return response.badRequest({ message: 'Usuário não encontrado.' })
    }
  }

  // PUT /me
  public async update({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const trx = await db.transaction()

    try {
        // 1. Atualiza dados do USUÁRIO (Tabela users)
        const nomeFront = request.input('nome')
        if (nomeFront) user.fullName = nomeFront

        // AQUI ESTAVA O ERRO: Telefone não é do user, então não damos merge direto no user
        // user.merge(request.only(['telefone'])) <--- REMOVIDO

        user.useTransaction(trx)
        await user.save()

        const tipo = (user.perfil_tipo || '').toLowerCase().trim()

        // 2. Atualiza dados do PERFIL ESPECÍFICO
        if (tipo === 'profissional') {
            const dadosProf = request.only([
                'registro_conselho', 
                'conselho_uf', 
                'biografia', 
                'genero', 
                'data_nascimento',
                'telefone' // Telefone entra aqui
            ])
            
            const profissional = await user.related('profissional').query().useTransaction(trx).first()
            if (profissional) {
                profissional.merge(dadosProf)
                await profissional.save()
            }
        } 
        else if (tipo === 'cliente') {
            const dadosCliente = request.only([
                'genero', 
                'data_nascimento', 
                'cpf',
                'telefone' // Telefone entra aqui
            ])
            const cliente = await user.related('cliente').query().useTransaction(trx).first()
            if (cliente) {
                cliente.merge(dadosCliente)
                await cliente.save()
            }
        }

        await trx.commit()
        
        // Recarrega dados atualizados
        if (tipo === 'profissional') await user.load('profissional')
        if (tipo === 'cliente') await user.load('cliente')

        return response.ok({ message: 'Dados atualizados com sucesso!', user })

    } catch (error) {
        await trx.rollback()
        console.error("Erro ao atualizar perfil:", error)
        return response.badRequest({ message: 'Erro ao atualizar dados.', error })
    }
  }
}