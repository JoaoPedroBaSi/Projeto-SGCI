import vine from '@vinejs/vine'

export const storeSalaValidator = vine.compile(
  vine.object({
    // CORREÇÃO 1: Tornado opcional para que o Admin possa criar salas sem dono inicialmente
    profissionalId: vine.number().positive().optional(),
    
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase(),
    
    // CORREÇÃO 2: Usando camelCase (precoAluguel) para bater com o Javascript do Front
    precoAluguel: vine.number().min(0),
    
    // Aceita string (formato do input date) ou objeto data
    dataDisponibilidade: vine.string(), 
    
    capacidadePacientes: vine.number().min(1),
    
    // CORREÇÃO 3: Mudado de 'ocupado' (boolean) para 'status' (enum) para bater com o banco e front
    status: vine.enum(['DISPONIVEL', 'OCUPADO', 'MANUTENÇÃO']).optional(),
  })
)

export const updateSalaValidator = vine.compile(
  vine.object({
    profissionalId: vine.number().positive().optional(),
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase().optional(),
    precoAluguel: vine.number().min(0).optional(),
    dataDisponibilidade: vine.string().optional(),
    capacidadePacientes: vine.number().min(1).optional(),
    status: vine.enum(['DISPONIVEL', 'OCUPADO', 'MANUTENÇÃO']).optional(),
  })
)