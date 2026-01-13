<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import CardAgenda from '@/components/cards/atendimento/horarios/CardAgenda.vue';
import { Settings } from 'lucide-vue-next';
import type { Atendimento, Cliente } from '@/types';
import api from '@/services/api';

// Estado para armazenar todos os atendimentos vindos da API
const todosAtendimentos = ref<Atendimento[]>([]);
const todosClientes = ref<Cliente[]>([]);
const carregando = ref(true);

const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
const profissionalIdLogado = usuarioLogado.id;

const buscarAtendimentos = async () => {
  try {
    carregando.value = true;
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
        atend.profissionalId === 1 && // Usando o ID dinâmico que você já tem
        atend.status !== 'CONCLUIDO'
      );
    })
    .map(atend => {
      // Cruzamento de dados: Encontra o cliente dono do atendimento
      const cliente = todosClientes.value.find(c => c.id === atend.clienteId);
      return {
        ...atend,
        nomeCliente: cliente ? cliente.nome : 'Cliente não encontrado'
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

    <div class="config-perfil">
      <div class="config">
        <RouterLink class="botao-disponibilidade" to="/profissional/disponibilidade">
          <Settings :size="18" color="white" class="icon-gear" />
          <span>Disponibilidade</span>
        </RouterLink>
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
    </div>
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
          class="card"
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
    max-width: 850px; /* Define o limite, mas permite diminuir */
    text-align: left;
    margin-bottom: 20px;
    color: #333;
  }

  .lista-cards {
    width: 100%;
    max-width: 850px; /* Ocupa até 850px, mas reduz conforme a tela */
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
