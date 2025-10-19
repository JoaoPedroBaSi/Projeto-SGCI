import Disponibilidade from "#models/disponibilidade"
import Atendimento from "#models/atendimento"
import { DateTime } from "luxon"
export class AtendimentoService {
  public async temDisponibilidade(profissional_id: number, dia: number): Promise<Disponibilidade | null> {
    //Faz a procura pelas informações da disponibilidade
    //Traz as disponibilidades de um profissional específico, a partir da tentativa de inserção
    //Na tabela de Atendimento. Depois disso, com os dados da disponibilidade do profissional
    //Da qual o cliente tá querendo se relacionar via atendimento, verifica a disponibilidade
    const disponibilidade = await Disponibilidade.query().where('profissional_id', profissional_id).andWhere('dia', dia).first()

    return disponibilidade
  }
  //Obs: o parametro "ignorarId" é opcional, já que somente é necessário para a operação de update
  public async temConflito(profissional_id: number, dia: number, data: string, novoInicioSQL: string, novoTerminoSQL: string, ignorarId?: number){
    //Busca atendimentos que estão no mesmo dia, com o mesmo profissional e que tem conflito de horário.
    const conflito = await Atendimento.query()
        .where('profissional_id', profissional_id)
        .where('dia', dia)
        .where('data', data)
        //Esse trecho só é executado se encontrar o "ignorarId"
        .if(ignorarId, (query) => {
        query.whereNot('id', ignorarId!)
        })
        .where((query) => {
            //Nessa parte, verifica se o horário de começo e fim e do atendimento entra
            //em interseção com outra consulta.
            query.where('horario_termino', '>', novoInicioSQL)
                .andWhere('horario_comeco', '<', novoTerminoSQL)
        })
        .first()

    return conflito
  }
  public async converteStringParaDate(horario_comeco: string){
    // O seu validador garante o formato 'HH:mm'. Precisamos usá-lo para calcular o término.
    // A data de hoje é arbitrária, mas necessária para o Luxon calcular a duração (30 minutos).
    // NOTA: É CRUCIAL que o fuso horário (zone: 'utc' ou 'local') seja o mesmo do banco.
    const dataBase = '2000-01-01' // Data base arbitrária para calcular a hora de término
    //Converte o horário solicitado para o formato adequado
    const horarioBaseSolicitado = DateTime.fromFormat(
        `${dataBase} ${horario_comeco}`,
        'yyyy-MM-dd HH:mm',
        // Usar UTC é a prática mais segura, se seu DB for UTC.
        { zone: 'utc' } 
    )
    return horarioBaseSolicitado
}
}