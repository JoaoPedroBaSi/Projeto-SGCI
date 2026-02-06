import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'
import Inventario from '#models/inventario'

export default class PedidoReposicao extends BaseModel {
  public static table = 'pedidos_reposicao'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'profissional_id' })
  declare profissionalId: number

  @column({ columnName: 'inventario_id' })
  declare inventarioId: number

  @column()
  declare quantidade: number

  @column()
  declare status: 'PENDENTE' | 'ATENDIDO' | 'CANCELADO'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Profissional, { foreignKey: 'profissionalId' })
  declare profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Inventario, { foreignKey: 'inventarioId' })
  declare inventario: BelongsTo<typeof Inventario>
}