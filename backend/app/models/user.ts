import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash' // Correção: Import default
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'

/**
 * 1. Corrigimos a factory de hash passando o cast 'as any' para evitar
 * o erro de propriedades privadas do HashService.
 */
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

  /**
   * 2. RESOLUÇÃO DO ERRO TS2417:
   * O mixin já injeta um 'verifyCredentials' automaticamente.
   * Para evitar o erro de compatibilidade, mudamos o nome do nosso
   * método manual ou deixamos o do mixin agir. 
   * Vou renomear para 'autenticar' para você usar no Controller sem conflitos.
   */
  static async autenticar(email: string, password: string) {
    const user = await this.findBy('email', email)
    if (!user) return null
    
    const isValid = await hash.verify(user.password, password)
    return isValid ? user : null
  }
}