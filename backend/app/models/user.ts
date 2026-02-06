import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'


const AuthFinder = withAuthFinder(() => hash as any, {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends AuthFinder(BaseModel) {
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

  @column()
  declare status: 'ativo' | 'inativo' | 'pendente'

  @column()
  declare passwordResetToken: string | null

  @column.dateTime()
  declare passwordResetTokenExpiresAt: DateTime | null

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