import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import type Profissional from '#models/profissional'

export default class Sala extends BaseModel {
  //atributos
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENÇÃO'

  @column()
  declare precoAluguel: number

  @column()
  declare capacidadePacientes: number

  // No Model é redundante (desnecessário) a coluna ocupado. O status é quem diz se a sala está 'DISPONIVEL' ou 'OCUPADA'.
  // @column()
  // declare ocupado: boolean

  //relacionamentos
  // Usamos .then() para pegar o conteúdo do arquivo
  // Usamos 'as any' para o TypeScript aceitar a Promessa sem reclamar
  @manyToMany(() => import('#models/profissional').then((m) => m.default) as any, {
  pivotTable: 'reservas',
  pivotColumns: ['data_hora_inicio', 'data_hora_fim', 'status', 'pagamento_efetuado'],
})
declare profissionais: ManyToMany<typeof Profissional>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
