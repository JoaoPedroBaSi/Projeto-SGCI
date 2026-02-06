import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Funcao from '#models/funcao'
import Especializacao from '#models/especializacao'

export default class extends BaseSeeder {
  public async run() {
    // 1. CRIA AS FUNÇÕES (Categorias)
    await Funcao.updateOrCreateMany('nome', [
      { nome: 'MEDICO' },
      { nome: 'DENTISTA' },
      { nome: 'TERAPEUTA' },
      { nome: 'PSICOLOGO' },
      { nome: 'UROLOGISTA' },
      { nome: 'GINECOLOGISTA' },
      { nome: 'NUTRICIONISTA' }
    ])

    // 2. CRIA AS ESPECIALIZAÇÕES
    await Especializacao.updateOrCreateMany('nome', [
      { nome: 'Clínico Geral' },
      { nome: 'Cardiologista' },
      { nome: 'Pediatra' },
      { nome: 'Ortodontista' },
      { nome: 'Odontopediatra' },
      { nome: 'Psicoterapia' },
      { nome: 'Nutrição Esportiva' },
      { nome: 'Fisioterapia' },
      { nome: 'Dermatologia' }
    ])
  }
}