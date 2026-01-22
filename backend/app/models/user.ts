import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasOne, beforeSave } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'

const AuthFinder = withAuthFinder(() => hash.use(), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  // Mapeia 'full_name' do banco para 'fullName' do código
  @column({ columnName: 'full_name' }) 
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare perfil_tipo: 'cliente' | 'profissional' | 'admin' | null

  // Campo opcional, pode não existir no banco dependendo da sua migration, 
  // mas não atrapalha se estiver aqui como null
  @column()
  declare perfil_id: number | null 

  @column()
  declare status: 'ativo' | 'pendente' | 'inativo' | null

  @column()
  declare password_reset_token: string | null

  @column.dateTime()
  declare password_reset_token_expires_at: DateTime | null

  // ============================================================
  // 🔗 RELACIONAMENTOS (CORRIGIDO)
  // ============================================================
  // Dizemos ao User: "Procure seu filho na tabela Clientes 
  // onde a coluna 'userId' for igual ao meu id"
  
  @hasOne(() => Cliente, {
    foreignKey: 'userId' 
  })
  declare cliente: HasOne<typeof Cliente>

  @hasOne(() => Profissional, {
    foreignKey: 'userId'
  })
  declare profissional: HasOne<typeof Profissional>
  // ============================================================

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  // Hook para criptografar a senha antes de salvar
  @beforeSave()
  public static async handlePasswordHashing(user: User) {
    if (user.$dirty.password) {
        // Evita re-hash se já estiver hashada (começa com $)
        if (user.password && user.password.startsWith('$')) return
        user.password = await hash.make(user.password)
    }
  }
}