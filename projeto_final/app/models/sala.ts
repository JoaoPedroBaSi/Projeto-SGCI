import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type Profissional from '#models/profissional'

export default class Sala extends BaseModel {
  //atributos
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profissionalId: number

  @column()
  declare nome: string

  @column()
  declare status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENÇÃO'

  @column()
  declare precoAluguel: number

  @column.date()
  declare dataDisponibilidade: DateTime

  @column()
  declare capacidadePacientes: number

  // No Model é redundante (desnecessário) a coluna ocupado. O status é quem diz se a sala está 'DISPONIVEL' ou 'OCUPADA'.
  // @column()
  // declare ocupado: boolean

  //relacionamentos
// 2. AQUI ESTÁ A CORREÇÃO MÁGICA:
  // Usamos .then() para pegar o conteúdo do arquivo
  // Usamos 'as any' para o TypeScript aceitar a Promessa sem reclamar
  @belongsTo(() => import('#models/profissional').then((module) => module.default)as any)
  declare profissional: BelongsTo<typeof Profissional>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
