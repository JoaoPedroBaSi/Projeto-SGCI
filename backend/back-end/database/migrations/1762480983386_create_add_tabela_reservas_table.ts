import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reservas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('sala_id').unsigned().references('id').inTable('salas').onDelete('CASCADE')
      table
        .integer('profissional_id')
        .unsigned()
        .references('id')
        .inTable('profissionais')
        .onDelete('SET NULL')

      table.dateTime('data_hora_inicio', { useTz: true }).notNullable()
      table.dateTime('data_hora_fim', { useTz: true }).notNullable()

      table
        .enum('status', ['PENDENTE', 'APROVADA', 'REJEITADA'])
        .notNullable()
        .defaultTo('PENDENTE') // (pendente, aprovada, rejeitada)
      table.boolean('pagamento_efetuado').defaultTo(false)

      table.enum('forma_pagamento', ['PIX', 'CREDITO', 'DEBITO', 'PENDENTE']).defaultTo('PENDENTE').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
