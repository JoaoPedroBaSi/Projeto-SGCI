import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'

export default class Sala extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENÇÃO'

  // Mapeamento correto com o banco (snake_case -> camelCase)
  @column({ columnName: 'capacidade_pacientes' })
  declare capacidadePacientes: number

  @column({ columnName: 'preco_aluguel' })
  declare precoAluguel: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ===========================================
  // 🔗 RELACIONAMENTOS
  // ===========================================

  @manyToMany(() => Profissional, {
    pivotTable: 'reservas',
    pivotColumns: ['data_hora_inicio', 'data_hora_fim', 'status', 'pagamento_efetuado'],
  })
  declare profissionais: ManyToMany<typeof Profissional>
}