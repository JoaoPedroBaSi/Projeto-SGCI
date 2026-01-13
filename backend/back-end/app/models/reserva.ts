import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
<<<<<<<< HEAD:back-end/app/models/reserva.ts

// 1. IMPORTAÇÃO PADRÃO (Isso resolve o erro do $getColumn)
import Sala from '#models/sala'
import Profissional from '#models/profissional'
========
import Sala from '#models/sala'
import Profissional from '#models/profissional'
import Transacao from '#models/transacao'
>>>>>>>> main:backend/app/models/reserva.ts

export default class Reserva extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'sala_id' })
  declare salaId: number

  @column({ columnName: 'profissional_id' })
  declare profissionalId: number | null

<<<<<<<< HEAD:back-end/app/models/reserva.ts
  @column.dateTime({ columnName: 'data_hora_inicio' })
========
  @column()
  declare transacaoId: number | null

  @column()
>>>>>>>> main:backend/app/models/reserva.ts
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

  @column()
  declare formaPagamento: 'PIX' | 'CREDITO' | 'DEBITO' | 'PENDENTE'

  @column()
  declare valorTotal: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

<<<<<<<< HEAD:back-end/app/models/reserva.ts
  // --- RELACIONAMENTOS CORRIGIDOS ---
  
  // 2. Passamos a classe direto, sem .then() e sem as any
  @belongsTo(() => Sala)
  declare sala: BelongsTo<typeof Sala>

  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>
}
========
  @belongsTo(() => Sala)
  declare public sala: BelongsTo<typeof Sala>

  @belongsTo(() => Profissional)
  declare public profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Transacao)
  declare public transacao: BelongsTo<typeof Transacao>
}
>>>>>>>> main:backend/app/models/reserva.ts
