import { DateTime } from 'luxon' // <--- OBRIGATÓRIO
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Atendimento from '#models/atendimento'
import User from '#models/user'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare nome: string

  @column()
  declare genero: 'MASCULINO' | 'FEMININO'

  // --- CORREÇÃO CRUCIAL AQUI ---
  @column.date()
  declare dataNascimento: DateTime // <--- Se estiver "Date", MUDE para "DateTime"

  @column()
  declare cpf: string

  @column()
  declare telefone: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Atendimento)
  declare atendimentos: HasMany<typeof Atendimento>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}