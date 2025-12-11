import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import Funcao from '#models/funcao'
import Especializacao from '#models/especializacao'
import Disponibilidade from '#models/disponibilidade'
import Sala from '#models/sala'
import Atendimento from '#models/atendimento'
import User from '#models/user'

export default class Profissional extends BaseModel {
  public static table = 'profissionais'

  //atributos
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'funcao_id' })
  declare funcaoId: number

  @column()
  declare nome: string

  @column()
  declare genero: 'MASCULINO' | 'FEMININO'

  @column()
  declare dataNascimento: DateTime

  @column()
  declare cpf: string

  @column()
  declare telefone: string

  @column()
  declare registro_conselho: string | null

  @column()
  declare conselho_uf: string | null

  @column()
  declare foto_perfil_url: string | null

  @column()
  declare biografia: string | null

  @column()
  declare status: 'pendente' | 'aprovado' | 'rejeitado'

  @column()
  declare comprovante_credenciamento_url: string | null

  @column()
  declare observacoes_admin: string | null

  //relacionamentos
// 2. RELACIONAMENTOS COM LAZY LOADING (O "Truque" do .then)

  @belongsTo(() => import('#models/funcao').then((m) => m.default) as any)
  declare funcao: BelongsTo<typeof Funcao>

  @belongsTo(() => import('#models/user').then((m) => m.default) as any)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => import('#models/especializacao').then((m) => m.default) as any, {
    pivotTable: 'especializacoes_profissionais',
  })
  declare especializacoes: ManyToMany<typeof Especializacao>

  @hasMany(() => import('#models/disponibilidade').then((m) => m.default) as any)
  declare disponibilidades: HasMany<typeof Disponibilidade>

  @manyToMany(() => import('#models/sala').then((m) => m.default) as any, {
  pivotTable: 'reservas',
  pivotColumns: ['data_hora_inicio', 'data_hora_fim', 'status', 'pagamento_efetuado'],
  })
  declare salas: ManyToMany<typeof Sala>

  @hasMany(() => import('#models/atendimento').then((m) => m.default) as any)
  declare atendimentos: HasMany<typeof Atendimento>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
