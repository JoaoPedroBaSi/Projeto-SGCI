import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Inventario from '#models/inventario'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    // CORREÇÃO: Pegando o total de forma mais segura para o TS
    const resultado = await Inventario.query().count('* as total').firstOrFail()
    const total = Number(resultado.$extras.total)

    if (total > 0) {
      // CORREÇÃO: Usando console.log ou apenas retornando, já que 'this.command' costuma dar erro de tipagem
      console.info('O inventário já possui dados. Pulando seed.')
      return
    }

    await Inventario.createMany([
      {
        nome: 'LUVA LÁTEX (TAM. M)',
        tipo: 'EQUIPAMENTO', 
        unidadeMedida: 'CAIXA 100UN',
        lote: 'L-2901',
        quantidade: 5, 
        pontoReposicao: 20,
        fornecedor: 'LUVAS BRASIL',
        validade: DateTime.now().plus({ years: 2 }) 
      },
      {
        nome: 'LUVA LÁTEX (TAM. G)',
        tipo: 'EQUIPAMENTO',
        unidadeMedida: 'CAIXA 100UN',
        lote: 'L-2902',
        quantidade: 50,
        pontoReposicao: 20,
        fornecedor: 'LUVAS BRASIL',
        validade: DateTime.now().plus({ years: 2 })
      },
      {
        nome: 'MÁSCARA CIRÚRGICA N95',
        tipo: 'EQUIPAMENTO',
        unidadeMedida: 'UNIDADE',
        lote: 'M-1102',
        quantidade: 12, 
        pontoReposicao: 15,
        fornecedor: '3M',
        validade: DateTime.now().plus({ years: 5 }) 
      },
      {
        nome: 'SERINGA 5ML DESCARTÁVEL',
        tipo: 'EQUIPAMENTO',
        unidadeMedida: 'PACOTE 50UN',
        lote: 'S-8821',
        quantidade: 4, 
        pontoReposicao: 10,
        fornecedor: 'BD',
        validade: DateTime.now().plus({ months: 8 })
      },
      {
        nome: 'PAPEL LENÇOL HOSPITALAR',
        tipo: 'EQUIPAMENTO',
        unidadeMedida: 'ROLO 50M',
        lote: 'P-3321',
        quantidade: 8, 
        pontoReposicao: 10,
        fornecedor: 'MELHORAMENTOS',
        // Validade opcional removida aqui para seguir seu modelo original
      },
      {
        nome: 'DIPIRONA SÓDICA 500MG/ML',
        tipo: 'MEDICAMENTO',
        unidadeMedida: 'FRASCO 10ML',
        lote: 'DP-2023',
        quantidade: 100,
        pontoReposicao: 20,
        fornecedor: 'MEDLEY',
        validade: DateTime.now().plus({ months: 1 }) 
      },
      {
        nome: 'PARACETAMOL 750MG',
        tipo: 'MEDICAMENTO',
        unidadeMedida: 'CAIXA 20CP',
        lote: 'PA-990',
        quantidade: 30,
        pontoReposicao: 10,
        fornecedor: 'EMS',
        validade: DateTime.now().plus({ months: 12 })
      },
      {
        nome: 'SORO FISIOLÓGICO 0,9%',
        tipo: 'MEDICAMENTO',
        unidadeMedida: 'FRASCO 500ML',
        lote: 'SF-500',
        quantidade: 15,
        pontoReposicao: 20,
        fornecedor: 'EUROFARMA',
        validade: DateTime.now().plus({ months: 6 })
      },
      {
        nome: 'ÁLCOOL 70%',
        tipo: 'MATERIAL_LIMPEZA',
        unidadeMedida: 'FRASCO 1L',
        lote: 'AL-7070',
        quantidade: 2, 
        pontoReposicao: 10,
        fornecedor: 'TUPI',
        validade: DateTime.now().plus({ years: 1 })
      },
      {
        nome: 'CLOREXIDINA DEGERMANTE',
        tipo: 'MATERIAL_LIMPEZA',
        unidadeMedida: 'FRASCO 100ML',
        lote: 'C-1234',
        quantidade: 25,
        pontoReposicao: 5,
        fornecedor: 'RIOQUIMICA',
        validade: DateTime.now().plus({ months: 18 })
      }
    ])
  }
}