import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'

export default class Funcao extends BaseModel {
  public static table = 'funcoes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: 'MEDICO' | 'DENTISTA' | 'TERAPEUTA' | 'PSICOLOGO' | 'UROLOGISTA' | 'GINECOLOGISTA' | 'NUTRICIONISTA'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Profissional)
  declare profissionais: HasMany<typeof Profissional>
}