import vine from '@vinejs/vine'

export const storeFuncaoValidator = vine.compile(
  vine.object({
    nome: vine.enum(['MEDICO', 'DENTISTA', 'TERAPEUTA', 'PSICOLOGO', 'UROLOGISTA', 'GINECOLOGISTA', 'NUTRICIONISTA']),
  })
)

export const updateFuncaoValidator = vine.compile(
  vine.object({
    nome: vine.enum(['MEDICO', 'DENTISTA', 'TERAPEUTA', 'PSICOLOGO', 'UROLOGISTA', 'GINECOLOGISTA', 'NUTRICIONISTA']).optional(),
  })
)