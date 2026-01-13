import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Transacao extends BaseModel {
  public static table = 'transacoes'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' }) // Mapeamento explicito é bom
  declare userId: number

  // Campos Opcionais Avançados
  @column()
  declare entidadeOrigem: string | null

  @column()
  declare entidadeId: number | null

  @column()
  declare destinatarioTipo: string | null

  @column()
  declare destinatarioId: number | null

  @column()
  declare valor: number

  @column()
  declare tipo: 'ENTRADA' | 'SAIDA'

  @column()
  declare finalidade: string
  
  // === ADICIONE ESSES ===
  @column()
  declare descricao: string | null
  
  @column({ columnName: 'forma_pagamento' })
  declare formaPagamento: string | null

  @column()
  declare status: 'PENDENTE' | 'CONCLUIDA' | 'FALHOU' | 'ESTORNADA'

  @column()
  declare referenciaExterna: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}