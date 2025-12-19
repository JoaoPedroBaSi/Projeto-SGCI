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
  declare status: 'PENDENTE' | 'APROVADA' | 'REJEITADO'

  @column()
  declare pagamentoEfetuado: boolean

  @column()
  declare formaPagamento: 'PIX' | 'CREDITO' | 'DEBITO' | 'PENDENTE'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Sala)
  public declare sala: BelongsTo<typeof Sala>

  @belongsTo(() => Profissional)
  public declare profissional: BelongsTo<typeof Profissional>
}
