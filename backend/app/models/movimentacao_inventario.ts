import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Inventario from '#models/inventario'
import Profissional from '#models/profissional'

export default class MovimentacaoInventario extends BaseModel {
  public static table = 'movimentacao_inventario'
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'id_item' })
  declare idItem: number

  @column({ columnName: 'id_profissional' })
  declare idProfissional: number

  @column()
  declare tipo: 'ENTRADA' | 'SAIDA'

  @column()
  declare quantidade: number

  @column()
  declare observacao: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Chaves estrangeiras
  @belongsTo(() => Inventario, { foreignKey: 'idItem' })
  declare public inventario: BelongsTo<typeof Inventario>

  @belongsTo(() => Profissional, { foreignKey: 'idProfissional' })
  declare public profissional: BelongsTo<typeof Profissional>
}
