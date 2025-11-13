import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Profissional from '#models/profissional'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Inventario from '#models/inventario'


export default class PedidoReposicao extends BaseModel {
  public static table = 'pedidos_reposicao'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'id_profissional' })
  declare idProfissional: number

  @column({ columnName: 'id_inventario' })
  declare idInventario: number

  @column()
  declare quantidade: number

  @column()
  declare status: 'pendente' | 'aprovado' | 'rejeitado'

  @belongsTo(() => Profissional, { foreignKey: 'id_profissional' })
  declare profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Inventario, { foreignKey: 'id_inventario' })
  declare inventario: BelongsTo<typeof Inventario>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}