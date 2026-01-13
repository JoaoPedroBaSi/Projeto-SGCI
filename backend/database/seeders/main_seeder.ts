import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Funcao from '#models/funcao'
import Especializacao from '#models/especializacao'

export default class extends BaseSeeder {
  public async run() {
    // 1. CRIA AS FUNÇÕES (Categorias)
    // IMPORTANTE: Os nomes devem ser EXATAMENTE iguais aos definidos no ENUM da migration (Maiúsculos e sem acento)
    
    await Funcao.updateOrCreate({ nome: 'MEDICO' }, { nome: 'MEDICO' })
    await Funcao.updateOrCreate({ nome: 'DENTISTA' }, { nome: 'DENTISTA' })
    await Funcao.updateOrCreate({ nome: 'TERAPEUTA' }, { nome: 'TERAPEUTA' }) 
    await Funcao.updateOrCreate({ nome: 'PSICOLOGO' }, { nome: 'PSICOLOGO' })
    await Funcao.updateOrCreate({ nome: 'UROLOGISTA' }, { nome: 'UROLOGISTA' })
    await Funcao.updateOrCreate({ nome: 'GINECOLOGISTA' }, { nome: 'GINECOLOGISTA' })
    await Funcao.updateOrCreate({ nome: 'NUTRICIONISTA' }, { nome: 'NUTRICIONISTA' })

    // Obs: "Enfermeiro" foi removido pois não estava na sua lista de permitidos no banco.

    // 2. CRIA AS ESPECIALIZAÇÕES
    // Usamos updateOrCreateMany para não dar erro se você rodar o seed duas vezes
    await Especializacao.updateOrCreateMany('nome', [
        { nome: 'Clínico Geral' },
        { nome: 'Cardiologista' },
        { nome: 'Pediatra' },
        { nome: 'Ortodontista' },
        { nome: 'Odontopediatra' },
        { nome: 'Psicoterapia' },
        { nome: 'Nutrição Esportiva' }
    ])
  }
}