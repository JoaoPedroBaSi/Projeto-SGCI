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

  @column({ columnName: 'unidade_medida' })
  declare unidadeMedida: string

  @column()
  declare lote: string | null

  @column()
  declare fornecedor: string | null

  @column()
  declare quantidade: number

  @column({ columnName: 'ponto_reposicao' })
  declare pontoReposicao: number

  @column.date() 
  declare validade: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}