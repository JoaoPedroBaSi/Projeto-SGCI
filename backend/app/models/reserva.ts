import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Sala from '#models/sala'
import Profissional from '#models/profissional'
import Transacao from '#models/transacao'

export default class Reserva extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare salaId: number

  @column()
  declare profissionalId: number | null

  @column()
  declare transacaoId: number | null

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

  @column()
  declare valorTotal: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Sala)
  declare public sala: BelongsTo<typeof Sala>

  @belongsTo(() => Profissional)
  declare public profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Transacao)
  declare public transacao: BelongsTo<typeof Transacao>
}
