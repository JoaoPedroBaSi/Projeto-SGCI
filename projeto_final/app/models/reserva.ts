import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Sala from '#models/sala'
import Profissional from '#models/profissional'

export default class Reserva extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare salaId: number

  @column()
  declare profissionalId: number | null

  @column()
  declare dataHoraInicio: DateTime

  @column()
  declare dataHoraFim: DateTime

  @column()
  declare status: 'PENDENTE' | 'APROVADA' | 'REJEITADA'

  @column()
  declare pagamentoEfetuado: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamentos
  @belongsTo(() => Sala)
  declare sala: BelongsTo<typeof Sala>

  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>
}
