import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'

export default class Sala extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Mapeamento: Coluna do Banco 'profissional_id' -> Variável 'profissionalId'
  @column({ columnName: 'profissional_id' })
  declare profissionalId: number | null

  @column()
  declare nome: string

  @column()
  declare status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENÇÃO'

  // Mapeamento: Coluna do Banco 'preco_aluguel' -> Variável 'precoAluguel'
  @column({ columnName: 'preco_aluguel' })
  declare precoAluguel: number

  // Mapeamento: Coluna do Banco 'data_disponibilidade' -> Variável 'dataDisponibilidade'
  @column.dateTime({ columnName: 'data_disponibilidade' })
  declare dataDisponibilidade: DateTime

  // Mapeamento: Coluna do Banco 'capacidade_pacientes' -> Variável 'capacidadePacientes'
  @column({ columnName: 'capacidade_pacientes' })
  declare capacidadePacientes: number

  // Relacionamento (Versão Padrão Limpa)
  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}