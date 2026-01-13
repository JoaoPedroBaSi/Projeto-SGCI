import vine from '@vinejs/vine'

const htmlDateTimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

// Validator para o profissional solicitar uma sala
export const storeReservaValidator = vine.compile(
  vine.object({
    // salaId deve ser um número e existir na tabela 'salas'
    salaId: vine.number().exists(async (db, value) => {
      const sala = await db.from('salas').where('id', value).first()
      return !!sala
    }),
    dataHoraInicio: vine.string().regex(htmlDateTimeLocalRegex),
    dataHoraFim: vine.string().regex(htmlDateTimeLocalRegex),
  })
)

// Validator para o admin aprovar ou rejeitar uma sala
export const updateReservaStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['APROVADA', 'REJEITADO']),
  })
)
