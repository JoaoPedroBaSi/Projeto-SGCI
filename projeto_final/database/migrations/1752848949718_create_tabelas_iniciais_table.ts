import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tabelas_iniciais'

  async up() {
    this.schema.createTable('especializacoes', (table) => {
      table.increments('id')
      table.string('nome', 40).notNullable()
      table.float('valor').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('funcoes', (table) => {
      table.increments('id')
      table.string('nome', 40).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('profissionais', (table) => {
      table.increments('id')
      table.integer('especializacao_id').notNullable().references('especializacoes.id')
      table.integer('funcao_id').notNullable().references('funcoes.id')
      table.string('nome', 40).notNullable
      table.enum('genero', ['MASCULINO', 'FEMININO']).notNullable
      table.integer('idade').notNullable
      table.string('cpf').notNullable
      table.string('email').notNullable
      table.string('senha').notNullable
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('salas', (table) => {
      table.increments('id')
      table.integer('profissional_id').notNullable().references('profissionais.id')
      table.string('nome', 40).notNullable()
      table.float('preco_aluguel').notNullable()
      table.date('data_disponibilidade').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('clientes', (table) => {
      table.increments('id')
      table.string('nome', 40).notNullable()
      table.enum('genero', ['MASCULINO', 'FEMININO']).notNullable
      table.integer('idade').notNullable
      table.string('cpf').notNullable
      // table.string('rg').notNullable
      table.string('email').notNullable
      table.string('senha').notNullable
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('atendimentos', (table) => {
      table.increments('id')
      table.string('nome', 40).notNullable()
      table.integer('profissional_id').notNullable().references('profissionais.id')
      table.integer('cliente_id').notNullable().references('cliente.id')
      table.time('horario_comeco').notNullable
      table.time('horario_termino').notNullable
      table.date('data').notNullable
      table.boolean('validado').notNullable
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
