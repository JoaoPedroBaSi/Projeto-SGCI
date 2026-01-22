import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Atendimento from '#models/atendimento'
import User from '#models/user'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // O ID é o mesmo do usuário, então userId é redundante, 
  // mas mantemos se sua lógica depender dele explicitamente.
  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare genero: 'MASCULINO' | 'FEMININO'

  @column.date()
  declare dataNascimento: DateTime

  @column()
  declare cpf: string

  @column()
  declare telefone: string

  // === CAMPOS ADICIONADOS PARA CORRIGIR O SEEDER ===
  @column()
  declare email: string

  @column()
  declare senha: string
  // =================================================

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamentos
  @belongsTo(() => User, {
    foreignKey: 'id', // A chave estrangeira é o próprio ID
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Atendimento)
  declare atendimentos: HasMany<typeof Atendimento>
}