import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Atendimento from '#models/atendimento'
import User from '#models/user'

export default class Cliente extends BaseModel {
  // O ID é o mesmo da tabela `users` (Relacionamento 1:1 com chave compartilhada)
  @column({ isPrimary: true })
  declare id: number

  @column() 
  declare nome: string

  @column()
  declare genero: 'MASCULINO' | 'FEMININO'

  @column.date()
  declare dataNascimento: DateTime

  @column()
  declare cpf: string

  @column()
  declare telefone: string

  @column()
  declare email: string

  @column()
  declare senha: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime


  @belongsTo(() => User, {
    foreignKey: 'id', 
    localKey: 'id'
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Atendimento)
  declare atendimentos: HasMany<typeof Atendimento>
}