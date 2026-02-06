import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name').notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()

      table.enum('perfil_tipo', ['cliente', 'profissional', 'admin'])
        .defaultTo('cliente')
        .notNullable()

      table.enum('status', ['ativo', 'pendente', 'inativo'])
        .defaultTo('pendente')
        .notNullable()

      table.string('password_reset_token').nullable()
      table.timestamp('password_reset_token_expires_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}