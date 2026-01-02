import { BaseSchema } from '@adonisjs/lucid/schema'

// Adiciona a coluna valor_total para a tabela reservas
export default class extends BaseSchema {
  protected tableName = 'reservas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('valor_total', 10, 2).notNullable().defaultTo(0.0)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('valor_total')
    })
  }
}
