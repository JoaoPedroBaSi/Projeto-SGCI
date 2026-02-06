import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Reserva from '#models/reserva'
import User from '#models/user'

export default class Transacao extends BaseModel {
  public static table = 'transacoes'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' }) 
  declare userId: number

  @column({ columnName: 'atendimento_id' })
  declare atendimentoId: number | null

  @column()
  declare valor: number

  @column()
  declare tipo: 'ENTRADA' | 'SAIDA'

  @column()
  declare finalidade: string 

  @column()
  declare descricao: string | null

  @column({ columnName: 'forma_pagamento' })
  declare formaPagamento: 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO' | null

  @column()
  declare status: 'PENDENTE' | 'CONCLUIDA' | 'FALHOU' | 'ESTORNADA'

  @column({ columnName: 'referencia_externa' }) 
  declare referenciaExterna: string | null

  @column({ columnName: 'entidade_origem' })
  declare entidadeOrigem: string | null

  @column({ columnName: 'entidade_id' })
  declare entidadeId: number | null

  @column({ columnName: 'destinatario_tipo' })
  declare destinatarioTipo: string | null

  @column({ columnName: 'destinatario_id' })
  declare destinatarioId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime


  @belongsTo(() => User, {
    foreignKey: 'userId'
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Reserva)
  declare reservas: HasMany<typeof Reserva>
}