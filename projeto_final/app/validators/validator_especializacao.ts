/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

//Validação para criação do objeto/store
export const storeEspecializacaoValidator = vine.compile(
    vine.object({
        nome: vine.string().trim().toUpperCase().minLength(4),
    })
)
//Validação para atualização do objeto/update
export const updateEspecializacaoValidator = vine.compile(
    vine.object({
        nome: vine.string().trim().toUpperCase().minLength(4),
    })
)