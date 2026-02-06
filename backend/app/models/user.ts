import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare fullName: string

  @column()
  declare telefone: string | null

  @column()
  declare perfilTipo: 'admin' | 'profissional' | 'cliente'

  // ADICIONE ESTA LINHA:
  @column()
  declare status: 'ativo' | 'inativo'

  @column({ serializeAs: null })
  declare rememberMeToken: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Cliente)
  declare cliente: HasOne<typeof Cliente>

  @hasOne(() => Profissional)
  declare profissional: HasOne<typeof Profissional>
}