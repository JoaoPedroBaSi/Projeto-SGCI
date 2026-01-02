import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Reserva from '#models/reserva'

export default class Transacao extends BaseModel {
  public static table = 'transacoes'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare entidadeOrigem: string

  @column()
  declare entidadeId: number

  @column()
  declare destinatarioTipo: string

  @column()
  declare destinatarioId: number

  @column()
  declare valor: number

  @column()
  declare tipo: 'ENTRADA' | 'SAIDA'

  @column()
  declare finalidade: string

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
