import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'smtp',

  /**
   * Remetente padrão: Todas as mensagens sairão com este nome e email
   */
  from: {
    address: env.get('SMTP_USERNAME')!,
    name: 'Projeto SGCI',
  },

  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
      // Se a porta for 465, secure deve ser true (SSL)
      secure: env.get('SMTP_PORT') === 465, 
      
      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME')!,
        pass: env.get('SMTP_PASSWORD')!,
      },
      
      // Configuração para evitar erros de certificado em ambiente de desenvolvimento
      tls: {
        rejectUnauthorized: false
      }
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}