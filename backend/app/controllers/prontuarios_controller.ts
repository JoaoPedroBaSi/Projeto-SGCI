import type { HttpContext } from '@adonisjs/core/http'
import Atendimento from '#models/atendimento'
import Prontuario from '#models/prontuario'
import Profissional from '#models/profissional'
// import ForceJsonResponseMiddleware from '#middleware/force_json_response_middleware'
import Parceria from '#models/parceria'

export default class ProntuariosController {

    public async index({ auth, response }: HttpContext) {
        const usuarioLogado = auth.user

        // CORREÇÃO: Buscamos pelo 'id' direto, pois o ID do médico é igual ao do usuário
        const profissional = await Profissional.findBy('id', usuarioLogado?.id)

        if (!profissional) {
            return response.notFound({ message: 'Perfil profissional não encontrado.' })
        }

        // 2. Busca no banco
        const atendimentos = await Atendimento.query()
            .where('profissionalId', profissional.id)
            .preload('cliente')
            .orderBy('data_hora_inicio', 'desc')

        // 3. Formata os dados
        const listaFormatada = atendimentos.map((atendimento) => {
            const clienteData = atendimento.cliente as any
            return {
                id: atendimento.id,
                nome: clienteData?.nome || 'Cliente Desconhecido',
                cpf: atendimento.cliente?.cpf || '---',
                data: atendimento.dataHoraInicio, // Lembra que corrigimos isso para camelCase?
                status: atendimento.status
            }
        })

        return response.ok(listaFormatada)
    }
    public async store({ request, response, auth, params }: HttpContext) {
        const atendimentoId = params.id

        const dadosProntuario = await request.only(['diagnostico', 'medicamentosPrescritos', 'recomendacoes', 'caminhoAnexo', 'descricao', 'parceriaId'])

        const profissionalLogadoId = await auth.user?.id
        if (!profissionalLogadoId) {
            return response.unauthorized({
                message: "Acesso não autorizado. Faça login novamente"
            })
        }

        try {
            //Se o profissional tiver informado uma parceria, verifica se a parceria informada é válida
            if (dadosProntuario.parceriaId) {
                const parceria = await Parceria.query().where('id', dadosProntuario.parceriaId).first()

                const statusParceriaInvalido = parceria?.statusParceria === 'INATIVO' || parceria?.statusParceria === 'EM NEGOCIACAO'
                const relacionamentoParceriaInvalido = parceria?.tipoRelacionamento === 'SAIDA' || parceria?.tipoRelacionamento === 'ESTRATEGICO'

                const parceriaInvalida = statusParceriaInvalido || relacionamentoParceriaInvalido
                if (parceriaInvalida) {
                    throw new Error()
                }
            }
        } catch (error) {
            return response.status(500).send('Por favor, informe uma parceria válida. Tente novamente.')
        }

        const perfilProfissional = await Profissional.findBy('id', profissionalLogadoId)

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