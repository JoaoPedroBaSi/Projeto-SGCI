import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Atendimento from '#models/atendimento'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'
import Parceria from '#models/parceria'

export default class Prontuario extends BaseModel {
  public static table = 'prontuarios'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'atendimento_id' })
  declare atendimentoId: number

  @column({ columnName: 'cliente_id' })
  declare clienteId: number | null

  @column({ columnName: 'profissional_id' })
  declare profissionalId: number

  @column({ columnName: 'parceria_id' })
  declare parceriaId: number | null

  @column()
  declare diagnostico: string

  @column({ columnName: 'medicamentos_prescritos' })
  declare medicamentosPrescritos: string | null

  @column()
  declare recomendacoes: string | null

  @column({ columnName: 'caminho_anexo' })
  declare caminhoAnexo: string | null

  @column()
  declare descricao: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Atendimento)
  declare atendimento: BelongsTo<typeof Atendimento>

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Parceria)
  declare parceria: BelongsTo<typeof Parceria>
}