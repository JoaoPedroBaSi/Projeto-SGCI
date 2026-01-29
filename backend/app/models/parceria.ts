import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Parceria extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare ramo: string

  @column()
  declare cep: string

  @column()
  declare cnpj: string

  @column()
  declare siteUrl: string | null

  @column()
  declare porcentagemDesconto: number

  @column()
  declare tipoConvenio: string

  @column()
  declare tipoRelacionamento: 'ENTRADA' | 'SAIDA' | 'MISTO' | 'ESTRATEGICO'

  @column()
  declare dataInicio: DateTime | null

  @column()
  declare statusParceria: 'ATIVO' | 'INATIVO' | 'EM NEGOCIACAO'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
