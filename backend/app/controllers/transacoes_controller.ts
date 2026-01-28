/* eslint-disable prettier/prettier */
import Transacao from '#models/transacao'
import type { HttpContext } from '@adonisjs/core/http'
import { storeTransacaoValidator } from '#validators/validator_transacao'

// IMPORTAÇÃO CORRETA DO ARQUIVO DOS SEUS COLEGAS
import { PagamentoService } from '#services/pagamento_service'

export default class TransacoesController {

    // --- MÉTODOS EXISTENTES (MANTIDOS) ---
    public async index ({ } : HttpContext) {
        return await Transacao.all()
    }

    public async show ({ params } : HttpContext) {
      return await Transacao.query().where('id', params.id)
    }

    public async store ({ auth, request, response } : HttpContext) {
      try{
        const usuarioLogado = auth.user!;
        const dados = await request.validateUsing(storeTransacaoValidator)
        const adminLogado = usuarioLogado.perfil_tipo === 'admin'
        if (!adminLogado) throw new Error()
        await Transacao.create(dados)
        return response.status(200).send('Transação registrada com sucesso!')
        } catch (error) {
          return response.status(500).send('Erro ao registrar transação.')
        }
    }

    // --- SEU NOVO MÉTODO (INTEGRAÇÃO) ---
    public async realizarPagamento({ auth, request, response }: HttpContext) {
        // 1. Pega o usuário logado (que é o Cliente pagador)
        const cliente = auth.user!

        // 2. Recebe os dados do formulário
        const dados = request.only(['profissionalId', 'valor', 'formaPagamento'])

        // Validação básica
        if (!dados.profissionalId || !dados.valor || !dados.formaPagamento) {
            return response.badRequest({ message: 'Dados incompletos para pagamento.' })
        }

        // 3. Instancia o serviço que seus colegas criaram
        const service = new PagamentoService()

        try {
            // 4. Chama o método que JÁ EXISTE para processar e salvar
            const transacao = await service.iniciarCobranca(
                dados.profissionalId,
                cliente.id,    // O ID do cliente vem do token de quem está logado
                dados.valor,
                dados.formaPagamento
            )

            return response.ok({
                message: 'Processamento de pagamento iniciado!',
                transacao: transacao
            })

        } catch (error) {
            console.error(error)
            return response.badRequest({ message: 'Erro ao processar pagamento.' })
        }
    }

public async contarSaldo({ auth }: HttpContext) {
  const user = await auth.authenticate()

  let saldoTotal = 0

  if (user.perfil_tipo === 'cliente') {
    // Para o CLIENTE: Soma o que ele PAGOU (onde ele é a entidadeOrigem ou entidadeId)
    const resultado = await Transacao.query()
      .where('entidade_id', user.id)
      .where('status', 'CONCLUIDA')
      .sum('valor as total')
      .first()

    saldoTotal = resultado?.$extras.total || 0
  } else {
    // Para o PROFISSIONAL: Soma o que ele RECEBEU
    const resultado = await Transacao.query()
      .where('destinatario_id', user.id)
      .where('status', 'CONCLUIDA')
      .sum('valor as total')
      .first()

    saldoTotal = resultado?.$extras.total || 0
  }

  return { saldoTotal: Number(saldoTotal) }
}
}
