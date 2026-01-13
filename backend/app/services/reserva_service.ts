import Sala from '#models/sala'
import Reserva from '#models/reserva'
import Transacao from '#models/transacao'
import { DateTime } from 'luxon'

interface HorarioDTO {
  inicio: string
  fim: string
}

interface CriarReservaLoteDTO {
  salaId: number
  profissionalId: number
  userId: number
  horarios: HorarioDTO[]
}

export default class ReservaService {
  public async criarEmLote({ salaId, profissionalId, userId, horarios }: CriarReservaLoteDTO) {
    // Busca a Sala
    const sala = await Sala.findOrFail(salaId)

    const reservasParaCriar: any[] = []
    let valorTotalGeral = 0

    // Loop de Validação e Cálculo
    for (const horario of horarios) {
      const inicio = DateTime.fromISO(horario.inicio)
      const fim = DateTime.fromISO(horario.fim)

      console.log(
        `Verificando conflito para: ${inicio.toFormat('yyyy-MM-dd HH:mm')} até ${fim.toFormat('HH:mm')}`
      )

      if (inicio >= fim) {
        throw new Error('A data de início deve ser anterior ao fim.')
      }

      // Checa conflito no banco
      const conflito = await Reserva.query()
        .where('sala_id', salaId)
        .where('status', '!=', 'REJEITADO') // Ignora rejeitadas
        .where((query) => {
          query
            .where('data_hora_inicio', '<', fim.toSQL())
            .andWhere('data_hora_fim', '>', inicio.toSQL())
        })
        .first()

      if (conflito) {
        console.error('!!! CONFLITO DETECTADO !!!')
        console.error('Tentativa:', inicio.toString(), 'até', fim.toString())
        console.error('Ocupado por Reserva ID:', conflito.id)
        console.error('Status da Reserva:', conflito.status)
        console.error('Horário Ocupado:', conflito.dataHoraInicio, 'até', conflito.dataHoraFim)

        throw {
          status: 409,
          message: `O horário das ${inicio.toFormat('HH:mm')} já está ocupado.`,
        }
      }

      // Calcula preço deste horário
      const duracao = fim.diff(inicio, 'hours').hours
      const precoSlot = Number(sala.precoAluguel) * duracao
      valorTotalGeral += precoSlot

      // Adiciona na lista temporária
      reservasParaCriar.push({
        salaId,
        profissionalId,
        dataHoraInicio: inicio,
        dataHoraFim: fim,
        status: 'PENDENTE',
        valorTotal: precoSlot,
      })
    }

    //  Cria a TRANSAÇÃO PAI
    // TROCAR IDS FIXOS DE ADMIN E EMPRESA DEPOIS, POIS SERÃO FIXOS
    const transacao = await Transacao.create({
      userId: userId,
      entidadeOrigem: 'SISTEMA',
      entidadeId: 1, // Exemplo
      destinatarioTipo: 'ADMIN',
      destinatarioId: 1, // Exemplo: ID da empresa
      valor: valorTotalGeral,
      tipo: 'ENTRADA',
      finalidade: 'RESERVA_SALA',
      status: 'PENDENTE',
    })

    // 4Cria as Reservas vinculadas à Transação
    for (const res of reservasParaCriar) {
      await Reserva.create({
        ...res,
        transacaoId: transacao.id,
      })
    }

    return transacao
  }
}
