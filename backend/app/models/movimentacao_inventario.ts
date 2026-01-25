import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Inventario from '#models/inventario'
import User from '#models/user'

export default class MovimentacaoInventario extends BaseModel {
  public static table = 'movimentacao_inventario'
  @column({ isPrimary: true })
  declare id: number
  @column({ columnName: 'inventario_id' })
  declare inventarioId: number

  @column({ columnName: 'profissional_id' })
  declare profissionalId: number

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
  @belongsTo(() => Inventario, {
    foreignKey: 'inventarioId',
  })
  declare public inventario: BelongsTo<typeof Inventario>

  @belongsTo(() => User, {
    foreignKey: 'profissionalId',
  })
  declare public usuario: BelongsTo<typeof User>
}
