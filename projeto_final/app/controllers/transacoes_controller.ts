import Transacao from '#models/transacao'
//import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { storeTransacaoValidator, updateTransacaoValidator } from '#validators/validator_transacao'
//import Application from '@ioc:Adonis/Core/Application'
//import { Application } from '@adonisjs/core/app'
//import View from '@ioc:Adonis/Core/View'
//import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
//import puppeteer from 'puppeteer'

export default class TransacoesController {
    public async index ({ } : HttpContext) {
        return await Transacao.all()
    }

    public async show ({ params } : HttpContext) {
      return await Transacao.query().where('id', params.id)
    }
    
    //Registrar transações externas -> admin é responsável pelo cadastro
    public async store ({ auth, request, response } : HttpContext) {
      try{
        const usuarioLogado = auth.user!;
        const dados = await request.validateUsing(storeTransacaoValidator)

        const adminLogado = usuarioLogado.perfil_tipo === 'admin'

        if (!adminLogado) {
          throw new Error()
        }

        await Transacao.create(dados)

        return response.status(200).send('Transação registrada com sucesso!')
        } catch (error) {
          return response.status(500).send('Não foi possível registrar a transação. Tente novamente.')
        }
    }
  }

    //Gerar recibos - Acontecem após a transação - Em breve...