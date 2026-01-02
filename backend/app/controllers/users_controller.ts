import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'

export default class UsersController {
  //TESTADO -> Lista todos os usuários. Somente aqueles com token podem visualizar
  public async index({ auth, response }: HttpContext) {
    const usuario = auth.user!

    //Se não for o administrador que está autenticado, retorna uma mensagem de erro
    if (usuario.perfil_tipo !== 'admin') {
      return response.unauthorized({ message: 'Apenas administradores podem acessar essa rota.' })
    }
    return await User.all()
  }
  //Lista atributos individuais
  //Verifica se é cliente ou profissional
  public async show({ auth, params, response }: HttpContext) {
    //Verifica o usuário que se autenticou
    const usuario = auth.user!

    // Permite apenas o próprio usuário ver seus dados
    if (usuario.id !== Number(params.id)) {
      return response.unauthorized({ message: 'Você só pode visualizar seus próprios dados.' })
    }

    const procura = await User.findOrFail(params.id)

    if (procura.status !== 'ativo') {
      return { message: 'Usuário inativo' }
    }

    if (procura.perfil_tipo === 'cliente') {
      //retorna informações de cliente
      return Cliente.query().where('id', params.id).first()
    } else if (procura.perfil_tipo === 'profissional') {
      //retorna informações de profissional
      return Profissional.query()
        .where('id', params.id)
        .preload('especializacoes')
        .preload('funcao')
        .first()
    } else {
      return { message: 'Tipo de perfil desconhecido' }
    }
  }
  //TESTADO
  public async login({ request, response }: HttpContext) {
    //Faz a requisição de um email e de uma senha
    const email = request.input('email')
    const senha = request.input('password')

    try {
      //Verifica se o valores são correspondentes aos campos email e
      //senha de algum usuário
      const user = await User.verifyCredentials(email, senha)

      //Se o login for autorizado, gera um token para o usuário
      const token = await User.accessTokens.create(user)

      //Retorna uma mensagem de sucesso, juntamente com o token gerado
      return response.status(200).send({
        message: 'Login realizado com sucesso.',
        token: token,
      })
      //Se o email e a senha não forem correspondentes a nenhum
      //usuário, o login não acontece e portanto retorna uma mensagem de erro
    } catch (error) {
      return response.status(500).send({ error: error })
    }
  }
}
