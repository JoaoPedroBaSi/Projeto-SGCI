import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Sala from '#models/sala'
import Profissional from '#models/profissional'
import Transacao from '#models/transacao'

export default class Reserva extends BaseModel {
  public static table = 'reservas'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'sala_id' })
  declare salaId: number

  @column({ columnName: 'profissional_id' })
  declare profissionalId: number | null

  @column({ columnName: 'transacao_id' })
  declare transacaoId: number | null

  @column.dateTime({ columnName: 'data_hora_inicio' })
  declare dataHoraInicio: DateTime

  @column.dateTime({ columnName: 'data_hora_fim' })
  declare dataHoraFim: DateTime

  @column()
  declare status: 'PENDENTE' | 'APROVADA' | 'REJEITADO'

  @column({ columnName: 'valor_total' })
  declare valorTotal: number

  @column({ columnName: 'pagamento_efetuado' })
  declare pagamentoEfetuado: boolean

  @column({ columnName: 'forma_pagamento' }) 
  declare formaPagamento: 'PIX' | 'CREDITO' | 'DEBITO' | 'PENDENTE'


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Sala)
  declare sala: BelongsTo<typeof Sala>

  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Transacao)
  declare transacao: BelongsTo<typeof Transacao>
}