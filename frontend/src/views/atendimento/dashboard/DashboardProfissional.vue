<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import type { Profissional, Atendimento, Sala, Cliente } from '@/types/index';
import CardDashboardProfissional from '@/components/cards/atendimento/dashboard/CardDashboardProfissional.vue';
const atendimentos = ref<Atendimento[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
  const disponibilidades = ref<any[]>([]);
//clienteLogadoId é o que determina quais dados X cliente irá visualizar.
//const profissionalLogadoId = ref(1);
const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
const profissionalLogadoId = ref(usuarioLogado.id);

const fetchSalas = async () => {
  isLoading.value = true;
  error.value = null;

  const combinarDados = (
  listaAtendimentos: Atendimento[],
  listaSalas: Sala[],
  listaProfissionais: Profissional[],
  listaClientes: Cliente[] // Adicione este parâmetro
) => {
  const token = localStorage.getItem('token');
  return listaAtendimentos.map(atendimento => {
    const sala = listaSalas.find(s => s.id === atendimento.salaId);
    const profissional = listaProfissionais.find(s => s.id === atendimento.profissionalId);
    const cliente = listaClientes.find(c => c.id === atendimento.clienteId); // <--- Encontra o cliente

    return {
      ...atendimento,
      nomeSala: sala ? sala.nome : 'Sala Indefinida',
      nomeProfissional: profissional ? profissional.nome : 'Profissional indefinido',
      // Anexa os dados do cliente que precisamos para os gráficos
      generoCliente: cliente ? cliente.genero : 'Não informado',
      nascimentoCliente: cliente ? cliente.dataNascimento : null
    };
  });
};

  try {
  const [atendimentoResponse, salaResponse, profissionalResponse, clienteResponse] = await Promise.all([
    api.get<Atendimento[]>('/atendimento'),
    api.get<Sala[]>('/sala'),
    api.get<Profissional[]>('/profissional'),
    api.get<Cliente[]>('/cliente')
  ]);

  const listaAtendimentos = atendimentoResponse.data;
  const listaSalas = salaResponse.data;
  const listaProfissionais = profissionalResponse.data;
  const listaClientes = clienteResponse.data;

  // Assumindo que a função combinarDados agora aceita apenas atendimentos e salas
  const atendimentosCombinados = combinarDados(listaAtendimentos, listaSalas, listaProfissionais, listaClientes);

  atendimentos.value = atendimentosCombinados.filter(atendimento => {
      // Usamos a propriedade 'clienteId' do atendimento para comparar com o ID logado
      return atendimento.profissionalId === profissionalLogadoId.value;
    });

  } catch (error) {
    console.error("Erro ao buscar salas:", error);
  } finally {
    isLoading.value = false;
  }

  type DadosAnexadosSala = {
    nomeSala: string;
}

  type DadosAnexadosProfissional = {
    nomeProfissional: string;
  }
};

const saldoTotal = computed(() => {
  return atendimentos.value
    .filter(a => a.status === 'CONCLUIDO' && a.statusPagamento === 'PAGO')
    .reduce((acc, atual) => acc + Number(atual.valor || 0), 0);
});

const contarAtendimentosConfirmados = computed(() => {
  const hoje = new Date().toLocaleDateString('pt-BR');
  return atendimentos.value.filter(a =>
    a.status === 'CONFIRMADO' &&
    new Date(a.dataHoraInicio).toLocaleDateString('pt-BR') === hoje
  ).length;
});

const contarAtendimentosAguardandoPagamento = computed(() => {
    const aguardando = atendimentos.value.filter(atendimento => {
        return atendimento.statusPagamento === 'PENDENTE';
    });

    return aguardando.length;
});

const contarAtendimentosNoHistorico = computed(() => {
  const historico = atendimentos.value.filter(atendimento => {
      return atendimento.status === 'CONCLUIDO';
  })
  return historico.length;
});

const dataStatusPagamento = computed(() => {
  return {
    labels: ['PENDENTE', 'PAGO', 'CANCELADO'],
    datasets: [
      {
        backgroundColor: ['#FFC107', '#4CAF50', '#F44336'],
        data: [
          atendimentos.value.filter(a => a.statusPagamento === 'PENDENTE').length,
          atendimentos.value.filter(a => a.statusPagamento === 'PAGO').length,
          atendimentos.value.filter(a => a.statusPagamento === 'CANCELADO').length,
        ]
      }
    ]
  }
});

const dataGanhosMensais = computed(() => {
  const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const valoresPorMes = new Array(12).fill(0);

  atendimentos.value.forEach(atendimento => {
    // Supõe que atendimento.data seja uma string ISO ou Date
    const data = new Date(atendimento.dataHoraInicio);
    const mes = data.getMonth(); // 0 a 11

    // Soma o valor se o atendimento for concluído (exemplo)
    if (atendimento.status === 'CONCLUIDO' && atendimento.valor && atendimento.statusPagamento === 'PAGO') {
      valoresPorMes[mes] += atendimento.valor;
    }
  });

  return {
    labels: mesesLabels,
    datasets: [{
      label: 'Ganhos Mensais (R$)',
      backgroundColor: '#128093',
      borderColor: '#128093',
      data: valoresPorMes,
      fill: false,
    }]
  };
});

const dataGeneroPizza = computed(() => {
  const clientesUnicos = new Map();

  atendimentos.value.forEach(atendimento => {
    if (!clientesUnicos.has(atendimento.clienteId)) {
      clientesUnicos.set(atendimento.clienteId, (atendimento as any).generoCliente);
    }
  });

  const generosUnicos = Array.from(clientesUnicos.values());

  const contagem = {
    Masculino: generosUnicos.filter(g => g === 'MASCULINO').length,
    Feminino: generosUnicos.filter(g => g === 'FEMININO').length,
    Outros: generosUnicos.filter(g => g !== 'MASCULINO' && g !== 'FEMININO').length
  };

  const temDados = generosUnicos.length > 0;

  return {
    labels: temDados ? Object.keys(contagem) : ['Sem dados'],
    datasets: [{
      backgroundColor: ['#36A2EB', '#FF6384', '#9966FF'],
      data: temDados ? Object.values(contagem) : [1],
      borderWidth: 1
    }]
  };
});

const dataIdadePizza = computed(() => {
  const pacientesUnicos = new Map<number, string>();

  atendimentos.value.forEach(atendimento => {
    if (!pacientesUnicos.has(atendimento.clienteId)) {
      pacientesUnicos.set(atendimento.clienteId, (atendimento as any).nascimentoCliente);
    }
  });

  const idadesUnicas = Array.from(pacientesUnicos.values()).map(dataNasc => {
    if (!dataNasc) return null;

    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  });

  const faixas = {
    '19-40 anos': idadesUnicas.filter(i => i !== null && i >= 19 && i <= 40).length,
    '41-65 anos': idadesUnicas.filter(i => i !== null && i > 40 && i <= 65).length,
    'Acima de 65': idadesUnicas.filter(i => i !== null && i > 65).length
  };

  const temDados = idadesUnicas.length > 0;

  return {
    labels: temDados ? Object.keys(faixas) : ['Sem dados'],
    datasets: [{
      backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40'],
      hoverOffset: 4,
      data: temDados ? Object.values(faixas) : [1]
    }]
  };
});

const apenasBloqueados = computed(() => {
  return disponibilidades.value.filter(d => d.status === 'BLOQUEADO');
});
const formatarData = (iso: string) => {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const formatarHora = (iso: string) => {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const fetchDisponibilidade = async () => {
  try {
    const token = localStorage.getItem('token');
    const agora = new Date(); // Pega a data e hora exata de agora

    const response = await api.get('/disponibilidade', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    disponibilidades.value = response.data.filter((d: any) => {
      const dataFimBloqueio = new Date(d.dataHoraFim);

      return (
        d.profissionalId === profissionalLogadoId.value &&
        dataFimBloqueio >= agora
      );
    });

    // Opcional: Ordenar para que os mais próximos apareçam primeiro
    disponibilidades.value.sort((a, b) =>
      new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime()
    );

  } catch (err) {
    console.error("Erro ao carregar bloqueios recentes:", err);
  }
};

onMounted(() => {
  fetchSalas();
  fetchDisponibilidade();
});


</script>

<!--TELA DO PROFISSIONAL-->

<template>
  <DashboardLayout>
    <header class="cabecalho">
      <div class="titulo">
        <h1>Seus dashboards</h1>
      </div>
      <div class="infos-perfil">
        <div class="foto">
          <img src="https://cdn-icons-png.flaticon.com/512/12225/12225881.png" alt="Perfil">
        </div>
        <div class="texto">
          <p class="nome">{{ usuarioLogado.nome || 'Usuário' }}</p>
          <p class="email">{{ usuarioLogado.email || 'E-mail não informado' }}</p>
        </div>
      </div>
    </header>

    <main class="dashboard-layout">
      <section class="coluna-dashboards">
        <div class="grid-cards-principais">
          <CardDashboardProfissional finalidade="rendimento" :chartData="saldoTotal" titulo="Saldo"/>
          <CardDashboardProfissional
            finalidade="agenda"
            :qtdAgendadas="contarAtendimentosConfirmados"
            :qtdFinalizadas="contarAtendimentosNoHistorico"
            :qtdPendentesPagamento="contarAtendimentosAguardandoPagamento"
          />
        </div>

        <div class="grid-graficos">
          <CardDashboardProfissional finalidade="grafico-pagamentos" :chartData="dataStatusPagamento" />
          <CardDashboardProfissional finalidade="grafico-rendimento" :chartData="dataGanhosMensais" />
          <CardDashboardProfissional finalidade="grafico-genero" :chartData="dataGeneroPizza"/>
          <CardDashboardProfissional finalidade="grafico-idade" :chartData="dataIdadePizza"/>
        </div>
      </section>

      <aside class="coluna-calendario">
        <div class="card-calendario-fixo">
          <h3>Dias Bloqueados</h3>
          <p class="legenda">Datas em que você marcou como "Bloqueado".</p>

          <div class="lista-bloqueios">
            <div v-for="bloqueio in apenasBloqueados" :key="bloqueio.id" class="item-bloqueio">
              <span class="ponto-vermelho"></span>
              <div class="info-bloqueio">
                <strong>{{ formatarData(bloqueio.dataHoraInicio) }}</strong>
                <span>{{ formatarHora(bloqueio.dataHoraInicio) }} - {{ formatarHora(bloqueio.dataHoraFim) }}</span>
              </div>
            </div>
            <div v-if="apenasBloqueados.length === 0" class="sem-bloqueios">
              Nenhum bloqueio registrado.
            </div>
            <div class="link">
              <RouterLink to="/profissional/disponibilidade" class="router-link">Informar faltas -></RouterLink>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </DashboardLayout>
</template>

<style lang="css" scoped>
  /* --- ESTILOS ORIGINAIS PRESERVADOS --- */
  .cabecalho {
    padding: 0 50px;
    display: flex;
    justify-content: space-between;
    min-height: 150px; /* Alterado de height fixo */
    align-items: center;
    background-color: white;
    flex-wrap: wrap; /* Para mobile */
  }
  .infos-perfil { display: flex; align-items: center; gap: 12px; border-left: 1px solid #eee; padding-left: 20px; }
  .infos-perfil img { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; }
  .texto p { margin: 0; line-height: 1.2; }
  .texto .email { color: #666; font-size: 0.85rem; }
  .titulo { margin: 30px; display: flex; gap: 20px; }
  h1 { color: #128093; font-size: 25px; margin: 0; }

  /* --- ESTRUTURA RESPONSIVA --- */
  .dashboard-layout {
    display: grid;
    grid-template-columns: 1fr 350px; /* Padrão Desktop */
    gap: 30px;
    padding: 20px 30px;
    background-color: #f9f9f9; /* Ajuste leve para contraste */
    align-items: start;
  }

  .coluna-dashboards { display: flex; flex-direction: column; gap: 20px; }

  .grid-cards-principais {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .grid-graficos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
  }

  /* Coluna Lateral */
  .coluna-calendario { position: sticky; top: 30px; }
  .card-calendario-fixo {
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    border: 1px solid #eee;
  }
  .card-calendario-fixo h3 { color: #128093; margin-top: 0; }
  .lista-bloqueios { max-height: 500px; overflow-y: auto; }
  .item-bloqueio { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f9f9f9; }
  .ponto-vermelho { width: 10px; height: 10px; background-color: #ff4d4d; border-radius: 50%; }
  .info-bloqueio { display: flex; flex-direction: column; }
  .info-bloqueio strong { font-size: 0.95rem; }
  .info-bloqueio span { font-size: 0.85rem; }

  .link{
    margin-top: 10px;
    display: flex;
    justify-content: center;
  }
  .link .router-link{
    text-decoration: none;
  }

  @media screen and (max-width: 1100px) {
    .dashboard-layout {
      grid-template-columns: 1fr; /* Calendário vai para baixo */
    }
    .coluna-calendario {
      position: static;
      order: 2;
    }
    .coluna-dashboards { order: 1; }
  }

  @media screen and (max-width: 768px) {
    .cabecalho {
      padding: 20px;
      justify-content: center;
      text-align: center;
      height: auto;
    }
    .infos-perfil {
      border-left: none;
      padding-left: 0;
      width: 100%;
      justify-content: center;
    }
    .titulo { margin: 10px 0; }

    .grid-graficos {
      grid-template-columns: 1fr; /* Gráficos ocupam largura total */
    }

    .dashboard-layout {
      padding: 10px;
      gap: 20px;
    }
  }

  @media screen and (max-width: 480px) {
    .grid-cards-principais {
      grid-template-columns: 1fr; /* Cards de topo um abaixo do outro */
    }
    h1 { font-size: 20px; }
  }
</style>
