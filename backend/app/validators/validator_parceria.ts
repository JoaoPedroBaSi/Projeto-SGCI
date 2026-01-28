import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const storeParceriaValidator = vine.compile(
vine.object({
        nome: vine.string().trim().maxLength(40),
        ramo: vine.string().trim().maxLength(40),
        //Garante que sejam apenas 8 digítos no cep
        cep: vine.number().positive().range([10000000, 99999999]),
        //.url() verifica se o formato da url é válido, já o activeUrl() verifica se o link existe na web
        site_url: vine.string().url().activeUrl().nullable().optional(),
        porcentagem_desconto: vine.number(),
        tipo_convenio: vine.string().trim().maxLength(50),
        tipo_relacionamento: vine.enum(['ENTRADA', 'SAIDA', 'MISTO', 'ESTRATEGICO']),
        status_parceria: vine.enum(['ATIVO', 'INATIVO', 'EM NEGOCIACAO']),
        //Quando o status da parceria for diferente de 'EM NEGOCIACAO', é obrigatório
        //que o data_inicio seja preenchido
        data_inicio: vine.date({ formats: ['iso8601'] }).nullable().optional()
        .requiredWhen('status_parceria', '!=', 'EM NEGOCIACAO')
        .transform((value) => {
            //Se o valor existe e não é null, converta
            if (value instanceof Date) {
                return DateTime.fromJSDate(value)
            }
            return value //Retorna null ou undefined
        }),
    })
)


export const updateParceriaValidator = vine.compile(
    vine.object({
    nome: vine.string().trim().maxLength(40).optional(),
    ramo: vine.string().trim().maxLength(40).optional(),
    cep: vine.string().trim().fixedLength(8).optional(),
    cidade: vine.string().trim().maxLength(40).optional(),
    bairro: vine.string().trim().maxLength(40).optional(),
    rua: vine.string().trim().maxLength(40).optional(),
    numero: vine.string().trim().maxLength(3).optional(),
    site_url: vine.string().url().activeUrl().optional(),
    porcentagem_desconto: vine.number().optional(),
    tipo_convenio: vine.string().trim().maxLength(50).optional(),
    tipo_relacionamento: vine.enum(['ENTRADA', 'SAIDA', 'MISTO', 'ESTRATEGICO']).optional(),
    }),
)
