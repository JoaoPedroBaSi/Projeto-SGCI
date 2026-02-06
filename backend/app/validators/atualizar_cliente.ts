import vine from '@vinejs/vine'

export const atualizarClienteValidator = vine.compile(
  vine.object({
    nome: vine.string().minLength(3).trim().optional(),
    
    // Adicionei limite de tamanho para segurança e trim para limpeza
    telefone: vine.string().minLength(10).maxLength(15).trim().optional(),
    
    // Força o formato ISO (YYYY-MM-DD) para evitar erros de Parse
    dataNascimento: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
    
    // Regex ancorada (Início ^ e Fim $) para garantir que SÓ venha o CPF e nada mais
    cpf: vine.string()
      .regex(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)
      .optional()
  })
)