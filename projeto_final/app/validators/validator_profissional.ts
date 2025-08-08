/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

export const storeProfissionalValidator = vine.compile(
    vine.object({
        //Função id sempre positivo
        funcao_id: vine.number().positive(),
        //Nome com tamanho entre 10 a 40 (especificado na migration) - 
        // consideramos esse campo como nome e sobrenome.
        //Determina que os nomes devem ser maíusculos.
        nome: vine.string().trim().minLength(10).maxLength(40).toUpperCase(),
        //Genero com duas opções
        //A verificação de genero aqui no validator entrou em conflito com o modelo.
        genero: vine.enum(['MASCULINO', 'FEMININO']),
        //CPF tem que ter obrigatoriamente 11 digitos e todos esses números consecutivos.
        cpf: vine.string().trim().minLength(11).maxLength(11).regex(/^\d{11}$/),
        //Idade tem que ser maior que 18. Ou melhor, a mínima idade aceita é 18.
        idade: vine.number().min(18).max(120),
        //email terminando em gmail.com. Por padrão, o email é todo mínusculo.
        email: vine.string().trim().email().toLowerCase(),
        //Senha permite espaços, por isso não tem o .trim()
        //Determina que o tamanho da senha deve ser entre 8-30 caracteres.
        senha: vine.string().minLength(8).maxLength(30)
    })
)
//Consideramos que apenas a senha é modificável.
//Valores sensíveis como cpf e email são inauteráveis após a inserção.
//O nome também é inauterado levando em consideração que hipoteticamente
//foi feita uma validação para verificar se o nome e o CPF estão de acordo.
export const updateProfissionalValidator = vine.compile(
    vine.object({
        funcao_id: vine.number().positive(),
        nome: vine.string().trim().minLength(10).maxLength(40).toUpperCase(),
        genero: vine.enum(['MASCULINO', 'FEMININO']),
        cpf: vine.string().trim().minLength(11).maxLength(11).regex(/^\d{11}$/),
        idade: vine.number().min(18).max(120),
        email: vine.string().trim().email().toLowerCase(),
        senha: vine.string().minLength(8).maxLength(30)
    })

)