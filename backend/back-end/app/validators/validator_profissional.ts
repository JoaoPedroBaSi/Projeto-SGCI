import vine from '@vinejs/vine'

/**
 * Validator para a CRIAÇÃO (store)
 * Aqui definimos o que é obrigatório no cadastro inicial
 */
export const storeProfissionalValidator = vine.compile(
  vine.object({
    funcao_id: vine.number().positive(),
    registro_conselho: vine.string().trim().minLength(3),
    conselho_uf: vine.string().fixedLength(2),
    biografia: vine.string().optional(),
    
    // Data de nascimento obrigatória na criação (conforme uso no Controller)
    dataNascimento: vine.date(),
  })
)

/**
 * Validator para a ATUALIZAÇÃO (update)
 * Aqui usamos a lógica que você mandou, com campos opcionais
 */
export const updateProfissionalValidator = vine.compile(
  vine.object({
    // Campos básicos
    funcao_id: vine.number().optional(),
    nome: vine.string().optional(),
    
    // Aceita MASCULINO/FEMININO
    genero: vine.enum(['MASCULINO', 'FEMININO']).optional(),
    
    // CPF como string opcional
    cpf: vine.string().optional(),
    telefone: vine.string().optional(),

    // === DATA ===
    dataNascimento: vine.date().optional(),
    
    // Campos Profissionais
    registro_conselho: vine.string().optional(),
    conselho_uf: vine.string().optional(),
    
    biografia: vine.string().optional(),
    foto_perfil_url: vine.string().optional(),
    
    // Campos Admin
    status: vine.enum(['pendente', 'aprovado', 'rejeitado']).optional(),
    observacoes_admin: vine.string().optional(),
  })
)