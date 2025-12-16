import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transacoes'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      // Transação ligada a uma Reserva
      // Se a reserva for excluída, a transação perde o link, mas permanece.
      table
        .integer('reserva_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('reservas')
        .onDelete('SET NULL')

        table.index(['atendimento_id', 'reserva_id'])
    })

  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropForeign(['reserva_id'])
      table.dropIndex(['atendimento_id', 'reserva_id'])
      table.dropColumn('reserva_id')
    })
  }
}
