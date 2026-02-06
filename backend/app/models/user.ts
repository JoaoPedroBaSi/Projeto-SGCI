import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'

/**
 * No AdonisJS 6, usamos o 'withAuthFinder' dentro do helper 'compose'.
 * Isso injeta os métodos necessários para o Token Provider funcionar online.
 */
// `withAuthFinder` retorna um mixin que recebe uma superclasse e retorna
// uma subclasse. Forçar o tipo aqui evita erros de compatibilidade do
// TypeScript ao usar `compose` abaixo.
const AuthUser = (withAuthFinder as any)(BaseModel, {
  uids: ['email'],
  passwordColumnName: 'password',
}) as unknown as (superclass: typeof BaseModel) => typeof BaseModel

export default class User extends compose(BaseModel, AuthUser) {
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