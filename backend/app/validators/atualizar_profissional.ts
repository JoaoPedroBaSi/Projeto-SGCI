import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const atualizarProfissionalValidator = vine.compile(
  vine.object({
    nome: vine.string().minLength(3).optional(),
    telefone: vine.string().optional(),
    dataNascimento: vine.date().transform((value) => {
      return DateTime.fromJSDate(value)
    }).optional(),
    // Campos específicos que SÓ um PROFISSIONAL pode alterar
    biografia: vine.string().maxLength(500).optional(),
    foto_perfil_url: vine.string().url().optional(),
    registroConselho: vine.string().optional(),
  })
)