import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type Sala from '#models/sala'
import type Profissional from '#models/profissional'

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamentos
// 2. MUDANÇA: Usar importação dinâmica com .then() e o truque do 'as any'
  @belongsTo(() => import('#models/sala').then((module) => module.default) as any)
  declare sala: BelongsTo<typeof Sala>

  @belongsTo(() => import('#models/profissional').then((module) => module.default )as any)
  declare profissional: BelongsTo<typeof Profissional>
}
