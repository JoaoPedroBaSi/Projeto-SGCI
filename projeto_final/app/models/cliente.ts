import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Atendimento from '#models/atendimento'

export default class Cliente extends BaseModel {
  //atributos
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare genero: 'MASCULINO' | 'FEMININO'

  @column()
  declare dataNascimento: DateTime

  @column()
  declare cpf: string

  @column()
  declare telefone: string

  @column()
  declare email: string

  @column()
  declare senha: string

  //relacionamentos
  @hasMany(() => Atendimento)
  declare atendimentos: HasMany<typeof Atendimento>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
