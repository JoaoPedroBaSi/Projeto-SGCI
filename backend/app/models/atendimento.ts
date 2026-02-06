import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'
import Cliente from '#models/cliente'
import Sala from '#models/sala'
import Prontuario from '#models/prontuario'

export default class Atendimento extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profissionalId: number

  @column()
  declare clienteId: number

  @column()
  declare disponibilidadeId: number

  @column()
  declare salaId: number | null

  @column.dateTime()
  declare dataHoraInicio: DateTime

  @column.dateTime()
  declare dataHoraFim: DateTime

  @column()
  declare observacoes: string | null

  @column()
  declare justificativaFalta: string | null

  @column()
  declare valor: number

  @column()
  declare formaPagamento: 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO'

  @column()
  declare status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO'

  @column()
  declare statusPagamento: 'PENDENTE' | 'EM_ANALISE' | 'PAGO' | 'NEGADO' | 'CANCELADO' | 'ESTORNADO' | 'CONTESTADO'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => Sala)
  declare sala: BelongsTo<typeof Sala>
  
  @hasOne(() => Prontuario)
  declare prontuario: HasOne<typeof Prontuario>
}