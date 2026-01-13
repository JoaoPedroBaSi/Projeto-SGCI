import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alteracoes_usuarios_clientes_profissionais'

  async up() {
    // Mantemos apenas as melhorias na tabela USERS
    this.schema.alterTable('users', (table) => {
      table.enum('perfil_tipo', ['cliente', 'profissional', 'admin']).nullable()
      table.integer('perfil_id').unsigned().nullable()
      table.enum('status', ['ativo', 'pendente', 'inativo']).defaultTo('pendente')
      table.string('password_reset_token').nullable()
      table.timestamp('password_reset_token_expires_at').nullable()
    })

    // REMOVI AS ALTERAÇÕES EM CLIENTES E PROFISSIONAIS
    // Pois a migration inicial (create_tabelas_iniciais) já está criando
    // essas tabelas da forma correta (com email, senha e IDs certos).
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('perfil_tipo')
      table.dropColumn('perfil_id')
      table.dropColumn('status')
      table.dropColumn('password_reset_token')
      table.dropColumn('password_reset_token_expires_at')
    })
  }
}