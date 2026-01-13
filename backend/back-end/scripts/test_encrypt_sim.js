// Script de simulação do hook User.encryptPassword
// Não depende do Adonis — apenas reproduz a lógica de logs e checagem de hash

async function simulateEncryptPassword(user) {
  const pwd = user.password || ''
  const wasDirty = !!user.$dirty && !!user.$dirty.password

  console.log('[User.encryptPassword] start', {
    id: user.id ?? null,
    email: user.email ?? null,
    dirty: wasDirty,
    passwordPreview: pwd.slice(0, 60),
  })

  if (wasDirty) {
    const lower = pwd
    const isAlreadyHashed =
      lower.startsWith('$scrypt') || lower.startsWith('$argon2') || lower.startsWith('$2b$')

    if (isAlreadyHashed) {
      console.log('[User.encryptPassword] skipping hash — password already looks hashed', {
        id: user.id ?? null,
        email: user.email ?? null,
        passwordPreview: pwd.slice(0, 60),
      })
      return
    }

    // Simula o hash (substitui por um prefixo para visualização)
    const hashed = '$scrypt$' + Buffer.from(pwd).toString('base64')
    user.password = hashed

    console.log('[User.encryptPassword] finished', {
      id: user.id ?? null,
      email: user.email ?? null,
      hashedPreview: (user.password ?? '').slice(0, 60),
    })
  } else {
    console.log('[User.encryptPassword] no-op — password not dirty', {
      id: user.id ?? null,
      email: user.email ?? null,
    })
  }
}

async function run() {
  console.log('--- Caso 1: senha nova (dirty) ---')
  await simulateEncryptPassword({ id: 1, email: 'a@b.com', password: 'senha123', $dirty: { password: true } })

  console.log('\n--- Caso 2: já hasheada (dirty) ---')
  await simulateEncryptPassword({ id: 2, email: 'c@d.com', password: '$argon2$hash..', $dirty: { password: true } })

  console.log('\n--- Caso 3: não dirty ---')
  await simulateEncryptPassword({ id: 3, email: 'e@f.com', password: 'senha123', $dirty: { } })
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
