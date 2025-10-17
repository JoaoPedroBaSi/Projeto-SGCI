/* eslint-disable prettier/prettier */
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'
import Cliente from '#models/cliente'
import Sala from '#models/sala'

//export enum FormaPagamento {
  //DINHEIRO = 'DINHEIRO',
  //PIX = 'PIX',
  //CREDITO = 'CREDITO',
  //DEBITO = 'DEBITO',
//}

export default class Atendimento extends BaseModel {
  //atributos
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profissionalId: number

  @column()
  declare clienteId: number

  @column()
  declare salaId: number

  @column()
  declare horarioComeco: string

  @column()
  declare horarioTermino: string

  //Coluna dia para comparar com a disponibilidade. No mesmo formato [1-segunda], [2-terça]...
  @column()
  declare dia: number

  @column()
  declare data: string

  @column()
  declare observacoes: string

  @column()
  declare valor: number

  @column()
  declare formaPagamento: 'PENDENTE' |'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO'

  @column()
  declare status: 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO'

  //relacionamentos
  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => Sala)
  declare sala: BelongsTo<typeof Sala>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
