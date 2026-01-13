import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Funcao from '#models/funcao'
import Especializacao from '#models/especializacao'

export default class extends BaseSeeder {
  public async run() {
    // 1. CRIA AS FUNÇÕES (Categorias)
    // Usamos updateOrCreate para não duplicar se rodar duas vezes
    const medico = await Funcao.updateOrCreate({ id: 1 }, { id: 1, nome: 'Médico' })
    const dentista = await Funcao.updateOrCreate({ id: 2 }, { id: 2, nome: 'Dentista' })
    const enfermeiro = await Funcao.updateOrCreate({ id: 3 }, { id: 3, nome: 'Enfermeiro' })

    // 2. CRIA AS ESPECIALIZAÇÕES (Opcional, se sua tabela existir)
    await Especializacao.createMany([
        { nome: 'Clínico Geral' },
        { nome: 'Cardiologista' },
        { nome: 'Pediatra' },
        { nome: 'Ortodontista' }, // Dentista
        { nome: 'Odontopediatra' } // Dentista
    ])
  }
}