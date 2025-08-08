import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tabelas_iniciais'

  async up() {
    this.schema.createTable('clientes', (table) => {
      table.increments('id')
      table.string('nome', 40).notNullable()
      table.enum('genero', ['MASCULINO', 'FEMININO']).notNullable()
      table.integer('idade').notNullable()
      table.string('cpf').notNullable().unique()
      // table.string('rg').notNullable
      table.string('email').notNullable().unique()
      table.string('senha').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('funcoes', (table) => {
      table.increments('id')
      table.string('nome', 40).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('especializacoes', (table) => {
      table.increments('id')
      table.string('nome', 40).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('profissionais', (table) => {
      table.increments('id')
      //table.integer('especializacao_id').notNullable().references('especializacoes.id')
      table.integer('funcao_id').unsigned().notNullable().references('funcoes.id')
      table.string('nome', 40).notNullable()
      table.enum('genero', ['MASCULINO', 'FEMININO']).notNullable()
      table.integer('idade').notNullable()
      table.string('cpf').notNullable().unique()
      table.string('email').notNullable().unique()
      table.string('senha').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('especializacoes_profissionais', (table) => {
      table.increments('id')
      table
        .integer('especializacao_id')
        .unsigned()
        .notNullable()
        .references('especializacoes.id')
        .onDelete('CASCADE')
      table
        .integer('profissional_id')
        .unsigned()
        .notNullable()
        .references('profissionais.id')
        .onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('disponibilidades', (table) => {
      table.increments('id')
      //Define que a relação profissional_id com o dia são únicas.
      //Portanto, profissional_id 2 e dia 2 só poderá existir uma vez ->
      //O profissional 2 só pode ter um horário de disponibilidade na terça.
      table.unique(['profissional_id', 'dia'])
      table
        .integer('profissional_id')
        .unsigned()
        .notNullable()
        .references('profissionais.id')
        .onDelete('CASCADE')
      //"Dia x, o profissional atende do horario_comeco ao horario_fim".
      table.integer('dia').notNullable()
      //Checa de o horário começo é menor que o horario fim. Isso tem que acontecer.
      table.check('horario_comeco < horario_termino')
      table.time('horario_comeco').notNullable()
      table.time('horario_termino').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('salas', (table) => {
      table.increments('id')
      //Não tem o notnullable pois a sala pode ter nenhum profissional ligado a ela.
      table.integer('profissional_id').unsigned().references('profissionais.id')
      table.string('nome', 20).notNullable()
      table.decimal('preco_aluguel', 10, 2).notNullable()
      table.date('data_disponibilidade').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('atendimentos', (table) => {
      table.increments('id')
      table
        .integer('profissional_id')
        .unsigned()
        .notNullable()
        .references('profissionais.id')
        .onDelete('CASCADE')
      table
        .integer('cliente_id')
        .unsigned()
        .notNullable()
        .references('clientes.id')
        .onDelete('CASCADE')
      table.time('horario_comeco').notNullable()
      table.time('horario_termino').notNullable()
      table.check('horario_comeco < horario_termino')
      //Adicionei o atributo dia para servir de comparação
      table.integer('dia').notNullable()
      table.date('data').notNullable()
      table.decimal('valor', 10, 2).notNullable()
      table.enum('forma_pagamento', ['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO'])
      //Tirei o validado pois todas os atendimentos que forem criados,
      //já passaram por etapas de validação
      //table.boolean('validado').notNullable()
      table.boolean('feito').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    //this.schema.dropTable(this.historico_atendimentos)
    this.schema.dropTable('atendimentos')
    this.schema.dropTable('salas')
    this.schema.dropTable('disponibilidades')
    this.schema.dropTable('especializacoes_profissionais')
    this.schema.dropTable('profissionais')
    this.schema.dropTable('especializacoes')
    this.schema.dropTable('funcoes')
    this.schema.dropTable('clientes')
  }
}
