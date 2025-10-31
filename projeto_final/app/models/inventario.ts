import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Inventario extends BaseModel {
  public static table = 'inventario'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare tipo: 'MEDICAMENTO' | 'EQUIPAMENTO' | 'MATERIAL_ESCRITORIO' | 'MATERIAL_LIMPEZA'

  @column()
  declare quantidade: number

  @column()
  declare unidadeMedida: string

  @column()
  declare validade: Date

  @column()
  declare lote: string | null

  @column()
  declare fornecedor: string | null

  @column()
  declare pontoReposicao: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
