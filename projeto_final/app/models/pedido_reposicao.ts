import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Profissional from './profissional.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Inventario from './inventario.js'

export default class PedidoReposicao extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare idProfissional: number

  @column()
  declare idInventario: number

  @column()
  declare quantidade: number

  @column()
  declare status: 'pendente' | 'aprovado' | 'rejeitado'

  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Inventario)
  declare inventario: BelongsTo<typeof Inventario>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}