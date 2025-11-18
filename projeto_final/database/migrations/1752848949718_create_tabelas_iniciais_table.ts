import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tabelas_iniciais'

  async up() {
    this.schema.createTable('clientes', (table) => {
      // troquei o id para ser o mesmo na tabela users, ao invés de auto incrementar
      // Assim, o id é o mesmo, evitando futuros erros de inconsistência por conta de
      // um id diferente entre as tabelas
      table.integer('id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
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
      // troquei o id para ser o mesmo na tabela users, ao invés de auto incrementar
      // Assim, o id é o mesmo, evitando futuros erros de inconsistência por conta de
      // um id diferente entre as tabelas
      table.integer('id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE')
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
      table
        .integer('profissional_id')
        .unsigned()
        .notNullable()
        .references('profissionais.id')
        .onDelete('CASCADE')
      //"Dia x, o profissional atende do horario_comeco ao horario_fim".
      table.timestamp('data_hora_inicio').notNullable()
      table.timestamp('data_hora_fim').notNullable()
      table.enum('status', ['LIVRE', 'OCUPADO', 'BLOQUEADO']).notNullable().defaultTo('LIVRE')
      table.timestamps(true, true)
    })

    this.schema.createTable('salas', (table) => {
      table.increments('id')
      //Não tem o notnullable pois a sala pode ter nenhum profissional ligado a ela.
      table.integer('profissional_id').unsigned().references('profissionais.id')
      table.string('nome', 20).notNullable()
      table.enum('status', ['DISPONIVEL', 'OCUPADO', 'MANUTENÇÃO'])
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
      table
        .integer('disponibilidade_id')
        .unsigned()
        .notNullable()
        .references('disponibilidades.id')
        .onDelete('CASCADE')
      table.integer('sala_id').unsigned().references('salas.id').onDelete('SET NULL')

      //Horário/Data de começo e Horário/Data de fim para comparar com a disponibilidade
      table.timestamp('data_hora_inicio').notNullable()
      //'data_hora_fim' é nullable pois é a aplicação que o determina, não o usuário
      table.timestamp('data_hora_fim').nullable()

      //Coluna observacoes para caso acha alguma coisa a ser dita sobre o atendimento
      table.text('observacoes').nullable()

      //Valor é nullable pois somente é determinado pelo próprio
      //profissional (com o update). Portanto, inicialmente pode ser null
      table.decimal('valor', 10, 2).nullable()
      //Obrigatoriamente o usuário terá que escolher uma forma de pagamento válido
      table
        .enum('forma_pagamento', ['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO'])
        .notNullable()
      //Add status para indentificarmos o ciclo de vida do atendimento
      table
        .enum('status', ['CONFIRMADO', 'CANCELADO', 'CONCLUIDO'])
        .notNullable()
        .defaultTo('CONFIRMADO')
      // Status para verificarmos o ciclo de vida do pagamento
      // Status de pagamento só será modificado para 'PENDENTE' após o atendimento ser marcado como concluído
      table.enum('status_pagamento', [
        'PENDENTE',        // Boleto gerado, Pix aguardando pagamento
        'EM_ANALISE',      // Transação em verificação anti-fraude
        'PAGO',            // Pagamento confirmado e garantido
        'NEGADO',          // Falha na transação (cartão recusado)
        'CANCELADO',       // Cancelado pelo cliente ou sistema antes da aprovação
        'ESTORNADO',       // Reembolsado ao cliente
        'CONTESTADO'       // Chargeback (disputa)
      ]).nullable()
      table.timestamps(true, true)
    })

    this.schema.createTable('parcerias' , (table) => {
    table.increments('id'),

    //Na prescrição o profissional terá a possibilidade de indicar uma parceria
    table.string('nome', 40).notNullable()
    //Informa qual ramo a empresa é
    table.string('ramo', 40).notNullable()
    //A partir do cep poderemos mostrar a localização precisa
    table.integer('cep', 8).notNullable()
    //site_url nullable pois uma empresa parceira pode não ter site
    table.string('site_url').nullable()
    table.float('porcentagem_desconto', 5, 2).notNullable()
    table.string('tipo_convenio', 50).notNullable()
    //'tipo_relacionamento' indica se a empresa parceira é
    //Entrada -> A clínica vende o produto dela (Fornecedor)
    //Saída -> A clínica compra dela (Comprador)
    //Misto -> A clínica compra e venda dela
    //Estrategico -> Não financeiro. Parceiro de marketing, desenvolvimento de produto, etc.
    table.enum('tipo_relacionamento', ['ENTRADA', 'SAIDA', 'MISTO', 'ESTRATEGICO']).notNullable()
    //Data de inicio da parceria. Pode ser null, tendo em vista que depende do 'status_parceria'
    table.timestamp('data_inicio').nullable()
    table.enum('status_parceria', ['ATIVO', 'INATIVO', 'EM NEGOCIACAO']).notNullable()

    table.timestamp('created_at')
    table.timestamp('updated_at')
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

      // Recomendação de empresa parceira
      // Como o profissional não é obrigado a recomendar uma parceira, é nullable
      table
        .integer('parceria_id')
        .unsigned()
        .nullable()
        .references('parcerias.id')
        .onDelete('SET NULL')

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

  this.schema.createTable('transacoes', (table) => {
      table.increments('id')

      //ID do usuário responsável pela transação
    table
        .integer('user_id')
        .unsigned()
        .notNullable()
        //A coluna de referência
        .references('id')
        //Nome da tabela de referência
        .inTable('users')
        .onDelete('CASCADE')

      //De qual tabela veio essa transação (ex: cliente).
      //Essa parte identifica que usuário especificamente realizou a transação,
      //se foi um cliente, um profissional, um admin, etc.
      table.string('entidade_origem').notNullable()
      //De qual registro da tabela veio essa transação (ex: cliente.id)
      table.integer('entidade_id')
        .unsigned() //Apenas se os IDs forem sempre positivos
        .notNullable()

      //Chave de índice para otimizar buscas pela origem
      table.index(['entidade_origem', 'entidade_id'])

      //Para onde essa transação foi (ex: destinatario_tipo = profissional, destinario_id = profissional.id)
      table.string('destinatario_tipo', 50).nullable()
      table.integer('destinatario_id').unsigned().nullable()

      //Chave de índice para otimizar buscas pelo destino
      table.index(['destinatario_tipo', 'destinatario_id'])

      table.decimal('valor', 10, 2).notNullable()
      //Indica se é entrada ou saída
      table.enum('tipo', ['ENTRADA', 'SAIDA']).notNullable()
      //A finalidade para que aquela transacao acontecer
      table.string('finalidade').notNullable()
      //Estado da transação (pode ser PENDENTE, CONCLUIDA, FALHOU)
      //Obs: estornada é uma transação que tinha sido dita como concluída, mas por algum motivo houve uma falha
      table.enum('status', ['PENDENTE', 'CONCLUIDA', 'FALHOU', 'ESTORNADA']).notNullable().defaultTo('PENDENTE')
      //Id da transação no gateway de pagamento (ex: ID do PIX, ID do Stripe)
      table.string('referencia_externa').nullable()

      //Horário da transação
      table.timestamp('created_at')
      table.timestamp('updated_at')

    })
    this.schema.createTable('pedidos_reposicao', (table) => {
      table.increments('id')
      table.integer('id_profissional').unsigned().notNullable().references('profissionais.id')
      table.integer('id_inventario').unsigned().notNullable().references('inventario.id')
      table.integer('quantidade').notNullable()
      table.enum('status', ['pendente', 'aprovado', 'rejeitado']).notNullable().defaultTo('pendente')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable('transacoes')
    this.schema.dropTable('movimentacao_inventario')
    this.schema.dropTable('inventario')
    this.schema.dropTable('prontuarios')
    this.schema.dropTable('parcerias')
    this.schema.dropTable('atendimentos')
    this.schema.dropTable('salas')
    this.schema.dropTable('disponibilidades')
    this.schema.dropTable('especializacoes_profissionais')
    this.schema.dropTable('profissionais')
    this.schema.dropTable('especializacoes')
    this.schema.dropTable('funcoes')
    this.schema.dropTable('clientes')
    this.schema.dropTable('pedidos_reposicao')
  }
}
