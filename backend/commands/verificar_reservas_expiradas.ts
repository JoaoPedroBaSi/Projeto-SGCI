import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class VerificarReservasExpiradas extends BaseCommand {
  static commandName = 'verificar:reservas-expiradas'
  static description = 'Finaliza reservas expiradas e libera as salas automaticamente'

  static options: CommandOptions = {
    startApp: true
  }

  async run() {
    this.logger.info('Iniciando varredura de reservas expiradas...')

    await db.transaction(async (trx) => {
      const reservasExpiradas = await db
        .from('reservas')
        .where('status', 'APROVADA')
        .where('data_hora_fim', '<=', DateTime.now().toSQL()!) 
        .select('id', 'sala_id', 'data_hora_fim')
        .useTransaction(trx) 

      if (reservasExpiradas.length === 0) {
        this.logger.info('Nenhuma reserva expirada encontrada.')
        return
      }

      this.logger.info(`Processando ${reservasExpiradas.length} reservas...`)

      for (const reserva of reservasExpiradas) {
        await db
          .from('reservas')
          .where('id', reserva.id)
          .update({ 
            status: 'CONCLUIDA',
            updated_at: DateTime.now().toSQL()
          })
          .useTransaction(trx)

        await db
          .from('salas')
          .where('id', reserva.sala_id)
          .update({ 
            status: 'DISPONIVEL',
            updated_at: DateTime.now().toSQL()
          })
          .useTransaction(trx)

        this.logger.info(`[Reserva #${reserva.id}] Finalizada -> Sala #${reserva.sala_id} Liberada.`)
      }
    })

    this.logger.success('Varredura concluída com sucesso.')
  }
}