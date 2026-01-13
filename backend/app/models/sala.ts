import { DateTime } from 'luxon'
<<<<<<<< HEAD:back-end/app/models/sala.ts
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Profissional from '#models/profissional'
========
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import type Profissional from '#models/profissional'
>>>>>>>> main:backend/app/models/sala.ts

export default class Sala extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

<<<<<<<< HEAD:back-end/app/models/sala.ts
  // Mapeamento: Coluna do Banco 'profissional_id' -> Variável 'profissionalId'
  @column({ columnName: 'profissional_id' })
  declare profissionalId: number | null

========
>>>>>>>> main:backend/app/models/sala.ts
  @column()
  declare nome: string

  @column()
  declare status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENÇÃO'

  // Mapeamento: Coluna do Banco 'preco_aluguel' -> Variável 'precoAluguel'
  @column({ columnName: 'preco_aluguel' })
  declare precoAluguel: number

<<<<<<<< HEAD:back-end/app/models/sala.ts
  // Mapeamento: Coluna do Banco 'data_disponibilidade' -> Variável 'dataDisponibilidade'
  @column.dateTime({ columnName: 'data_disponibilidade' })
  declare dataDisponibilidade: DateTime

  // Mapeamento: Coluna do Banco 'capacidade_pacientes' -> Variável 'capacidadePacientes'
  @column({ columnName: 'capacidade_pacientes' })
  declare capacidadePacientes: number

  // Relacionamento (Versão Padrão Limpa)
  @belongsTo(() => Profissional)
  declare profissional: BelongsTo<typeof Profissional>
========
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
>>>>>>>> main:backend/app/models/sala.ts

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}