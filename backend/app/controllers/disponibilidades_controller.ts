/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Disponibilidade from '#models/disponibilidade'
import { storeDisponibilidadeValidator } from '#validators/validator_disponibilidade'
import { updateDisponibilidadeValidator } from '#validators/validator_disponibilidade'
import { DateTime } from 'luxon'

export default class DisponibilidadesController {
    //Lista todas as disponibilidades
    public async index({}: HttpContext){
        return await Disponibilidade.all()
    }
    //Lista um registro de disponibilidade especificado pelo id
    public async show({params}: HttpContext){
        return await Disponibilidade.query().where('id', params.id)
    }
    //Cria uma nova disponibilidade
public async store({ request, response }: HttpContext) {
  const DURACAO_SLOT_MINUTOS = 30

  try {
    const dados = await request.validateUsing(storeDisponibilidadeValidator)

    const inicioLimpo = dados.data_hora_inicio.substring(0, 16)
    const fimLimpo = dados.data_hora_fim.substring(0, 16)

    const inicioSolicitado = DateTime.fromISO(inicioLimpo, { zone: 'America/Sao_Paulo' })
    const fimSolicitado = DateTime.fromISO(fimLimpo, { zone: 'America/Sao_Paulo' })

    const agoraBrasil = DateTime.now().setZone('America/Sao_Paulo')

    const limiteAbertura = inicioSolicitado.set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
    const limiteFechamento = inicioSolicitado.set({ hour: 21, minute: 0, second: 0, millisecond: 0 })

    if (inicioSolicitado < limiteAbertura || fimSolicitado > limiteFechamento) {
      return response.status(400).send({
        message: `A clínica só funciona das 07:00 às 21:00. Você tentou: ${inicioSolicitado.toFormat('HH:mm')} até ${fimSolicitado.toFormat('HH:mm')}`
      })
    }

    if (inicioSolicitado <= agoraBrasil) {
      return response.status(400).send({ message: 'Não é possível criar horários no passado.' })
    }

    const sobreposicao = await Disponibilidade.query()
      .where('profissional_id', dados.profissional_id)
      .where((q) => {
        // Importante: toSQL() aqui garante a comparação correta no banco
        q.where('data_hora_inicio', '<', fimSolicitado.toSQL()!)
         .andWhere('data_hora_fim', '>', inicioSolicitado.toSQL()!)
      })
      .first()

    if (sobreposicao) {
      return response.status(400).send({ message: 'Já existem horários neste intervalo.' })
    }

    const novosSlots: any[] = []
    let ponteiroSlot = inicioSolicitado

    while (ponteiroSlot < fimSolicitado) {
      const fimSlot = ponteiroSlot.plus({ minutes: DURACAO_SLOT_MINUTOS })
      if (fimSlot > fimSolicitado) break

      novosSlots.push({
        profissionalId: dados.profissional_id,
        dataHoraInicio: ponteiroSlot.toSQL({ includeOffset: false })!,
        dataHoraFim: fimSlot.toSQL({ includeOffset: false })!,
        status: 'LIVRE' as const,
      })
      ponteiroSlot = fimSlot
    }

    await Disponibilidade.createMany(novosSlots)
    return response.created({ message: 'Disponibilidade criada com sucesso!' })

  } catch (error: any) {
    return response.status(error.status || 500).send({ message: error.message })
  }
}
public async update({ request, response }: HttpContext) { // Incluindo os argumentos
  const PRIMEIRO_ATENDIMENTO = '07:00:00'
  const ULTIMO_ATENDIMENTO = '21:00:00'
  const DURACAO_SLOT_MINUTOS = 30

  try{
      //O findOrFail só seria útil se estivesse editando o registro principal de disponibilidade
      //const disponibilidade = await Disponibilidade.findOrFail(params.id)

      const dados = await request.validateUsing(updateDisponibilidadeValidator)

      //Certifique-se de que 'profissional_id' está nos 'dados' ou no 'params'

      if (!dados.data_hora_inicio || !dados.data_hora_fim || !dados.profissional_id){
          throw new Error('Dados incompletos para atualização.')
      }

      let inicioSlot = DateTime.fromISO(dados.data_hora_inicio, { zone: 'utc' })
      const dataHoraFimTotal =  DateTime.fromISO(dados.data_hora_fim, { zone: 'utc' })

      const horarioUltrapassado = inicioSlot <= DateTime.now()
      if (horarioUltrapassado){
          throw new Error('O horário informado é ultrapassado.')
      }

      const profissionalId = dados.profissional_id // Definindo aqui para uso no Map/Query

      //Verificação de Horário de Funcionamento
      const dataHoraInicioFormatado = inicioSlot.toFormat('HH:mm')
      const dataHoraFimFormatado = dataHoraFimTotal.toFormat('HH:mm')
      const foraDoHorarioFuncionamento = dataHoraInicioFormatado < PRIMEIRO_ATENDIMENTO || dataHoraFimFormatado > ULTIMO_ATENDIMENTO

      if (foraDoHorarioFuncionamento){
          throw new Error('O horário está fora do horário de funcionamento da clínica.')
      }

      //Inicialização do array de slots gerados
      const novosSlots = [] as {
          profissionalId: number,
          dataHoraInicio: DateTime,
          dataHoraFim: DateTime,
          status: 'LIVRE' | 'OCUPADO' | 'BLOQUEADO'
      }[]

      //Horário de almoço, no qual não é possível ter disponibilidade
      const ALMOCO_INICIO = inicioSlot.set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
      const ALMOCO_FIM = inicioSlot.set({ hour: 13, minute: 0, second: 0, millisecond: 0 })

      //Percorre do começo ao fim do horário de atendimento informado
      while (inicioSlot < dataHoraFimTotal) {

          const fimSlot = inicioSlot.plus({ minutes: DURACAO_SLOT_MINUTOS })

          //Lógica de Almoço (Pular o tempo)
          const estaEmHorarioAlmoco = (inicioSlot >= ALMOCO_INICIO && inicioSlot < ALMOCO_FIM)
          if (estaEmHorarioAlmoco) {
              inicioSlot = ALMOCO_FIM;
              continue;
          }

          //Checagem de Ultrapassagem
          if (fimSlot > dataHoraFimTotal) {
              break
          }

          //Validade
          if (!inicioSlot.isValid || !fimSlot.isValid) {
              throw new Error('Erro interno: Uma data de slot gerada é inválida.')
          }

          //ADICIONAR O PUSH AO ARRAY
          novosSlots.push({
              profissionalId: profissionalId,
              dataHoraInicio: inicioSlot,
              dataHoraFim: fimSlot,
              status: 'LIVRE',
          })

          //Avança para o próximo slot
          inicioSlot = fimSlot
      }

      if (novosSlots.length > 0) {

          //A data alvo para a exclusão (o dia inteiro)
          const dataAlvo = inicioSlot.startOf('day').toSQLDate()

          //Database.transaction e uso correto do DisponibilidadeSlot**
      await db.transaction(async (trx: TransactionClientContract) => {
          const slotsExistentes = await Disponibilidade.query({ client: trx })
              .where('profissional_id', profissionalId)
              .where(db.rawQuery(`DATE(data_hora_inicio) = ?`, [dataAlvo]))
              .select('data_hora_inicio', 'status')

          //Cria um Map para consulta rápida de slots Ocupados
          const slotsOcupadosMap = new Map(
              slotsExistentes
                  .filter(slot => slot.status === 'OCUPADO')
                  .map(slot => [slot.dataHoraInicio.toSQL(), slot.status])
          )

          //Cria o payload de sincronização final
          const payloadFinal = novosSlots.map(novoSlot => {
              const dataInicioSQL = novoSlot.dataHoraInicio.toSQL()

              const jaOcupado = slotsOcupadosMap.has(dataInicioSQL)

              let slotData: any = {
                  profissionalId: novoSlot.profissionalId,
                  dataHoraInicio: novoSlot.dataHoraInicio,
                  dataHoraFim: novoSlot.dataHoraFim,
                  status: novoSlot.status, // Por padrão, 'livre'
              }

              if (jaOcupado) {
                  // Se já estiver ocupado, removemos o 'status' para PROTEGÊ-LO.
                  delete slotData.status;
              }

              return slotData
          })

          // A. Sincronização (Merge / Upsert)
          await Disponibilidade.updateOrCreateMany(
              ['profissionalId', 'dataHoraInicio'],
              payloadFinal,
              { client: trx }
          )

          //Limpeza (Deletar slots que foram removidos)
          const datasIniciosNovosSlots: string[] = novosSlots.map(slot => slot.dataHoraInicio.toISO()!)

          await Disponibilidade.query({ client: trx })
              .where('profissional_id', profissionalId)
              .where(db.rawQuery(`DATE(data_hora_inicio) = ?`, [dataAlvo]))
              .whereNotIn('data_hora_inicio', datasIniciosNovosSlots)
              .whereNot('status', 'OCUPADO') // Protege slots agendados
              .delete()

        }) // Fim da Transação
    }

    return response.created({ message: 'Disponibilidade atualizada e slots sincronizados com sucesso!' })

  } catch (error){
    let message = 'Não foi possível atualizar os dados da disponibilidade. Tente novamente.'
    let status = 500

  if (error.message === 'Erro interno: Uma data de slot gerada é inválida.') {
    message = 'Uma falha interna aconteceu. Tente novamente'
    status = 400
    } else if (error.message === 'Dados incompletos para atualização.') {
            message = 'Dados incompletos para atualização. Tente novamente.'
    } else if (error.message === 'O horário informado é ultrapassado.') {
            message = 'O horário é ultrapassado. Tente novamente.'
    } else if (error.message === 'O horário está fora do horário de funcionamento da clínica.') {
            message = 'O horário está fora do horário de funcionamento. Tente novamente.'
    }

    console.error(error)
    return response.status(status).send({ message })
  }
}
}
