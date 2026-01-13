import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration for CORS middleware
 */
const corsConfig = defineConfig({
  enabled: true,

  // 'origin: true' libera o acesso para qualquer site (perfeito para desenvolvimento)
  origin: true,

  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig