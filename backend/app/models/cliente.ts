import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Atendimento from '#models/atendimento'
import User from '#models/user'

export default class Cliente extends BaseModel {
  // O ID não é gerado aqui — é fornecido pela tabela `users` (não auto-increment).
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'nome' }) 
  declare name: string

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

  // --- RELACIONAMENTOS ---

  @belongsTo(() => User, {
    foreignKey: 'id', // A chave estrangeira é o próprio ID
    localKey: 'id'
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Atendimento)
  declare atendimentos: HasMany<typeof Atendimento>
}