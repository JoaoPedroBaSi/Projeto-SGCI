
import Reserva from "#models/reserva";

export default class AtualizarStatusSala {
//     Lógica: 
//     1. Pegar a `reserva` do payload. 
    public async handle(dados: { reserva: Reserva }) {
        if(dados.reserva.status === 'APROVADA') {
        //     2. Buscar a `sala` ligada a ela. 
        await dados.reserva.load('sala')
        //     3. Mudar `sala.status = 'OCUPADO'`.
        dados.reserva.sala.status = 'OCUPADO'
        //     4. Salvar a `sala`.
        await dados.reserva.sala.save()
        }
    }
}