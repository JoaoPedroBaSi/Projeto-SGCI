import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash' // Importa o serviço do core
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'

// Definimos o authFinder passando o serviço de hash diretamente.
// O cast 'as unknown as any' é necessário apenas se o TS ainda reclamar de membros privados.
const authFinder = withAuthFinder(() => hash as any, {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, authFinder) {
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