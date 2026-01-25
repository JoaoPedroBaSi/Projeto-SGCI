import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reservas'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('valor_total', 10, 2).nullable()

      table
        .integer('transacao_id')
        .unsigned()
        .references('id')
        .inTable('transacoes')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('valor_total')
      table.dropColumn('transacao_id')
    })
  }
}
