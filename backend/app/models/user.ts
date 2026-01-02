import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'

// Use hash.use() para obter o executor padrão
const AuthFinder = withAuthFinder(() => hash.use(), {
  uids: ['email'],
  passwordColumnName: 'password',
})
export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ columnName: 'password', serializeAs: null })
  declare password: string

  @column()
  declare perfil_tipo: 'cliente' | 'profissional' | 'admin' | null

  @column()
  declare perfil_id: number | null

  @column()
  declare status: 'ativo' | 'pendente' | 'inativo'

  @column()
  declare password_reset_token: string | null

  @column.dateTime()
  declare password_reset_token_expires_at: DateTime | null

  // relacionamentos
  @hasOne(() => Cliente, { foreignKey: 'user_id' })
  declare cliente: HasOne<typeof Cliente>

  @hasOne(() => Profissional, { foreignKey: 'user_id' })
  declare profissional: HasOne<typeof Profissional>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
