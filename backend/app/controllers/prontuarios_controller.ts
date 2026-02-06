import type { HttpContext } from '@adonisjs/core/http'
import Atendimento from '#models/atendimento'
import Prontuario from '#models/prontuario'
import Profissional from '#models/profissional'
import Parceria from '#models/parceria'
import User from '#models/user' // Adicionado import

export default class ProntuariosController {

  public async index({ auth, response }: HttpContext) {
    /**
     * CORREÇÃO: Cast para User para acessar a propriedade 'id'.
     */
    const usuarioLogado = auth.user as unknown as User

    const profissional = await Profissional.findBy('id', usuarioLogado.id)

    if (!profissional) {
      return response.notFound({ message: 'Perfil profissional não encontrado.' })
    }

    const atendimentos = await Atendimento.query()
      .where('profissionalId', profissional.id)
      .preload('cliente')
      .orderBy('data_hora_inicio', 'desc')

    const listaFormatada = atendimentos.map((atendimento) => {
      return {
        id: atendimento.id,
        nome: atendimento.cliente?.nome || 'Cliente Desconhecido',
        cpf: atendimento.cliente?.cpf || '---',
        data: atendimento.dataHoraInicio, 
        status: atendimento.status
      }
    })

    return response.ok(listaFormatada)
  }

  public async store({ request, response, auth, params }: HttpContext) {
    const atendimentoId = params.id
    const dadosProntuario = request.only([
      'diagnostico', 
      'medicamentosPrescritos', 
      'recomendacoes', 
      'caminhoAnexo', 
      'descricao', 
      'parceriaId'
    ])

    /**
     * CORREÇÃO: Cast no auth.user para acessar o 'id'.
     */
    const profissionalLogadoId = (auth.user as unknown as User)?.id
    if (!profissionalLogadoId) {
      return response.unauthorized({ message: "Acesso não autorizado." })
    }

    try {
      if (dadosProntuario.parceriaId) {
        const parceria = await Parceria.find(dadosProntuario.parceriaId)
        
        if (!parceria) {
             return response.badRequest({ message: 'Parceria informada não existe.' })
        }

        const statusInvalido = ['INATIVO', 'EM NEGOCIACAO'].includes(parceria.statusParceria)
        const tipoInvalido = ['SAIDA', 'ESTRATEGICO'].includes(parceria.tipoRelacionamento)

        if (statusInvalido || tipoInvalido) {
          return response.badRequest({ message: 'A parceria selecionada não é válida para este prontuário.' })
        }
      }

      const perfilProfissional = await Profissional.findBy('id', profissionalLogadoId)
      if (!perfilProfissional) {
        return response.forbidden({ message: 'Este usuário não possui um perfil de profissional.' })
      }

      const atendimento = await Atendimento.findOrFail(atendimentoId)
      
      if (atendimento.profissionalId !== perfilProfissional.id) {
        return response.forbidden({ message: "Você não tem permissão para criar prontuário deste atendimento." })
      }

      const dadosParaSalvar = {
        ...dadosProntuario,
        atendimentoId: atendimentoId,
        profissionalId: perfilProfissional.id,
      }

      const prontuario = await Prontuario.create(dadosParaSalvar)

      return response.created(prontuario)

    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
         return response.notFound({ message: "Atendimento não encontrado." })
      }
      return response.badRequest({ 
        message: "Erro ao criar prontuário.", 
        error: error.message || error 
      })
    }
  }
}