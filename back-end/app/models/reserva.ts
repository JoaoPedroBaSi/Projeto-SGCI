import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

// 1. IMPORTAÇÃO PADRÃO (Isso resolve o erro do $getColumn)
import Sala from '#models/sala'
import Profissional from '#models/profissional'

export default class Reserva extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'sala_id' })
  declare salaId: number

  @column({ columnName: 'profissional_id' })
  declare profissionalId: number | null

  @column.dateTime({ columnName: 'data_hora_inicio' })
  declare dataHoraInicio: DateTime

  @column.dateTime({ columnName: 'data_hora_fim' })
  declare dataHoraFim: DateTime

  @column({ columnName: 'valor_total' })
  declare valorTotal: number

  // Garanta que o status aqui bate com o do Controller (REJEITADO com O)
  @column()
  declare status: 'PENDENTE' | 'APROVADA' | 'REJEITADO'

  @column({ columnName: 'pagamento_efetuado' })
  declare pagamentoEfetuado: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // --- RELACIONAMENTOS CORRIGIDOS ---
  
  // 2. Passamos a classe direto, sem .then() e sem as any
  @belongsTo(() => Sala)
  declare sala: BelongsTo<typeof Sala>

  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>
}