import vine from '@vinejs/vine'

export const storeFuncaoValidator = vine.compile(
  // Valida o nome da função durante sua criação, garantindo que seja uma string,
  // que não esteja vazia, e que tenha no mínimo 3 caracteres e no máximo 40 caracteres.
  vine.object({
    nome: vine.enum(['MEDICO', 'DENTISTA', 'TERAPEUTA', 'PSICOLOGO', 'UROLOGISTA', 'GINECOLOGISTA', 'NUTRICIONISTA']),
  })
)

export const updateFuncaoValidator = vine.compile(
  // Valida o nome da função durante o update, garantindo que seja uma string,
  // que não esteja vazia, e que tenha no mínimo 3 caracteres máximo 40 caracteres.
  // O campo é opcional, pois a função pode ser atualizada sem alterar o nome.
  vine.object({
    nome: vine.enum(['MEDICO', 'DENTISTA', 'TERAPEUTA', 'PSICOLOGO', 'UROLOGISTA', 'GINECOLOGISTA', 'NUTRICIONISTA'])
  })
)
