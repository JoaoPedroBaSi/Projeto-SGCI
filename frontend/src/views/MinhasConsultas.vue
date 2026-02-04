<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import type { Profissional, Atendimento, Sala } from '@/types/index';

const atendimentos = ref<Atendimento[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchSalas = async () => {
  isLoading.value = true;
  error.value = null;

  const combinarDados = (
    listaAtendimentos: Atendimento[],
    listaSalas: Sala[],
    listaProfissionais: Profissional[]
  ): (Atendimento & DadosAnexadosSala & DadosAnexadosProfissional)[] => {

    return listaAtendimentos.map(atendimento => {

      const sala = listaSalas.find(s => s.id === atendimento.salaId);

      const profissional = listaProfissionais.find(s => s.id === atendimento.profissionalId);

      return {
        ...atendimento,
        nomeSala: sala ? sala.nome : 'Sala Indefinida',
        nomeProfissional: profissional ? profissional.nome : 'Profissional indefinido'
      };
    });
  };

  try {
    const [atendimentoResponse, salaResponse, profissionalResponse] = await Promise.all([
      api.get<Atendimento[]>('/atendimento'),
      api.get<Sala[]>('/sala'),
      api.get<Profissional[]>('/profissional')
    ]);

    const listaAtendimentos = atendimentoResponse.data;
    const listaSalas = salaResponse.data;
    const listaProfissionais = profissionalResponse.data;

    atendimentos.value = combinarDados(listaAtendimentos, listaSalas, listaProfissionais);

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

const cancelarAtendimento = async (atendimentoId: number) => {
  try {
    await api.delete(`/atendimento/${atendimentoId}`);

    atendimentos.value = atendimentos.value.filter(
      atendimento => atendimento.id !== atendimentoId
    );

    alert('Atendimento cancelado com sucesso!');

  } catch (error) {
    console.error(`Erro ao deletar atendimento ${atendimentoId}:`, error);
    alert('Erro ao cancelar o atendimento. Tente novamente.');
  }
};


onMounted(() => {
  fetchSalas();
});


</script>


<template>
  <header>

    <div class="botoes-visualizacao">
      <h1>Minhas consultas</h1>
      <button class="botao-agendar">Agendar nova consulta</button>
      <button class="botao-historico">Visualizar histórico de consultas</button>
    </div>
    <div class="infos-usuario">
      <div class="foto">
        <img
          src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVyZmlsfGVufDB8fDB8fHww"
          alt="">
      </div>
      <div class="credenciais">
        <p class="nome">Nome do usuário</p>
        <p class="email">usuario@gmail.com</p>
      </div>
    </div>
  </header>
  <main>

  </main>


</template>

<style lang="css" scoped>
*,
html {
  color: rgb(74, 74, 74);
}

header {
  margin: 30px;
  display: flex;
  justify-content: space-between;
}

img {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  object-fit: cover;
  margin: auto;
}

.infos-usuario {
  margin: 10px;
  display: flex;
}

.infos-usuario .credenciais {
  margin-top: 15px;
}

.infos-usuario .credenciais p {
  margin: 0 10px;
  padding-bottom: 1px;
}

.infos-usuario .credenciais .nome {
  font-weight: bold;
}

main {
  margin: 50px 30px;
}

h1 {
  color: #128093;
}

.botoes-visualizacao button {
  margin-right: 30px;
  border-radius: 30px;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
  font-weight: bold;
  background-color: transparent;
}

.botoes-visualizacao button.botao-agendar {
  border: 1.4px solid #128093;
  color: #128093;
}

.botoes-visualizacao button.botao-historico {
  border: 1.4px solid blue;
  color: blue;
}
</style>
