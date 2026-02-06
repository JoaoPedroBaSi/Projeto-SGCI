import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'

export default class Sala extends BaseModel {
  public static table = 'salas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENÇÃO'

  @column({ columnName: 'capacidade_pacientes' })
  declare capacidadePacientes: number

  @column({ columnName: 'preco_aluguel' })
  declare precoAluguel: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  
  @manyToMany(() => Profissional, {
    pivotTable: 'reservas',
    pivotColumns: ['data_hora_inicio', 'data_hora_fim', 'status', 'pagamento_efetuado'],
  })
  declare profissionais: ManyToMany<typeof Profissional>
}