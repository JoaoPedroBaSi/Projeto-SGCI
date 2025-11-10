import type { HttpContext } from '@adonisjs/core/http'
import Parceria from '#models/parceria'
import { storeParceriaValidator, updateParceriaValidator } from '#validators/validator_parceria'

export default class ParceriasController {
    public async index ({ } : HttpContext) {
        return await Parceria.all()
    }
    public async show ({ params } : HttpContext) {
        return await Parceria.query().where('id', params.id).first()
    }
    public async store ({ request, response } : HttpContext) {
    try {
        const dados = await request.validateUsing(storeParceriaValidator)
        console.log('dados passou')

        // 1. MAPEAMENTO DE SNAKE_CASE (dados) PARA CAMELCASE (parceriaData)
        const parceriaData = {
            nome: dados.nome,
            ramo: dados.ramo,
            cep: dados.cep,
            // Mapeamento obrigatório para que o Lucid encontre as propriedades
            siteUrl: dados.site_url, 
            porcentagemDesconto: dados.porcentagem_desconto,
            tipoConvenio: dados.tipo_convenio,
            tipoRelacionamento: dados.tipo_relacionamento,
            dataInicio: dados.data_inicio, // Será Luxon DateTime ou null
            statusParceria: dados.status_parceria,
        }

        // 2. Lógica de EM NEGOCIACAO (usando o objeto mapeado)
        if (parceriaData.statusParceria === 'EM NEGOCIACAO') {
            parceriaData.dataInicio = null // Correto, pois o Model aceita | null
        }
        console.log('if passou')

        // 3. Criação com o objeto mapeado
        await Parceria.create(parceriaData) // <-- Usar 'parceriaData'
        console.log('create passou')

        return response.status(201).send('Cadastro de parceria feito com sucesso.')
    } catch (error) {
        // ESSENCIAL: Logar o erro real para debug
        console.error('ERRO REAL AO CADASTRAR PARCERIA:', error) 
        
        return response.status(500).send('Erro ao cadastrar a parceria. Tente novamente.')
    }
}
    public async update ({ params, request, response } : HttpContext) {
        try{
            const dados = await request.validateUsing(updateParceriaValidator)

            const parceria = await Parceria.findOrFail(params.id)

            //Se estiver em negociação, força a colocar a data de inicio da parceria como null
            if (dados.status_parceria === 'EM NEGOCIACAO') {
                dados.data_inicio = null
            }

            parceria.merge(dados)

            await parceria.save()

            return response.status(201).send('Atualização de parceria feito com sucesso.')
    
        } catch (error) {
            return response.status(500).send('Erro ao atualizar a parceria. Tente novamente.')
        }
    }
    public async destroy ({ params, response } : HttpContext) {
        try{
            const parceria = await Parceria.findOrFail(params.id)

            await parceria.delete()

            return response.status(201).send('Exclusão de parceria feito com sucesso.')
        } catch (error) {
            return response.status(500).send('Erro ao atualizar a parceria. Tente novamente.')
        }
    }
}