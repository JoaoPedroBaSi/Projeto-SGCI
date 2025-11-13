import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Funcao from '#models/funcao'
import Especializacao from '#models/especializacao'
import Disponibilidade from '#models/disponibilidade'
import Sala from '#models/sala'
import Atendimento from '#models/atendimento'
import User from '#models/user'
//import { Genero } from '#models/cliente'
//Retiramos { Genero } pois entrou em conflito com o validator.

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
