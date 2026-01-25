import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'movimentacao_inventario'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('profissional_id')

      table
        .integer('profissional_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .alter()
    })
  }
}
