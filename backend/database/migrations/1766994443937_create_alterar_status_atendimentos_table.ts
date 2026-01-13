import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AlterarStatusAtendimentos extends BaseSchema {
  protected tableName = 'atendimentos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('status', ['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'])
        .notNullable()
        .defaultTo('PENDENTE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('status', ['CONFIRMADO', 'CANCELADO', 'CONCLUIDO'])
        .notNullable()
        .defaultTo('CONFIRMADO')
    })
  }
}
