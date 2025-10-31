import type { HttpContext } from '@adonisjs/core/http'
import Atendimento from '#models/atendimento'
import Prontuario from '#models/prontuario'
import Profissional from '#models/profissional'
import ForceJsonResponseMiddleware from '#middleware/force_json_response_middleware'

export default class ProntuariosController {
    public async store({ request, response, auth, params}: HttpContext) {
        const atendimentoId = params.id

        const dadosProntuario = await request.only(['diagnostico', 'medicamentosPrescritos', 'recomendacoes', 'caminhoAnexo', 'descricao'])

        const profissionalLogadoId = await auth.user?.id
        if (!profissionalLogadoId) {
            return response.unauthorized({
                message: "Acesso não autorizado. Faça login novamente"
            })
        }

        const perfilProfissional = await Profissional.findBy('userId', profissionalLogadoId)

        if (!perfilProfissional) {
            return response.forbidden({
                message: 'Este usuário não possui um perfil de profissional.'
            })
        }
            
        console.log('ID do Profissional Logado:', profissionalLogadoId)
        try {
            const atendimento = await Atendimento.findByOrFail('id', atendimentoId)
            // O erro "forbidden" no AdonisJS geralmente indica que o usuário não tem permissão para acessar um determinado recurso
            if (atendimento.profissionalId !== perfilProfissional.id) {
                return response.forbidden({
                    message: "Acesso impedido"
                })
            }

            const dadosParaSalvar = {
                ...dadosProntuario,
                atendimentoId: atendimentoId,
                profissionalId: perfilProfissional.id,
            }
            
            const prontuario = await Prontuario.create(dadosParaSalvar)

            return response.created(prontuario)

        } catch {
            return response.notFound({
                message: "Atendimento não encontrado."
            })
        }
    }
}