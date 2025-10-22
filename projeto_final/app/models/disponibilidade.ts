import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'

export default class Disponibilidade extends BaseModel {
  //atributos
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profissionalId: number

  @column()
  declare status: "livre" | "ocupado" | "bloqueado"

  @column.dateTime()
  declare dataHoraInicio: DateTime

  @column.dateTime()
  declare dataHoraFim: DateTime

  //relacionamentos
  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
