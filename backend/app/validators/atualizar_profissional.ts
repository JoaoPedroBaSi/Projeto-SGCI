import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const atualizarProfissionalValidator = vine.compile(
  vine.object({
    nome: vine.string().minLength(3).trim().optional(),
    
    // Limites de segurança para telefone
    telefone: vine.string().minLength(10).maxLength(15).trim().optional(),
    
    // Garante formato ISO e transforma para Luxon (já pronto para o banco)
    dataNascimento: vine.date({ formats: ['YYYY-MM-DD'] })
      .transform((value) => DateTime.fromJSDate(value))
      .optional(),

    // Campos específicos que SÓ um PROFISSIONAL pode alterar
    biografia: vine.string().maxLength(500).trim().optional(),
    
    // MUDANÇA IMPORTANTE: Use camelCase aqui para bater com o Model Profissional.ts
    fotoPerfilUrl: vine.string().url().optional(),
    
    registroConselho: vine.string().trim().optional(),
  })
)