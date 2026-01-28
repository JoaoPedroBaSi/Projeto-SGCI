import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Reserva from '#models/reserva'

export default class Transacao extends BaseModel {
  public static table = 'transacoes'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' }) // Mapeamento explicito é bom
  declare userId: number

  @column({columnName: 'atendimento_id'})
  declare atendimentoId: number | null

  // Campos Opcionais Avançados
  @column()
  declare entidadeOrigem: string | null

  @column()
  declare entidadeId: number | null

  @column()
  declare destinatarioTipo: string | null

  @column()
  declare destinatarioId: number | null

  @column()
  declare valor: number

  @column()
  declare tipo: 'ENTRADA' | 'SAIDA'

  @column()
  declare finalidade: string

  // === ADICIONE ESSES ===
  @column()
  declare descricao: string | null

  @column({ columnName: 'forma_pagamento' })
  declare formaPagamento: string | null

  @column()
  declare status: 'PENDENTE' | 'CONCLUIDA' | 'FALHOU' | 'ESTORNADA'

  @column()
  declare referenciaExterna: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Reserva)
  declare reservas: HasMany<typeof Reserva>
}
