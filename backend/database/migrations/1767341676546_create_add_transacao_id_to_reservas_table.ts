import { BaseSchema } from '@adonisjs/lucid/schema'

// Adiciona a FK transacao_id para a tabela reservas
export default class extends BaseSchema {
  protected tableName = 'reservas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('transacao_id')
        .unsigned()
        .references('id')
        .inTable('transacoes')
        .onDelete('SET NULL')
    })
  }
}
