/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

// Regra customizada: calcula a idade com base na data de nascimento
const dataNascimentoRule = vine.createRule(async (value, _, field) => {
  const nascimento = new Date(value as string | number | Date)
  const hoje = new Date()

  // Cálculo da idade considerando mês e dia
  const idade =
    hoje.getFullYear() -
    nascimento.getFullYear() -
    (hoje < new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate()) ? 1 : 0)

  // Verificações de validação
  if (Number.isNaN(nascimento.getTime())) {
    field.report('Data de nascimento inválida', 'validation', field)
  } else if (nascimento > hoje) {
    field.report('A data de nascimento não pode ser futura', 'validation', field)
  } else if (idade < 18) {
    field.report('O profissional deve ter no mínimo 18 anos', 'validation', field)
  } else if (idade > 120) {
    field.report('Idade máxima permitida é 120 anos', 'validation', field)
  }
})

export const storeProfissionalValidator = vine.compile(
  vine.object({
    // REMOVIDO: funcao_id
    // Motivo: O Controller do Admin define a função manualmente (ex: cria ou busca 'MEDICO')
    // Se deixarmos obrigatório aqui, o cadastro falha porque o Front não envia ID.
    funcao_id: vine.number().positive().optional(), 
    
    // Nome e Sobrenome
    nome: vine.string().trim().minLength(10).maxLength(40).toUpperCase(),
    
    // Genero
    genero: vine.enum(['MASCULINO', 'FEMININO', 'OUTRO']), // Adicionei OUTRO para bater com seu Front
    
    // CPF
    cpf: vine.string().trim().minLength(11).maxLength(14), // Ajustei para aceitar mascara se vier
    
    // Data de Nascimento
    dataNascimento: vine.date().use(dataNascimentoRule()),
    
    // Contato
    telefone: vine.string().trim().minLength(10).maxLength(15),

    // Opcionais
    registro_conselho: vine.string().trim().maxLength(50).optional(),
    conselho_uf: vine.string().trim().maxLength(2).optional(),
    foto_perfil_url: vine.string().url().optional(),
    biografia: vine.string().trim().maxLength(1000).optional(),
    
    // STATUS: Opcional (O Controller define como 'aprovado' automaticamente)
    status: vine.enum(['pendente', 'aprovado', 'rejeitado']).optional(),
    
    comprovante_credenciamento_url: vine.string().url().optional(),
    observacoes_admin: vine.string().trim().maxLength(400).optional(),
    
    // Campos extras que seu Front pode mandar (para não dar erro)
    especializacao: vine.string().optional(),
    email: vine.string().email().optional(), // O email é validado no User, mas se vier aqui, aceita
    senha: vine.string().optional(), // Mesma coisa
    confirmarSenha: vine.string().optional()
  })
)

export const updateProfissionalValidator = vine.compile(
  vine.object({
    funcao_id: vine.number().positive().optional(),
    nome: vine.string().trim().minLength(10).maxLength(40).toUpperCase(),
    genero: vine.enum(['MASCULINO', 'FEMININO', 'OUTRO']),
    cpf: vine.string().trim().minLength(11).maxLength(14),
    dataNascimento: vine.date().use(dataNascimentoRule()),
    telefone: vine.string().trim().minLength(10).maxLength(15).optional(),

    registro_conselho: vine.string().trim().maxLength(50).optional(),
    conselho_uf: vine.string().trim().maxLength(2).optional(),
    foto_perfil_url: vine.string().url().optional(),
    biografia: vine.string().trim().maxLength(1000).optional(),
    status: vine.enum(['pendente', 'aprovado', 'rejeitado']).optional(),
    comprovante_credenciamento_url: vine.string().url().optional(),
    observacoes_admin: vine.string().trim().maxLength(500).optional(),
  })
)