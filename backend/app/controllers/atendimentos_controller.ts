/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Atendimento from '#models/atendimento'
import { storeAtendimentoValidator } from '#validators/validator_atendimento'
import { updateAtendimentoValidator } from '#validators/validator_atendimento'
import { inject } from '@adonisjs/core'
import { AtendimentoService } from '#services/atendimento_service'
import { PagamentoService } from '#services/pagamento_service'
import { TransacaoService } from '#services/transacao_service'
import db from '@adonisjs/lucid/services/db'
import Disponibilidade from '#models/disponibilidade'
import Reserva from '#models/reserva'
import Transacao from '#models/transacao'

@inject()
export default class AtendimentosController {
  constructor(
    protected atendimentoService: AtendimentoService,
    protected pagamentoService: PagamentoService,
    protected transacaoService: TransacaoService
  ) {}
  //Mostra todos os atendimentos

public async index({ auth, request }: HttpContext) {
const user = await auth.authenticate()

// Pega o status da URL (ex: /atendimento?status=PENDENTE)
const statusFiltrado = request.input('status')

const query = Atendimento.query()
  .preload('cliente', (q) => q.select('id', 'nome'))
  .preload('profissional', (q) => {
    q.select('id', 'nome')
    q.preload('disponibilidades') // Mantendo sua regra de disponibilidade
  })

  // Aplicamos filtros baseados no perfil
  // Assumindo que seu Model User tem um campo 'tipo' ou 'role'
  if (user.perfil_tipo === 'cliente') {
    query.where('cliente_id', user.id)
  } else if (user.perfil_tipo === 'profissional') {
    query.where('profissional_id', user.id)
  }
  if (statusFiltrado) {
    query.where('status', statusFiltrado)
  }
  // Se for 'admin', não entra em nenhum IF e traz todos os registros (.all)
  return await query.orderBy('id', 'desc')
}

//Mostra atendimentos individualmente
//Usa o select para traz apenas os dados importantes, e oculta dados sensíveis
public async show({ params }: HttpContext) {
  return await Atendimento.query()
    .where('id', params.id)
    .preload('cliente', (query) => query.select('id', 'nome'))
    .preload('profissional', (query) => query.select('id', 'nome'))
    // removi email dos preloads porque eles só exixsrtem na tabela User
}

// Função para a tela de aprovação de agendamentos
//Busca solicitações de atendimento (status PENDENTE)
public async buscarSolicitacoes({ request, response }: HttpContext) {
  try {
    // Pega o status da URL (ex: ?status=PENDENTE)
    const { status } = request.qs()

    const query = Atendimento.query()
      // Traz apenas ID e Nome, nada de fotos ou dados pesados
      .preload('cliente', (q) => q.select('id', 'nome'))
      .preload('profissional', (q) => q.select('id', 'nome'))
      .orderBy('data_hora_inicio', 'asc')

    // Se foi passado um status, filtra. Se não, traz tudo.
    if (status) {
      query.where('status', status)
    } else {
      // Se não mandar nada, assume que quer os PENDENTES por padrão
      query.where('status', 'PENDENTE')
    }

    const resultados = await query
    return response.ok(resultados)
  } catch (error) {
    return response.internalServerError({
      message: 'Erro ao buscar lista de solicitações.',
      error
    })
  }
}

//Finalizado
public async store({ request, response }: HttpContext) {
  try {
    const dados = await request.validateUsing(storeAtendimentoValidator)

    //Converte o Date nativo do JS para o Luxon DateTime
    // 1. Converte a string do frontend (que o Luxon lerá como UTC ou local) para o fuso do Brasil
    const dataHoraInicioLuxon = DateTime.fromISO(dados.data_hora_inicio).setZone('America/Sao_Paulo')

    if (!dataHoraInicioLuxon.isValid) {
      return response.status(400).send({
        message: 'O formato da data e hora é inválido.',
        debug: dataHoraInicioLuxon.invalidReason
      })
    }

    // 2. Pega o "agora" também no fuso do Brasil
    const agoraBrasil = DateTime.now().setZone('America/Sao_Paulo')

    // 3. Verifica se expirou comparando os dois no mesmo fuso
    const horarioExpirado = dataHoraInicioLuxon < agoraBrasil

    if (horarioExpirado) {
      throw new Error('A solicitação de atendimento tem uma data inválida.')
    }

    // Chama a função "temDisponibilidade" para verificar se o profissional tem disponibilidade
    const disponibilidade = await this.atendimentoService.temDisponibilidade(
      dados.profissional_id,
      dataHoraInicioLuxon
    )
    if (!disponibilidade) {
      throw new Error('A solicitação de atendimento não está na disponibilidade do profissional.')
    }

    // Indica conflitos. Se o horário solicitado já tem outro acontecimento
    const slotOcupado = disponibilidade.status === 'OCUPADO'
    if (slotOcupado) {
      throw new Error('O horário solicitado já está marcado para outro atendimento.')
    }
    const slotBloqueado = disponibilidade.status === 'BLOQUEADO'
    if (slotBloqueado) {
      throw new Error('O profissional se encontra indisponível para este horário.')
    }

    // Procura pela sala em que o profissional atende
    const salaReservada = await Reserva.query()
      .where('profissional_id', dados.profissional_id)
      .first() //.andWhere('status', 'APROVADA').andWhere('pagamento_efetuado', true).first()
    if (!salaReservada) {
      throw new Error('O profissional escolhido para consulta não tem nenhum sala reservada.')
    }

    await this.atendimentoService.criarAtendimento(
      dados,
      dataHoraInicioLuxon,
      disponibilidade
    )

    return response.status(201).send('Agendamento realizado com sucesso.')
  } catch (error: any) {
  // Log fundamental para você debugar no terminal do VS Code
  console.error("DEBUG ATENDIMENTO:", error.message || error)

  // 1. Trata erros de validação do VineJS (Status 422)
  if (error.status === 422) {
    return response.status(422).send({
      message: 'Dados inválidos',
      errors: error.messages
    })
  }

  // 2. Mapeamento de mensagens amigáveis
  const mensagens: Record<string, string> = {
    'A solicitação de atendimento tem uma data inválida.': 'Tente informar uma data válida.',
    'A solicitação de atendimento não está na disponibilidade do profissional.': 'Verifique os horários disponíveis do profissional.',
    'O horário solicitado já está marcado para outro atendimento.': 'Este horário já está ocupado.',
    'O profissional se encontra indisponível para este horário.': 'O profissional está indisponível neste momento.',
    'O profissional escolhido para consulta não tem nenhum sala reservada.': 'O profissional não possui sala vinculada.'
  }

  // Se a mensagem do erro estiver no nosso mapa, retornamos 400
  if (mensagens[error.message]) {
    return response.status(400).send({ message: mensagens[error.message] })
  }

  // 3. Erro de Banco de Dados ou Erro inesperado
  return response.status(error.status || 500).send({
    message: error.message || 'Ocorreu um erro interno no servidor.'
  })
}
}

public async update({ request, response, params, auth }: HttpContext) {
  try {
    const atendimento = await Atendimento.findOrFail(params.id)
    const dados = await request.validateUsing(updateAtendimentoValidator)
    const usuarioLogado = auth.user!

    if (atendimento.status === 'CANCELADO' || atendimento.status === 'CONCLUIDO') {
      throw new Error('Não é possível atualizar um atendimento que está cancelado ou concluido.')
    }

    const horarioAtendimento = atendimento.dataHoraInicio
    const horarioExpirado = horarioAtendimento < DateTime.now()
    if (horarioExpirado)
      throw new Error('A solicitação de atendimento tem uma data inválida.')

    const limiteMinimo = DateTime.now().plus({ hours: 24 })
    if (horarioAtendimento < limiteMinimo)
      throw new Error('A modificação do atendimento tem que ser feita com ao menos 24 horas de antecedência.')

    this.atendimentoService.atualizarAtendimento(dados, atendimento, usuarioLogado)

    return response.status(200).send('Agendamento atualizado com sucesso.')
  } catch (error) {
    let message = 'Ocorreu um erro desconhecido.'
    let status = 500

    if (error.messages && error.messages.errors) {
      message = error.messages.errors[0].message
      status = 400
    } else if (error instanceof Error) {
      message = error.message
      status = 400
    }
    return response.status(status).send({ message: message })
  }
}

//Cancelar Atendimento
public async cancelar({ params, response, auth, request }: HttpContext) {
  // 1. Verificação de autenticação logo no início
  const usuarioLogado = auth.user
  if (!usuarioLogado) {
    return response.unauthorized({ message: 'Usuário não autenticado' })
  }

  let justificativa = ''
  let statusDisponibilidade: 'LIVRE' | 'OCUPADO' | 'BLOQUEADO' | 'FINALIZADO' | 'RESERVADO' = 'LIVRE'

  const profissionalLogado = usuarioLogado.perfil_tipo === 'profissional'
  const clienteLogado = usuarioLogado.perfil_tipo === 'cliente'

  try {
    const atendimento = await Atendimento.findOrFail(params.id)

    if (atendimento.status !== 'CONFIRMADO') {
      return response.badRequest({ message: 'Não é possível cancelar um atendimento finalizado ou já cancelado.' })
    }

    // Regra de 24h para clientes
    if(clienteLogado){
      const limiteMinimo = DateTime.now().plus({ hours: 24 })
      if (atendimento.dataHoraInicio <= limiteMinimo) {
        return response.badRequest({ message: 'O cancelamento precisa ser feito com ao menos 24 horas de antecedência.' })
      }
    }

    // CORREÇÃO 1: Removido o await do request.input
    if(profissionalLogado){
      justificativa = request.input('justificativa_falta') || ''
      statusDisponibilidade = 'BLOQUEADO'
    }

    const slotDisponibilidade = await Disponibilidade.find(atendimento.disponibilidadeId)

    if (!slotDisponibilidade) {
      return response.notFound({ message: 'Slot de disponibilidade não encontrado' })
    }

    if(atendimento.formaPagamento !== 'DINHEIRO'){
      try {
        await this.pagamentoService.estornarCobranca(atendimento.id)
      } catch (e) {
        throw new Error('Falha na operação de estorno.')
      }
    }

    await db.transaction(async (trx) => {
      atendimento.useTransaction(trx)
      slotDisponibilidade.useTransaction(trx)

      slotDisponibilidade.status = statusDisponibilidade
      await slotDisponibilidade.save()

      atendimento.status = 'CANCELADO'
      atendimento.justificativaFalta = justificativa
      await atendimento.save()

      if(atendimento.formaPagamento !== 'DINHEIRO'){
        await Transacao.query({ client: trx })
          .where('atendimento_id', atendimento.id)
          .update({ status: 'ESTORNADO' })
      }
    })

    return response.ok({ message: 'Cancelamento realizado com sucesso.' })

  } catch (error) {
    // IMPORTANTE: Isso vai mostrar o erro real no seu terminal do VS Code/CMD
    console.error("ERRO NO CONTROLLER:", error)

    return response.status(500).send({
      message: 'Erro interno ao processar cancelamento.',
      debug: error.message // Remova isso em produção
    })
  }
}

public async aprovar({ params, request, response, auth }: HttpContext) {
  const profissionalLogado = auth.user! // Pega o profissional pelo Token

  try {
    const atendimento = await Atendimento.findOrFail(params.id)

    if (atendimento.profissionalId !== profissionalLogado.id) {
      return response.forbidden({ message: 'Você não tem permissão para aprovar este atendimento.' })
    }

    if (atendimento.status !== 'PENDENTE') {
      return response.badRequest({ message: 'Somente atendimentos pendentes podem ser aprovados.' })
    }

    const salaEscolhida = Number(request.input('sala_id'))

    if (!salaEscolhida) {
      return response.badRequest({ message: 'A sala é obrigatória.' })
    }

    const temReserva = await Reserva.query()
      .where('profissional_id', Number(profissionalLogado.id))
      .where('sala_id', Number(salaEscolhida))
      .first()

    if (!temReserva) {
      return response.forbidden({
        message: 'Você não possui uma reserva ativa para esta sala. Selecione uma sala vinculada ao seu perfil.'
      })
    }

    const valorSolicitado = Number(request.input('valor'))

    await db.transaction(async (trx) => {
      // Ocupa a disponibilidade vinculada
      await Disponibilidade.query({ client: trx })
        .where('id', atendimento.disponibilidadeId)
        .where('profissional_id', profissionalLogado.id) // Garante a posse do slot
        .update({ status: 'OCUPADO' })

      // Se NÃO for dinheiro, inicia a cobrança digital
      if (atendimento.formaPagamento !== 'DINHEIRO') {
        try {
          const resultadoCobrancao = await this.pagamentoService.iniciarCobranca(
            atendimento.profissionalId,
            atendimento.clienteId,
            valorSolicitado,
            atendimento.formaPagamento,
            atendimento.id
          )

          atendimento.status = 'CONFIRMADO'
          atendimento.statusPagamento = resultadoCobrancao.gateway.status === 'RECEIVED' ? 'PAGO' : 'PENDENTE'
        } catch (error) {
          // Se falhar o gateway, lançamos erro para o trx.rollback()
          throw new Error('FALHA_GATEWAY')
        }
      } else {
        // Se for dinheiro, já confirma direto
        atendimento.status = 'CONFIRMADO'
      }

      atendimento.salaId = salaEscolhida
      atendimento.valor = valorSolicitado
      atendimento.useTransaction(trx)
      await atendimento.save()
    })

    return response.ok({ message: 'Atendimento aprovado e agenda atualizada.' })

  } catch (error) {
    if (error.message === 'FALHA_GATEWAY') {
      return response.badRequest({ message: 'Erro ao processar gateway de pagamento.' })
    }
    return response.notFound({ message: 'Atendimento não encontrado ou erro interno.' })
  }
}

public async recusar({ params, response }: HttpContext) {
  try {
    const atendimento = await Atendimento.findOrFail(params.id)

    if (atendimento.status !== 'PENDENTE') {
      return response.badRequest({
        message: 'Somente atendimentos pendentes podem ser recusados.',
      })
    }

    // Atualiza a a solicitação para CANCELADO
    atendimento.status = 'CANCELADO'
    await atendimento.save()

    const disponibilidade = await Disponibilidade.findOrFail(atendimento.disponibilidadeId)
    disponibilidade.status = 'LIVRE'
    await disponibilidade.save()

    return response.ok({
      message: 'Atendimento recusado com sucesso.',
    })
  } catch {
    return response.notFound({
      message: 'Atendimento não encontrado.',
    })
  }
}
public async concluir({ auth, params, response }: HttpContext) {
  const profissionalLogado = auth.user!

  try {
    const mensagem = await db.transaction(async (trx) => {
      // Busca o atendimento garantindo que pertence ao profissional logado
      const atendimento = await Atendimento.query({ client: trx })
        .where('id', params.id)
        .where('profissional_id', profissionalLogado.id)
        .firstOrFail()

      if (atendimento.status === 'CONCLUIDO') {
        throw new Error('Este atendimento já foi concluído.')
      }

      // Fluxo para DINHEIRO: Cria transação manual e marca como pago
      if (atendimento.formaPagamento === 'DINHEIRO') {
        await Transacao.create({
          userId: atendimento.clienteId,
          atendimentoId: atendimento.id,
          entidadeOrigem: 'clientes',
          entidadeId: atendimento.clienteId,
          destinatarioTipo: 'profissionais',
          destinatarioId: atendimento.profissionalId,
          valor: atendimento.valor,
          tipo: 'ENTRADA',
          finalidade: `Pagamento em dinheiro (Presencial)`,
          status: 'CONCLUIDA',
          referenciaExterna: 'Lançamento Manual Profissional'
        }, { client: trx })

        atendimento.statusPagamento = 'PAGO'
      }

      // Se for Cartão/Pix, o statusPagamento já deve estar como 'PAGO' via webhook/service
      // Se não estiver pago e não for dinheiro, talvez você queira impedir a conclusão:
      if (atendimento.formaPagamento !== 'DINHEIRO' && atendimento.statusPagamento !== 'PAGO') {
        throw new Error('O pagamento deste atendimento ainda não foi confirmado.')
      }

      atendimento.status = 'CONCLUIDO'
      await atendimento.useTransaction(trx).save()

      // Libera a disponibilidade com status FINALIZADO
      await Disponibilidade.query({ client: trx })
        .where('id', atendimento.disponibilidadeId)
        .update({ status: 'FINALIZADO' })

      return 'Atendimento finalizado com sucesso!'
    })

    return response.ok({ message: mensagem })
  } catch (error) {
    return response.badRequest({
      message: error.message || 'Erro ao concluir atendimento.'
    })
  }
}
}
