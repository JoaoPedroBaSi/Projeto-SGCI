import Inventario from "#models/inventario";
import mail from "@adonisjs/mail/services/main";
import User from "#models/user";

export default class NotificarAdminEstoqueBaixo {
    public async handle(dados: {item: Inventario}) {
        if(dados.item.quantidade <= dados.item.pontoReposicao) {
            const admins = await User.query().where('perfil_tipo', 'admin')
            for (const admin of admins) {
                await mail.send((message) => {
                    message
                    .to(admin.email)
                    .from('clinicassgci@gmail.com')
                    .subject(`ALERTA: Estoque baixo para ${dados.item.nome}`)
                    .text(`
                    Olá ${admin.fullName}

                    O item "${dados.item.nome}" está com estoque baixo.

                    Quantidade atual: ${dados.item.quantidade}
                    Ponto de reposição: ${dados.item.pontoReposicao}

                    Verifique a necessidade de reposição no sistema.

                    Atenciosamente,
                    Sistema SGCi
                        `)
                })
            }
            
            
            // console.log(`ALERTA: Estoque baixo para ${dados.item.nome}`)
        }
    }


}   