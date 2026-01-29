<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import type { Profissional, Disponibilidade } from '@/types';
import CardInfosLogin from '@/components/cards/atendimento/login/CardInfosLogin.vue';

// Definição de Tipos Estrita
type DiasValidos = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado';
const diasSemana: DiasValidos[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const busca = ref('');
const profissionais = ref<Profissional[]>([]);
const disponibilidades = ref<Disponibilidade[]>([]);
const carregando = ref(false);

const carregarDados = async () => {
  const token = localStorage.getItem('auth_token');
  carregando.value = true;
  try {
    const [profRes, dispRes] = await Promise.all([
      api.get<Profissional[]>('/profissionais'),
      api.get<Disponibilidade[]>('/disponibilidade', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    profissionais.value = profRes.data;
    disponibilidades.value = dispRes.data;
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  } finally {
    carregando.value = false;
  }
};

onMounted(carregarDados);

const agendaFiltrada = computed(() => {
  if (!busca.value || busca.value.length < 3) return null;

  const profissionalEncontrado = profissionais.value.find(p =>
    p.nome.toLowerCase().includes(busca.value.toLowerCase())
  );

  if (!profissionalEncontrado) return null;

  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

  const segundaDestaSemana = new Date(hoje);
  const diaDaSemanaAtual = hoje.getDay();
  const diferencaParaSegunda = diaDaSemanaAtual === 0 ? -6 : 1 - diaDaSemanaAtual;
  segundaDestaSemana.setDate(hoje.getDate() + diferencaParaSegunda);

  // Solução do Erro: Tipagem explícita dos objetos de retorno
  const datasDaSemana = {} as Record<DiasValidos, string>;
  const agenda = {
    'Segunda': [], 'Terça': [], 'Quarta': [], 'Quinta': [], 'Sexta': [], 'Sábado': []
  } as Record<DiasValidos, Disponibilidade[]>;

  diasSemana.forEach((dia, index) => {
    const dataRef = new Date(segundaDestaSemana);
    dataRef.setDate(segundaDestaSemana.getDate() + index);
    datasDaSemana[dia] = dataRef.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  });

  const sabadoDestaSemana = new Date(segundaDestaSemana);
  sabadoDestaSemana.setDate(segundaDestaSemana.getDate() + 5);

  const livres = disponibilidades.value.filter(d => {
    const dataDisp = new Date(d.dataHoraInicio);
    return (
      d.profissionalId === profissionalEncontrado.id &&
      d.status === 'LIVRE' &&
      dataDisp >= segundaDestaSemana &&
      dataDisp <= new Date(sabadoDestaSemana.setHours(23, 59, 59))
    );
  });

  livres.forEach(disp => {
    const data = new Date(disp.dataHoraInicio);
    const diaIndex = data.getDay(); // 1 a 6

    if (diaIndex >= 1 && diaIndex <= 6) {
      const nomeDia = diasSemana[diaIndex - 1];

      if (nomeDia) {
        agenda[nomeDia].push(disp);
      }
    }
  });

  return { agenda, datasDaSemana };
});

const formatarHora = (iso: string) => {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <header class="cabecalho">
    <CardInfosLogin/>
  </header>

  <div class="barra-pesquisa">
    <input
      type="search"
      v-model="busca"
      placeholder="Digite o nome do profissional (mín. 3 letras)..."
      class="input-pesquisa"
    >
  </div>

  <div v-if="carregando" class="aviso">Carregando dados...</div>

  <div v-if="agendaFiltrada" class="campo-exibicao">
    <div v-for="dia in diasSemana" :key="dia" class="dia-coluna">
      <div class="header-dia">
        <h3>{{ dia }}</h3>
        <span class="data-label">{{ agendaFiltrada?.datasDaSemana[dia] }}</span>
      </div>

      <div class="lista-horarios">
        <div
          v-for="horario in agendaFiltrada?.agenda[dia]"
          :key="horario.id"
          class="card-horario"
        >
          {{ formatarHora(horario.dataHoraInicio) }}
        </div>
        <p v-if="agendaFiltrada?.agenda[dia].length === 0" class="vazio">Sem horários</p>
      </div>
    </div>
  </div>

  <div v-else-if="busca.length >= 3" class="aviso">
    Nenhum profissional encontrado com esse nome.
  </div>
</template>

<style scoped lang="css">
  .cabecalho {
    padding: 0 50px;
    display: flex;
    justify-content: end;
    height: 150px;
    align-items: center;
    background-color: white;
  }
    .infos-perfil img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
  }
  .infos-perfil {
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 1px solid #eee;
    padding-left: 20px;
  }
  .texto{
    gap: 2px;
  }
  .texto p {
    margin: 0;
    line-height: 1.2;
  }
  .texto .email {
    color: #666;
    font-size: 0.85rem;
  }
  .acoes {
    margin: 30px;
    display: flex;
    gap: 20px;
  }
  .acoes a {
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    border-radius: 8px;
  }
  .consulta {
    border: 2px solid #128093; color: #128093;
  }
  .historico-link {
    border: 2px solid blue; color: blue;
  }
  .barra-pesquisa {
    margin-top: 50px;
    display: flex;
    justify-content: center;
    padding: 0 20px;
  }
  .input-pesquisa {
    width: 100%;
    max-width: 800px;
    padding: 10px;
    height: 50px;
    font-size: 18px;
    text-align: center;
    border-radius: 15px;
    border: 2px solid #128093;
    background-color: white;
    outline: none;
  }
  .campo-exibicao {
    display: flex;
    padding: 20px;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  .dia-coluna {
    width: calc(33.3% - 10px);
    background: #fdfdfd;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    margin-bottom: 10px;
  }
  .dia-coluna h3 {
    color: #128093;
    text-align: center;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    margin-top: 0;
  }
  .lista-horarios {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
  }
  .card-horario {
    background: white;
    border: 1px solid #128093;
    color: #128093;
    padding: 8px;
    text-align: center;
    border-radius: 8px;
    font-weight: bold;
    font-size: 0.9rem;
  }
  .vazio { color: #999; text-align: center; font-size: 0.8rem; font-style: italic; }
  .aviso { text-align: center; margin-top: 30px; color: #666; }

  @media screen and (max-width: 1000px) {
    .dia-coluna { width: calc(50% - 10px); }
  }
  @media screen and (max-width: 600px) {
    .dia-coluna { width: 100%; }
  }
</style>
