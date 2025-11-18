import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class VerificarReservasExpiradas extends BaseCommand {
  static commandName = 'verificar:reservas-expiradas'
  static description = 'Libera salas de reservas expiradas'

  // A CORREÇÃO ESTÁ AQUI:
  // Dizemos ao Adonis para iniciar a App (e o Banco de Dados) antes de rodar.
  static options: CommandOptions = {
    startApp: true
  }

  async run() {
    this.logger.info('Iniciando verificação (Modo Query Builder)...')

    try {
      // Agora o 'db' vai funcionar porque a App iniciou!
      const reservasExpiradas = await db
        .from('reservas')
        .where('status', 'APROVADA')
        .where('data_hora_fim', '<=', DateTime.now().toSQL())
        .select('id', 'sala_id')

      this.logger.info(`Encontradas ${reservasExpiradas.length} reservas expiradas.`)

      for (const reserva of reservasExpiradas) {
        await db
          .from('salas')
          .where('id', reserva.sala_id)
          .update({ status: 'DISPONIVEL' })
          
        this.logger.info(`Sala ${reserva.sala_id} liberada (Reserva ${reserva.id})`)
      }

      this.logger.info('Processo finalizado.')

    } catch (error) {
      this.logger.error(`Erro: ${error.message}`)
      console.error(error)
    }
  }
}