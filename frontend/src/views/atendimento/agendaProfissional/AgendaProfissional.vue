<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import CardAgenda from '@/components/cards/atendimento/horarios/CardAgenda.vue';
import { Settings } from 'lucide-vue-next';
import type { Atendimento, Cliente } from '@/types';
import api from '@/services/api';
import CardInfosLogin from '@/components/cards/atendimento/login/CardInfosLogin.vue';

// Estado para armazenar todos os atendimentos vindos da API
const todosAtendimentos = ref<Atendimento[]>([]);
const todosClientes = ref<Cliente[]>([]);
const carregando = ref(true);

const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

// Tenta pegar o ID de todas as formas que o seu sistema costuma salvar
const profissionalIdLogado = ref(
  userData.id ||
  userData.user?.id ||
  userData.perfil?.id ||
  null
);

const buscarAtendimentos = async () => {
  try {
    carregando.value = true;

    // 1. Recupera o token (verifique se o nome é 'auth_token' ou 'token')
    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.error("Token não encontrado. Redirecionando para login...");
      return;
    }

    // 2. Configura o cabeçalho de autorização para esta instância da API
    // Isso resolve o erro 401
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const [atendRes, cliRes] = await Promise.all([
      api.get<Atendimento[]>('/atendimento'),
      api.get<Cliente[]>('/cliente')
    ]);

    todosAtendimentos.value = atendRes.data;
    todosClientes.value = cliRes.data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  } finally {
    carregando.value = false;
  }
};

const atendimentosFiltrados = computed(() => {
  const ano = dataSelecionada.value.getFullYear();
  const mes = String(dataSelecionada.value.getMonth() + 1).padStart(2, '0');
  const dia = String(dataSelecionada.value.getDate()).padStart(2, '0');
  const dataFormatada = `${ano}-${mes}-${dia}`;

  return todosAtendimentos.value
    .filter(atend => {
      const dataAtendimento = atend.dataHoraInicio.split('T')[0];

      return (
        dataAtendimento === dataFormatada &&
        Number(atend.profissionalId) === Number(profissionalIdLogado.value) && // Adicionado .value
        atend.status === 'CONFIRMADO'
      );
    })
    .map(atend => {
      const cliente = todosClientes.value.find(c => c.id === atend.clienteId);
      return {
        ...atend,
        nomeCliente: cliente ? cliente.nome : 'Paciente não encontrado'
      };
    });
});

onMounted(buscarAtendimentos);

const dataSelecionada = ref(new Date());

const mudarDia = (quantidade: number) => {
  const novaData = new Date(dataSelecionada.value);
  novaData.setDate(novaData.getDate() + quantidade);
  dataSelecionada.value = novaData;
};

// Computed para o título dinâmico
const dataExibida = computed(() => {
  const data = dataSelecionada.value;
  const hoje = new Date();
  const ehHoje = data.toDateString() === hoje.toDateString();

  const dia = data.getDate();
  const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });

  return `${ehHoje ? 'Hoje - ' : ''}${dia} ${mes}, ${diaSemana}`;
});
</script>

<template>
  <header class="cabecalho">
    <div class="infos">
      <div class="titulo">
        <h2>Minha agenda</h2>
      </div>
      <div class="dias">
        <button class="botao-dia" @click="mudarDia(-1)">< Dia anterior</button>
        <span class="botao-dia active">{{ dataExibida }}</span>
        <button class="botao-dia" @click="mudarDia(1)">Dia seguinte ></button>
      </div>
    </div>

    <CardInfosLogin/>
  </header>

  <main>
    <section class="card-agenda">
      <h2>{{ dataExibida }}</h2>
      <div v-if="carregando">Carregando agenda...</div>
      <div v-else-if="atendimentosFiltrados.length > 0" class="lista-cards">
        <CardAgenda
          v-for="atendimento in atendimentosFiltrados"
          :key="atendimento.id"
          :atendimento="atendimento"
          :nome-cliente="atendimento.nomeCliente"
          @atualizado="buscarAtendimentos"
        />
      </div>
      <div v-else class="vazio">
        <p>Nenhum atendimento para este dia.</p>
      </div>
    </section>
  </main>
</template>

<style lang="css" scoped>
  .cabecalho {
    padding: 0 50px;
    display: flex;
    justify-content: space-between;
    min-height: 150px; /* Mudado de height para min-height */
    align-items: center;
    background-color: white;
    flex-wrap: wrap; /* Permite quebra de linha */
    gap: 20px;
  }

  /* Mantendo sua estilização de botões e textos */
  .dias { display: flex; margin-top: 8px; flex-wrap: wrap; gap: 5px; }
  .dias .botao-dia {
    text-decoration: none;
    padding: 6px 12px;
    border: 1px solid #a0a0a0;
    color: #a0a0a0;
    border-radius: 5px;
    font-size: 14px;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .dias .botao-dia:hover { cursor: pointer; border-color: #128093; background-color: white; color: #128093; }

  .config-perfil { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
  .config .botao-disponibilidade {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    background-color: #128093;
    color: white;
    padding: 10px 18px;
    border-radius: 5px;
    font-weight: 500;
  }

  .infos-perfil {
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 1px solid #eee;
    padding-left: 20px;
  }
  .infos-perfil img { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; }
  .texto p { margin: 0; line-height: 1.2; }
  .texto .email { color: #666; font-size: 0.85rem; }

  main {
    background-color: #e0e0e0;
    padding: 40px 20px;
    min-height: calc(100vh - 150px);
  }

  .card-agenda {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .card-agenda h2 {
    width: 100%;
    max-width: 1200px; /* Aumentado para dar mais amplitude */
    text-align: left;
    margin-bottom: 25px;
    color: #333;
    font-size: 1.8rem; /* Um pouco maior para acompanhar o card */
  }

  .lista-cards {
  width: 100%;
  max-width: 1200px; /* Aumentado para acompanhar o título */
  display: flex;
  flex-direction: column;
  gap: 15px; /* Espaçamento entre um card e outro */
}

  /* REGRAS DE RESPONSIVIDADE (Ajustes sem mudar estilo) */
  @media (max-width: 1000px) {
    .cabecalho { padding: 20px; justify-content: center; }
    .config-perfil { justify-content: center; width: 100%; }
    .infos { align-items: center; text-align: center; }
  }

  @media (max-width: 600px) {
    .infos-perfil { border-left: none; padding-left: 0; }
    .dias { justify-content: center; }
    .botao-disponibilidade span { display: none; } /* Esconde só o texto para caber o botão */
    .cabecalho { padding: 15px; }
  }
</style>
