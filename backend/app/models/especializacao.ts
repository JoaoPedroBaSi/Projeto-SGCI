import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'

export default class Especializacao extends BaseModel {
  public static table = 'especializacoes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Profissional, {
    pivotTable: 'especializacoes_profissionais', 
  })
  declare profissionais: ManyToMany<typeof Profissional>
}