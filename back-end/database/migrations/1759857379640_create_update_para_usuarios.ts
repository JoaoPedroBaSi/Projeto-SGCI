import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alteracoes_usuarios_clientes_profissionais'

  async up() {
    this.schema.alterTable('users', (table) => {
      table.enum('perfil_tipo', ['cliente', 'profissional', 'admin']).nullable()
      table.integer('perfil_id').unsigned().nullable()
      table.enum('status', ['ativo', 'pendente', 'inativo']).defaultTo('pendente')
      table.string('password_reset_token').nullable()
      table.timestamp('password_reset_token_expires_at').nullable()
    })

    this.schema.alterTable('clientes', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('CASCADE')
        .unique()

      // Clientes: Apagamos Email e Senha (usam a tabela users)
      table.dropColumn('email')
      table.dropColumn('senha')
    })

    this.schema.alterTable('profissionais', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('CASCADE')
        .unique()
      table.string('registro_conselho', 20).nullable()
      table.string('conselho_uf', 2).nullable()
      table.string('foto_perfil_url').nullable()
      table.text('biografia').nullable()
      table.enum('status', ['pendente', 'aprovado', 'rejeitado']).defaultTo('pendente')
      table.string('comprovante_credenciamento_url').nullable()
      table.text('observacoes_admin').nullable()

      // Profissionais: 
      // 1. Mantemos o EMAIL (Comentado = não apaga)
      // table.dropColumn('email')

      // 2. Apagamos a SENHA (Descomentado = apaga)
      table.dropColumn('senha')
    })
  }

  async down() {
    this.schema.alterTable('profissionais', (table) => {
      table.dropColumn('user_id')
      table.dropColumn('registro_conselho')
      table.dropColumn('conselho_uf')
      table.dropColumn('foto_perfil_url')
      table.dropColumn('biografia')
      table.dropColumn('status')
      table.dropColumn('comprovante_credenciamento_url')
      table.dropColumn('observacoes_admin')
      
      // Recriamos a senha no rollback
      table.string('senha').notNullable().defaultTo('temp123')
      // O email não foi apagado, então não recriamos
    })

    this.schema.alterTable('clientes', (table) => {
      table.dropColumn('user_id')
      table.string('email').notNullable().defaultTo('temp@client.com')
      table.string('senha').notNullable().defaultTo('temp123')
    })

    this.schema.alterTable('users', (table) => {
      table.dropColumn('perfil_tipo')
      table.dropColumn('perfil_id')
      table.dropColumn('status')
      table.dropColumn('password_reset_token')
      table.dropColumn('password_reset_token_expires_at')
    })
  }
}