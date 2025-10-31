import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tabelas_iniciais'

  async up() {
    this.schema.createTable('clientes', (table) => {
      table.increments('id')
      table.string('nome', 40).notNullable()
      table.enum('genero', ['MASCULINO', 'FEMININO']).notNullable()
      table.date('data_nascimento').notNullable()
      table.string('cpf').notNullable().unique()
      // table.string('rg').notNullable
      table.string('email').notNullable().unique()
      table.string('senha').notNullable()
      table.string('telefone').notNullable()
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
      table.date('data_nascimento').notNullable()
      table.string('cpf').notNullable().unique()
      table.string('email').notNullable().unique()
      table.string('senha').notNullable()
      table.string('telefone').notNullable()
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
      table
        .integer('profissional_id')
        .unsigned()
        .notNullable()
        .references('profissionais.id')
        .onDelete('CASCADE')
      //"Dia x, o profissional atende do horario_comeco ao horario_fim".
      table.timestamp('data_hora_inicio').notNullable()
      table.timestamp('data_hora_fim').notNullable()
      table.enum('status', ['livre', 'ocupado', 'bloqueado']).notNullable().defaultTo('livre')
      table.timestamps(true, true)
    })

    this.schema.createTable('salas', (table) => {
      table.increments('id')
      //Não tem o notnullable pois a sala pode ter nenhum profissional ligado a ela.
      table.integer('profissional_id').unsigned().references('profissionais.id')
      table.string('nome', 20).notNullable()
      table.integer('capacidade_pacientes').notNullable()
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
      table.integer('sala_id').unsigned().references('salas.id').onDelete('SET NULL')
      table.integer('disponibilidade_id').unsigned().notNullable().references('disponibilidades.id')


      //Coluna observacoes para caso acha alguma coisa a ser dita sobre o atendimento
      table.text('observacoes').nullable()

      table.decimal('valor', 10, 2).notNullable()
      table
        .enum('forma_pagamento', ['PENDENTE', 'DINHEIRO', 'PIX', 'CREDITO', 'DEBITO'])
        .notNullable()
        .defaultTo('PENDENTE')
      //Tirei o validado pois todas os atendimentos que forem criados,
      //já passaram por etapas de validação
      //table.boolean('validado').notNullable()
      //Add status para indentificarmos o ciclo de vida do atendimento
      table
        .enum('status', ['AGENDADO', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'])
        .notNullable()
        .defaultTo('AGENDADO')
      table.timestamps(true, true)
    })

    this.schema.createTable('prontuarios', (table) => {
      table.increments('id')
      table
        .integer('atendimento_id')
        .unsigned()
        .notNullable()
        .references('atendimentos.id')
        .onDelete('CASCADE')
      table
        .integer('profissional_id')
        .unsigned()
        .notNullable()
        .references('profissionais.id')
        .onDelete('CASCADE')
      // Diagnóstico principal daquele atendimento
      table.string('diagnostico').notNullable()

      // Medicação que foi prescrita ou recomendada na sessão
      table.text('medicamentos_prescritos').nullable()

      // Recomendações dadas ao paciente
      table.text('recomendacoes').nullable()

      // Guarda o caminho para um arquivo de exame que foi salvo no servidor
      table.string('caminho_anexo').nullable()
      table.text('descricao').nullable()
      table.timestamps(true, true)
    })

    this.schema.createTable('inventario', (table) => {
      table.increments('id')
      // bom que o nome seja único para evitar duplicatas
      table.string('nome').notNullable().unique()
      table
        .enum('tipo', ['MEDICAMENTO', 'EQUIPAMENTO', 'MATERIAL_ESCRITORIO', 'MATERIAL_LIMPEZA'])
        .notNullable()
      table.integer('quantidade').notNullable().defaultTo(0)
      // Como a quantidade é contada? É por "unidade", "caixa", "pacote", "ml"
      table.string('unidade_medida').notNullable().defaultTo('unidade')
      table.date('validade').nullable()
      table.string('lote')
      table.string('fornecedor')
      // número que define o "nível de alerta"
      table.integer('ponto_reposicao').notNullable().defaultTo(10)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
    this.schema.createTable('movimentacao_inventario', (table) => {
      table.increments('id')
      table
        .integer('id_item')
        .unsigned()
        .notNullable()
        .references('inventario.id')
        .onDelete('RESTRICT') // Impede que um item seja deletado se ele tiver movimentações

      table.integer('id_profissional').unsigned().notNullable().references('profissionais.id')

      table.enum('tipo', ['ENTRADA', 'SAIDA']).notNullable()

      table.integer('quantidade').unsigned().notNullable()

      // Campo para justificativa ou observação (ex: "Uso no atendimento X", "Recebimento do fornecedor Y")
      table.text('observacao')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    //this.schema.dropTable(this.historico_atendimentos)
    this.schema.dropTable('movimentacao_inventario')
    this.schema.dropTable('inventario')
    this.schema.dropTable('prontuarios')
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
