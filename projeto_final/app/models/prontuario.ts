import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Atendimento from '#models/atendimento'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'

export default class Prontuario extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'atendimento_id' }) // <-- Mapeamento explícito
  declare atendimentoId: number

  @column({ columnName: 'cliente_id' }) // <-- Mapeamento explícito
  declare clienteId: number

  @column({ columnName: 'profissional_id' }) // <-- Mapeamento explícito
  declare profissionalId: number

  @column()
  declare diagnostico: string

  @column({ columnName: 'medicamentos_prescritos' }) // <-- Mapeamento explícito
  declare medicamentosPrescritos: string

  @column()
  declare recomendacoes: string

  @column({ columnName: 'caminho_anexo' }) // <-- Mapeamento explícito
  declare caminhoAnexo: string

  @column()
  declare descricao: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Atendimento)
  declare public atendimento: BelongsTo<typeof Atendimento>

  @belongsTo(() => Cliente)
  declare public cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => Profissional)
  declare public profissional: BelongsTo<typeof Profissional>
}
