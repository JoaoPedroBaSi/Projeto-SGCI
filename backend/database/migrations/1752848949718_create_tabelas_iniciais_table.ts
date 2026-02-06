import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tabelas_iniciais'

  async up() {
    // 1. CLIENTES
    this.schema.createTable('clientes', (table) => {
      table.integer('id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
      table.string('nome', 100).notNullable()
      table.enum('genero', ['MASCULINO', 'FEMININO']).notNullable()
      table.date('data_nascimento').notNullable()
      table.string('cpf', 14).notNullable().unique() 
      table.string('email').notNullable().unique()
      table.string('senha').notNullable()
      table.string('telefone', 20).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 2. FUNCOES
    this.schema.createTable('funcoes', (table) => {
      table.increments('id')
      table.enum('nome', ['MEDICO', 'DENTISTA', 'TERAPEUTA', 'PSICOLOGO', 'UROLOGISTA', 'GINECOLOGISTA', 'NUTRICIONISTA'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 3. ESPECIALIZACOES
    this.schema.createTable('especializacoes', (table) => {
      table.increments('id')
      table.string('nome', 100).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 4. PROFISSIONAIS
    this.schema.createTable('profissionais', (table) => {
      table.integer('id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
      table.integer('funcao_id').unsigned().nullable().references('funcoes.id') 
      table.string('nome', 100).notNullable()
      table.enum('genero', ['MASCULINO', 'FEMININO', 'OUTRO']).notNullable()
      table.date('data_nascimento').notNullable()
      table.string('cpf', 14).notNullable().unique()
      table.string('email').notNullable().unique()
      table.string('senha').notNullable() 
      table.string('telefone', 20).notNullable()

      table.enum('status', ['pendente', 'aprovado', 'rejeitado', 'ativo', 'inativo']).defaultTo('pendente')
      table.string('registro_conselho').nullable()
      table.string('conselho_uf', 2).nullable()
      table.string('foto_perfil_url').nullable()
      table.text('biografia').nullable()
      table.string('comprovante_credenciamento_url').nullable()
      table.text('observacoes_admin').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 5. ESPECIALIZACOES_PROFISSIONAIS (Pivot)
    this.schema.createTable('especializacoes_profissionais', (table) => {
      table.increments('id')
      table.integer('especializacao_id').unsigned().notNullable().references('especializacoes.id').onDelete('CASCADE')
      table.integer('profissional_id').unsigned().notNullable().references('profissionais.id').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 6. DISPONIBILIDADES
    this.schema.createTable('disponibilidades', (table) => {
      table.increments('id')
      table.integer('profissional_id').unsigned().notNullable().references('profissionais.id').onDelete('CASCADE')
      table.timestamp('data_hora_inicio').notNullable()
      table.timestamp('data_hora_fim').notNullable()
      table.enum('status', ['LIVRE', 'OCUPADO', 'BLOQUEADO', 'FINALIZADO', 'RESERVADO']).notNullable().defaultTo('LIVRE')
      table.timestamps(true, true)
    })

    // 7. SALAS
    this.schema.createTable('salas', (table) => {
      table.increments('id')
      table.string('nome', 50).notNullable()
      table.enum('status', ['DISPONIVEL', 'OCUPADO', 'MANUTENÇÃO']).defaultTo('DISPONIVEL')
      table.integer('capacidade_pacientes').notNullable()
      table.decimal('preco_aluguel', 10, 2).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('atendimentos', (table) => {
      table.increments('id')
      table.integer('profissional_id').unsigned().notNullable().references('profissionais.id').onDelete('CASCADE')
      table.integer('cliente_id').unsigned().notNullable().references('clientes.id').onDelete('CASCADE')
      table.integer('disponibilidade_id').unsigned().notNullable().references('disponibilidades.id').onDelete('CASCADE')
      table.integer('sala_id').nullable().unsigned().references('salas.id').onDelete('SET NULL')
      
      table.timestamp('data_hora_inicio').notNullable()
      table.timestamp('data_hora_fim').nullable()
      
      table.text('observacoes').nullable()
      table.decimal('valor', 10, 2).nullable()
      
      table.enum('forma_pagamento', ['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO', 'BOLETO']).notNullable()
      table.enum('status', ['CONFIRMADO', 'CANCELADO', 'CONCLUIDO', 'PENDENTE']).notNullable().defaultTo('PENDENTE')
      
      table.string('justificativa_falta', 200).nullable()
      table.enum('status_pagamento', ['PENDENTE', 'EM_ANALISE', 'PAGO', 'NEGADO', 'CANCELADO', 'ESTORNADO', 'CONTESTADO']).nullable()
      
      table.timestamps(true, true)
    })

    this.schema.createTable('reservas', (table) => {
      table.increments('id')
      table.integer('sala_id').unsigned().notNullable().references('id').inTable('salas').onDelete('CASCADE')
      table.integer('profissional_id').unsigned().notNullable().references('id').inTable('profissionais').onDelete('CASCADE')
      
      table.timestamp('data_hora_inicio').notNullable()
      table.timestamp('data_hora_fim').notNullable()
      
      table.enum('status', ['PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA', 'CONCLUIDA']).defaultTo('PENDENTE')
      
      table.string('observacoes').nullable()
      table.timestamps(true, true)
    })

    // 9. PARCERIAS
    this.schema.createTable('parcerias' , (table) => {
      table.increments('id')
      table.string('nome', 100).notNullable()
      table.string('ramo', 100).notNullable()
      table.string('cep').notNullable()
      table.string('cnpj', 20).notNullable()
      // Se não houver endereço detalhado no validator, mantemos o que veio
      table.string('cidade', 100).nullable() 
      table.string('bairro', 100).nullable()
      table.string('rua', 100).nullable()
      table.string('numero', 10).nullable()
      
      table.string('site_url').nullable()
      table.decimal('porcentagem_desconto', 5, 2).notNullable()
      table.string('tipo_convenio', 100).notNullable()
      table.enum('tipo_relacionamento', ['ENTRADA', 'SAIDA', 'MISTO', 'ESTRATEGICO']).notNullable()
      table.timestamp('data_inicio').nullable()
      table.enum('status_parceria', ['ATIVO', 'INATIVO', 'EM NEGOCIACAO']).notNullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 10. PRONTUARIOS
    this.schema.createTable('prontuarios', (table) => {
      table.increments('id')
      table.integer('atendimento_id').unsigned().notNullable().references('atendimentos.id').onDelete('CASCADE')
      table.integer('profissional_id').unsigned().notNullable().references('profissionais.id').onDelete('CASCADE')
      
      table.string('diagnostico').notNullable()
      table.text('medicamentos_prescritos').nullable()
      table.text('recomendacoes').nullable()
      table.string('caminho_anexo').nullable()
      table.text('descricao').nullable()
      
      table.integer('parceria_id').unsigned().nullable().references('parcerias.id').onDelete('SET NULL')
      table.timestamps(true, true)
    })

    // 11. INVENTARIO
    this.schema.createTable('inventario', (table) => {
      table.increments('id')
      table.string('nome').notNullable().unique()
      table.enum('tipo', ['MEDICAMENTO', 'EQUIPAMENTO', 'MATERIAL_ESCRITORIO', 'MATERIAL_LIMPEZA']).notNullable()
      table.integer('quantidade').notNullable().defaultTo(0)
      table.string('unidade_medida').notNullable().defaultTo('unidade')
      table.date('validade').nullable()
      table.string('lote').nullable()
      table.string('fornecedor').nullable()
      table.integer('ponto_reposicao').notNullable().defaultTo(10)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 12. MOVIMENTACAO INVENTARIO
    this.schema.createTable('movimentacao_inventario', (table) => {
      table.increments('id')
      table.integer('inventario_id').unsigned().notNullable().references('inventario.id').onDelete('RESTRICT')
      table.integer('profissional_id').unsigned().notNullable().references('profissionais.id')
      table.enum('tipo', ['ENTRADA', 'SAIDA']).notNullable()
      table.integer('quantidade').unsigned().notNullable()
      table.text('observacao').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 13. TRANSACOES
    this.schema.createTable('transacoes', (table) => {
      table.increments('id')
      
      // Vínculos
      table.integer('atendimento_id').unsigned().nullable().references('id').inTable('atendimentos').onDelete('SET NULL')
      
      table.integer('reserva_id').unsigned().nullable().references('id').inTable('reservas').onDelete('SET NULL')
      
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.string('entidade_origem', 50).nullable()
      table.integer('entidade_id').unsigned().nullable()
      table.index(['entidade_origem', 'entidade_id'])

      table.string('destinatario_tipo', 50).nullable()
      table.integer('destinatario_id').unsigned().nullable()
      table.index(['destinatario_tipo', 'destinatario_id'])

      table.decimal('valor', 10, 2).notNullable()
      table.enum('tipo', ['ENTRADA', 'SAIDA']).notNullable()
      table.string('finalidade').notNullable()

      table.enum('status', ['PENDENTE', 'CONCLUIDA', 'FALHOU', 'ESTORNADA']).notNullable().defaultTo('PENDENTE')

      table.string('descricao').nullable()
      table.string('forma_pagamento').nullable()
      table.string('referencia_externa').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 14. PEDIDOS REPOSICAO
    this.schema.createTable('pedidos_reposicao', (table) => {
      table.increments('id')
      table.integer('profissional_id').unsigned().notNullable().references('profissionais.id')
      table.integer('inventario_id').unsigned().notNullable().references('inventario.id')
      table.integer('quantidade').notNullable()
      table.enum('status', ['pendente', 'aprovado', 'rejeitado']).notNullable().defaultTo('pendente')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTableIfExists('pedidos_reposicao')
    this.schema.dropTableIfExists('transacoes')
    this.schema.dropTableIfExists('movimentacao_inventario')
    this.schema.dropTableIfExists('inventario')
    this.schema.dropTableIfExists('prontuarios')
    this.schema.dropTableIfExists('parcerias')
    this.schema.dropTableIfExists('reservas') 
    this.schema.dropTableIfExists('atendimentos')
    this.schema.dropTableIfExists('salas')
    this.schema.dropTableIfExists('disponibilidades')
    this.schema.dropTableIfExists('especializacoes_profissionais')
    this.schema.dropTableIfExists('profissionais')
    this.schema.dropTableIfExists('especializacoes')
    this.schema.dropTableIfExists('funcoes')
    this.schema.dropTableIfExists('clientes')
  }
}