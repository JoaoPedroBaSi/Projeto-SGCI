import Reserva from "#models/reserva"
import { DateTime } from 'luxon'

export default class AtualizarStatusSala {
  
  public async handle({ reserva }: { reserva: Reserva }) {
    if (reserva.status === 'APROVADA') {
      await reserva.load('sala')

      if (reserva.sala) {

        const agora = DateTime.now()
        const inicio = DateTime.fromJSDate(reserva.dataHoraInicio as unknown as Date)
        const fim = DateTime.fromJSDate(reserva.dataHoraFim as unknown as Date)

        if (agora >= inicio && agora <= fim) {
            reserva.sala.status = 'OCUPADO'
            await reserva.sala.save()
            console.log(`Sala ${reserva.sala.nome} marcada como OCUPADA.`)
        } else {
            console.log(`Reserva aprovada para data futura. Status da sala mantido como DISPONIVEL.`)
        }
      }
    }
  }
}