import Inventario from "#models/inventario"
import User from "#models/user"
import mail from "@adonisjs/mail/services/main"

export default class NotificarAdminEstoqueBaixo {
    
    public async handle({ inventario }: { inventario: Inventario }) {
        
        if (inventario.quantidade <= inventario.pontoReposicao) {
            
            const admins = await User.query().where('perfil_tipo', 'admin')

            if (admins.length === 0) return

            await Promise.all(admins.map(admin => {
                return mail.send((message) => {
                    message
                        .to(admin.email)
                        .subject(`ALERTA: Estoque Baixo - ${inventario.nome}`)
                        .html(`
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h2>Olá, ${admin.fullName}</h2>
                                <p>O item <strong>"${inventario.nome}"</strong> atingiu o nível crítico de estoque.</p>
                                
                                <ul>
                                    <li><strong>Quantidade Atual:</strong> ${inventario.quantidade} ${inventario.unidadeMedida}</li>
                                    <li><strong>Ponto de Reposição:</strong> ${inventario.pontoReposicao}</li>
                                </ul>

                                <p style="color: red;">⚠️ Por favor, providencie a compra de novos itens.</p>
                                
                                <hr>
                                <small>Sistema SGCI - Gestão Inteligente</small>
                            </div>
                        `)
                })
            }))
            
            console.log(`📧 E-mail de estoque baixo enviado para ${admins.length} admins.`)
        }
    }
}