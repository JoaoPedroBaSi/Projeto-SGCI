import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class EspecializacaoProfissional extends BaseModel {
  //atributos
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare especializacaoId: number

  @column()
  declare profissionalId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
