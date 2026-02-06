import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'movimentacao_inventario'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('profissional_id')
      
      table.renameColumn('profissional_id', 'user_id')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('user_id')
      table.renameColumn('user_id', 'profissional_id')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('profissional_id')
        .unsigned()
        .references('id')
        .inTable('profissionais')
        .onDelete('RESTRICT')
        .alter()
    })
  }
}