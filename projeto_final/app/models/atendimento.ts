import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'
import Cliente from '#models/cliente'

export default class Atendimento extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profissionalId: number

  @column()
  declare clienteId: number

  @column()
  declare horarioComeco: string

  @column()
  declare horarioTermino: string

  @column()
  declare data: string

  @column()
  declare valor: number

  @column()
  declare formaPagamento: 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO'

  @column()
  declare feito: boolean

  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}