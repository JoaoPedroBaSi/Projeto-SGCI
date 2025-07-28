import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Funcao from '#models/funcao'
import Especializacao from '#models/especializacao'
import Disponibilidade from '#models/disponibilidade'
import Sala from '#models/sala'
import Atendimento from '#models/atendimento'
import { Genero } from '#models/cliente'

export default class Profissional extends BaseModel {
  public static table = 'profissionais'

  //atributos
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare funcaoId: number

  @column()
  declare nome: string

  @column()
  declare genero: Genero

  @column()
  declare idade: number

  @column()
  declare cpf: string

  @column()
  declare email: string

  @column()
  declare senha: string

  //relacionamentos
  @belongsTo(() => Funcao)
  declare funcao: BelongsTo<typeof Funcao>

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
