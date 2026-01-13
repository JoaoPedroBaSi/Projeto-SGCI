import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany, HasMany, HasOne } from '@adonisjs/lucid/types/relations'

import User from '#models/user'
import Funcao from '#models/funcao'
import Especializacao from '#models/especializacao'
import Disponibilidade from '#models/disponibilidade'
import Sala from '#models/sala'
import Atendimento from '#models/atendimento'

export default class Profissional extends BaseModel {
  // Define explicitamente o nome da tabela
  public static table = 'profissionais'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column({ columnName: 'funcao_id' })
  declare funcaoId: number

  @column()
  declare nome: string

  @column()
  declare genero: 'MASCULINO' | 'FEMININO'

  // O Adonis precisa do Luxon DateTime para manipular datas corretamente
  @column.date()
  declare dataNascimento: DateTime 

  @column()
  declare cpf: string

  @column()
  declare telefone: string

  // === CORREÇÃO: CAMPO EMAIL ADICIONADO ===
  // Necessário pois sua migration tem a coluna email na tabela profissionais
  @column()
  declare email: string 
  // ========================================

  @column()
  declare registro_conselho: string | null

  @column()
  declare conselho_uf: string | null

  @column()
  declare foto_perfil_url: string | null

  @column()
  declare biografia: string | null

  @column()
  declare status: 'pendente' | 'aprovado' | 'rejeitado' | null

  @column()
  declare comprovante_credenciamento_url: string | null

  @column()
  declare observacoes_admin: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // --- RELACIONAMENTOS ---

  @belongsTo(() => Funcao)
  declare funcao: BelongsTo<typeof Funcao>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Especializacao, {
    pivotTable: 'especializacoes_profissionais',
  })
  declare especializacoes: ManyToMany<typeof Especializacao>

  @hasMany(() => Disponibilidade)
  declare disponibilidades: HasMany<typeof Disponibilidade>

  @hasOne(() => Sala)
  declare sala: HasOne<typeof Sala>

  @hasMany(() => Atendimento)
  declare atendimentos: HasMany<typeof Atendimento>
}