import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const storeParceriaValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().maxLength(100),
    ramo: vine.string().trim().maxLength(50),
    
    cnpj: vine.string().trim()
      .regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)
      .transform((value: string) => value.replace(/\D/g, '')),

    cep: vine.string().trim().fixedLength(8),
    
    siteUrl: vine.string().url().optional(),
    
    porcentagemDesconto: vine.number().min(0).max(100),
    
    tipoConvenio: vine.string().trim().maxLength(50),
    
    tipoRelacionamento: vine.enum(['ENTRADA', 'SAIDA', 'MISTO', 'ESTRATEGICO']),
    
    statusParceria: vine.enum(['ATIVO', 'INATIVO', 'EM NEGOCIACAO']),

    dataInicio: vine.date({ formats: ['YYYY-MM-DD'] })
      .transform((value: Date) => DateTime.fromJSDate(value))
      .optional(),
  })
)

export const updateParceriaValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().maxLength(100).optional(),
    ramo: vine.string().trim().maxLength(50).optional(),
    
    cnpj: vine.string().trim()
      .regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)
      .transform((value: string) => value.replace(/\D/g, ''))
      .optional(),

    cep: vine.string().trim().fixedLength(8).optional(),
    siteUrl: vine.string().url().optional(),
    porcentagemDesconto: vine.number().min(0).max(100).optional(),
    tipoConvenio: vine.string().trim().maxLength(50).optional(),
    tipoRelacionamento: vine.enum(['ENTRADA', 'SAIDA', 'MISTO', 'ESTRATEGICO']).optional(),
    statusParceria: vine.enum(['ATIVO', 'INATIVO', 'EM NEGOCIACAO']).optional(),
    
    dataInicio: vine.date({ formats: ['YYYY-MM-DD'] })
      .transform((value: Date) => DateTime.fromJSDate(value))
      .optional(),
  })
)