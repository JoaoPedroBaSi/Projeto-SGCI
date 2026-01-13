import { test } from '@japa/runner'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { UserFactory } from '#database/factories/user_factory'

test.group('Auth / Usuário', (group) => {
  
  // Limpa a tabela de usuários antes de cada teste
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('Registro salva senha hasheada e permite login com senha original', async ({ client, assert }) => {
    const password = 'password123'
    const email = 'teste.registro@example.com'

    // 1. Registro
    const registerRes = await client.post('/register').json({
      fullName: 'Teste Registro',
      email,
      password,
      password_confirmation: password, // Confirmação de senha
      perfil_tipo: 'cliente',
      cpf: '000.000.000-00',
      telefone: '(00) 00000-0000',
      genero: 'MASCULINO',
      dataNascimento: '2000-01-01',
    })

    registerRes.assertStatus(201)

    // 2. Verifica no banco se o usuário foi criado
    const user = await User.findBy('email', email)
    assert.exists(user)
    
    // A senha no banco NÃO pode ser igual ao texto puro (deve estar hasheada)
    assert.notEqual(user!.password, password) 
    
    // Verifica se o hash é válido (Isso prova que o hash.make funcionou)
    const isValid = await hash.verify(user!.password, password)
    assert.isTrue(isValid, 'O hash salvo no banco não corresponde à senha original')

    // 3. Tenta Logar (Teste de integração real)
    const loginRes = await client.post('/login').json({
      email,
      password,
    })
    
    loginRes.assertStatus(200)
    // Ajuste a mensagem abaixo conforme o retorno exato da sua API
    // loginRes.assertBodyContains({ message: 'Login realizado com sucesso.' }) 
  })

  test('Alterar senha via endpoint altera para a nova senha', async ({ client, assert }) => {
    const initialPassword = 'password' 
    
    // 1. Cria usuário via Factory FORÇANDO a senha conhecida
    // O .merge() é essencial aqui para garantir que a senha não seja aleatória
    const user = await UserFactory
      .merge({ password: initialPassword })
      .create()

    // 2. Login para obter token (usando a senha que acabamos de forçar)
    const loginRes = await client.post('/login').json({
      email: user.email,
      password: initialPassword,
    })
    
    loginRes.assertStatus(200)
    const token = loginRes.body().token.token

    // 3. Altera a senha
    const newPassword = 'newpassword123'
    
    const changeRes = await client.put('/auth/change-password')
      .header('Authorization', `Bearer ${token}`)
      .json({
        current_password: initialPassword, 
        new_password: newPassword,
        new_password_confirmation: newPassword
      })

    changeRes.assertStatus(200)

    // 4. Verifica no banco se o hash mudou e é válido
    await user.refresh() // Recarrega os dados do banco para pegar o novo hash
    
    const isNewValid = await hash.verify(user.password, newPassword)
    assert.isTrue(isNewValid, 'A nova senha não foi salva corretamente como hash no banco')

    // 5. Tenta logar com a nova senha para garantir fluxo completo
    const newLoginRes = await client.post('/login').json({
      email: user.email,
      password: newPassword,
    })
    
    newLoginRes.assertStatus(200) 
  })
})