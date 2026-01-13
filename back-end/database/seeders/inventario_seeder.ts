import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Inventario from '#models/inventario'

export default class extends BaseSeeder {
  public async run() {
    // Verifica se já tem dados para não duplicar
    const total = await Inventario.query().count('* as total')
    if (BigInt(total[0].$extras.total) > 0) {
      console.log('O inventário já possui dados. Pulando seed.')
      return
    }

    await Inventario.createMany([
      // === EQUIPAMENTOS (EPIs e Descartáveis) ===
      {
        nome: 'Luva Látex (Tam. M)',
        tipo: 'EQUIPAMENTO', // Baseado no Enum da sua migration
        unidadeMedida: 'Caixa 100un',
        lote: 'L-2901',
        quantidade: 5, // Quantidade crítica (vai aparecer vermelho no front)
        pontoReposicao: 20,
        fornecedor: 'LuvasBrasil'
      },
      {
        nome: 'Luva Látex (Tam. G)',
        tipo: 'EQUIPAMENTO',
        unidadeMedida: 'Caixa 100un',
        lote: 'L-2902',
        quantidade: 50,
        pontoReposicao: 20,
        fornecedor: 'LuvasBrasil'
      },
      {
        nome: 'Máscara Cirúrgica N95',
        tipo: 'EQUIPAMENTO',
        unidadeMedida: 'Unidade',
        lote: 'M-1102',
        quantidade: 12, // Baixo estoque (amarelo)
        pontoReposicao: 15,
        fornecedor: '3M'
      },
      {
        nome: 'Seringa 5ml Descartável',
        tipo: 'EQUIPAMENTO',
        unidadeMedida: 'Pacote 50un',
        lote: 'S-8821',
        quantidade: 4, // Crítico
        pontoReposicao: 10,
        fornecedor: 'BD'
      },
      {
        nome: 'Papel Lençol Hospitalar',
        tipo: 'EQUIPAMENTO',
        unidadeMedida: 'Rolo 50m',
        lote: 'P-3321',
        quantidade: 8, // Baixo
        pontoReposicao: 10,
        fornecedor: 'Melhoramentos'
      },

      // === MEDICAMENTOS ===
      {
        nome: 'Dipirona Sódica 500mg/ml',
        tipo: 'MEDICAMENTO',
        unidadeMedida: 'Frasco 10ml',
        lote: 'DP-2023',
        quantidade: 100,
        pontoReposicao: 20,
        fornecedor: 'Medley'
      },
      {
        nome: 'Paracetamol 750mg',
        tipo: 'MEDICAMENTO',
        unidadeMedida: 'Caixa 20cp',
        lote: 'PA-990',
        quantidade: 30,
        pontoReposicao: 10,
        fornecedor: 'EMS'
      },
      {
        nome: 'Soro Fisiológico 0,9%',
        tipo: 'MEDICAMENTO',
        unidadeMedida: 'Frasco 500ml',
        lote: 'SF-500',
        quantidade: 15,
        pontoReposicao: 20,
        fornecedor: 'Eurofarma'
      },

      // === MATERIAL DE LIMPEZA / OUTROS ===
      {
        nome: 'Álcool 70%',
        tipo: 'MATERIAL_LIMPEZA',
        unidadeMedida: 'Frasco 1L',
        lote: 'AL-7070',
        quantidade: 2, // Crítico
        pontoReposicao: 10,
        fornecedor: 'Tupi'
      },
      {
        nome: 'Clorexidina Degermante',
        tipo: 'MATERIAL_LIMPEZA',
        unidadeMedida: 'Frasco 100ml',
        lote: 'C-1234',
        quantidade: 25,
        pontoReposicao: 5,
        fornecedor: 'Rioquimica'
      }
    ])
  }
}