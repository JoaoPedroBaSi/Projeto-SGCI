import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

import Atendimento from '#models/atendimento'
import Disponibilidade from '#models/disponibilidade'
import Sala from '#models/sala'
import User from '#models/user'
import { TransacaoService } from './transacao_service.js'

@inject()
export class AtendimentoService {
  constructor(protected transacaoService: TransacaoService) {}

  /**
   * CORREÇÃO: Adicionado o 4º argumento 'usuarioLogado' para bater com o Controller.
   * Note que o parâmetro é opcional (?) para evitar quebrar outras partes do sistema.
   */
  public async criarAtendimento(
    dados: { profissionalId: number; clienteId: number; observacoes?: string; formaPagamento: string },
    dataHoraInicioLuxon: DateTime,
    disponibilidade: Disponibilidade,
    usuarioLogado?: User // <--- Adicionado aqui
  ) {
    await db.transaction(async (trx) => {
      
      const atendimentoData = {
        profissionalId: dados.profissionalId,
        clienteId: dados.clienteId,
        disponibilidadeId: disponibilidade.id,
        observacoes: dados.observacoes,
        formaPagamento: dados.formaPagamento as 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO', 
        dataHoraInicio: dataHoraInicioLuxon,
        dataHoraFim: disponibilidade.dataHoraFim,
        status: 'PENDENTE' as const, 
        statusPagamento: 'PENDENTE' as const
      }

      disponibilidade.status = 'RESERVADO'
      disponibilidade.useTransaction(trx)
      await disponibilidade.save()

      await Atendimento.create(atendimentoData, { client: trx })
      
      // Se precisar registrar quem criou o atendimento no log, você usaria o 'usuarioLogado' aqui.
    })
  }

  public async atualizarAtendimento(
    dados: any, 
    atendimento: Atendimento, 
    usuarioLogado: User
  ) {
    let disponibilidadeSlotNovo: Disponibilidade | null = null
    const dadosParaUpdate: any = { ...dados }

    const novaDataInicio = dados.dataHoraInicio ? (dados.dataHoraInicio as DateTime) : null
    const horarioMudou = novaDataInicio && novaDataInicio.toSeconds() !== atendimento.dataHoraInicio.toSeconds()

    if (horarioMudou && novaDataInicio) {
      
      disponibilidadeSlotNovo = await this.temDisponibilidade(
        atendimento.profissionalId,
        novaDataInicio
      )

      if (!disponibilidadeSlotNovo) {
        throw new Error('O novo horário solicitado não existe na agenda do profissional.')
      }
      
      if (disponibilidadeSlotNovo.status !== 'LIVRE') {
        throw new Error('O novo horário solicitado não está livre.')
      }

      const salaReservada = await Sala.query()
        .whereHas('profissionais', (query) => { 
          query.where('id', atendimento.profissionalId)
        })
        .first()

      if (!salaReservada) {
         const salaDireta = await Sala.query().where('id', atendimento.salaId || 0).first()
         if(!salaDireta) throw new Error('Não foi possível alocar uma sala para este profissional.')
         dadosParaUpdate.salaId = salaDireta.id
      } else {
         dadosParaUpdate.salaId = salaReservada.id
      }

      dadosParaUpdate.dataHoraInicio = novaDataInicio
      dadosParaUpdate.dataHoraFim = disponibilidadeSlotNovo.dataHoraFim
      dadosParaUpdate.disponibilidadeId = disponibilidadeSlotNovo.id
    }

    await db.transaction(async (trx) => {
      
      if (horarioMudou && disponibilidadeSlotNovo) {
        if (atendimento.disponibilidadeId) {
            const slotAntigo = await Disponibilidade.find(atendimento.disponibilidadeId, { client: trx })
            if (slotAntigo && slotAntigo.status === 'RESERVADO') {
                slotAntigo.status = 'LIVRE'
                slotAntigo.useTransaction(trx)
                await slotAntigo.save()
            }
        }

        disponibilidadeSlotNovo.status = 'RESERVADO'
        disponibilidadeSlotNovo.useTransaction(trx)
        await disponibilidadeSlotNovo.save()
      }

      if (dadosParaUpdate.status) {
         dadosParaUpdate.status = dadosParaUpdate.status as 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO'
      }

      atendimento.merge(dadosParaUpdate)
      atendimento.useTransaction(trx)
      await atendimento.save()
    })
  }

  public async temDisponibilidade(
    profissionalId: number,
    dataHoraInicio: DateTime
  ): Promise<Disponibilidade | null> {
    
    if (!dataHoraInicio.isValid) return null

    return await Disponibilidade.query()
      .where('profissionalId', profissionalId)
      .where('dataHoraInicio', dataHoraInicio.toSQL()!) 
      .first()
  }

  public async temConflito(
    profissionalId: number,
    dataHoraInicio: DateTime,
    dataHoraFim: DateTime,
    ignorarAtendimentoId?: number
  ) {
    if (!dataHoraInicio.isValid || !dataHoraFim.isValid) return null 

    return await Atendimento.query()
      .where('profissionalId', profissionalId)
      .where('status', '!=', 'CANCELADO') 
      .if(ignorarAtendimentoId, (query) => {
        query.whereNot('id', ignorarAtendimentoId!)
      })
      .where((query) => {
        query
          .where('dataHoraInicio', '<', dataHoraFim.toSQL()!)
          .andWhere('dataHoraFim', '>', dataHoraInicio.toSQL()!)
      })
      .first()
  }
}