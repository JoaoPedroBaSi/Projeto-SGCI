import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Funcao from '#models/funcao'
import Especializacao from '#models/especializacao'
import Disponibilidade from '#models/disponibilidade'
import Sala from '#models/sala'
import Atendimento from '#models/atendimento'

export default class Profissional extends BaseModel {
  public static table = 'profissionais'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'funcao_id' })
  declare funcaoId: number

  @column()
  declare nome: string

  @column()
  declare genero: 'MASCULINO' | 'FEMININO' | 'OUTRO' // Adicionado OUTRO para consistência

  @column.date()
  declare dataNascimento: DateTime 

  @column()
  declare cpf: string

  @column()
  declare telefone: string

  @column()
  declare email: string 

  @column()
  declare senha: string

  @column({ columnName: 'foto_perfil_url' })
  declare fotoPerfilUrl: string | null

  @column()
  declare biografia: string | null

  @column({ columnName: 'registro_conselho' })
  declare registroConselho: string | null

  @column({ columnName: 'conselho_uf' })
  declare conselhoUf: string | null

  @column({ columnName: 'comprovante_credenciamento_url' })
  declare comprovanteCredenciamentoUrl: string | null

  @column()
  declare status: 'pendente' | 'aprovado' | 'rejeitado' | null

  @column({ columnName: 'observacoes_admin' })
  declare observacoesAdmin: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime


  @belongsTo(() => Funcao)
  declare funcao: BelongsTo<typeof Funcao>

  @belongsTo(() => User, {
    foreignKey: 'id', 
    localKey: 'id'
  })
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Especializacao, {
    pivotTable: 'especializacoes_profissionais',
  })
  declare especializacoes: ManyToMany<typeof Especializacao>

  @hasMany(() => Disponibilidade)
  declare disponibilidades: HasMany<typeof Disponibilidade>

  @manyToMany(() => Sala, {
    pivotTable: 'reservas',
    pivotColumns: ['data_hora_inicio', 'data_hora_fim', 'status', 'pagamento_efetuado'],
  })
  declare salas: ManyToMany<typeof Sala>

  @hasMany(() => Atendimento)
  declare atendimentos: HasMany<typeof Atendimento>
}