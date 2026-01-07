<script lang="ts" setup>
import api from '@/services/api';
import type { Profissional } from '@/types';
import { ref, reactive, watch, computed } from 'vue';

const props = defineProps<{
  listaProfissionais: Profissional[],
  mapaFuncoes: Record<number, string>
}>();

const feedback = reactive({
  mensagem: '',
  tipo: '' // 'sucesso' ou 'erro'
});

const exibirFeedback = (msg: string, tipo: 'sucesso' | 'erro') => {
  feedback.mensagem = msg;
  feedback.tipo = tipo;
  // Esconde a mensagem após 5 segundos
  setTimeout(() => { feedback.mensagem = ''; }, 10000);
};

// Estado do formulário
const formulario = reactive({
  profissional_id: '',
  data: '',
  hora: '',
  forma_pagamento: '',
  observacoes: ''
});

// Simulando o cliente logado (você pode pegar de um Store como Pinia/Vuex)
const clienteLogadoId = 3;

const lidarComEnvio = async () => {

  feedback.mensagem = '';

  // Validação básica
  if (!formulario.data || !formulario.hora || !formulario.profissional_id) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const payload = {
      profissional_id: Number(formulario.profissional_id),
      cliente_id: 3,
      data_hora_inicio: `${formulario.data}T${formulario.hora}:00.000Z`,
      observacoes: formulario.observacoes,
      forma_pagamento: formulario.forma_pagamento
    };

    // Usando a instância 'api' (Axios) em vez de fetch
    const response = await api.post('/atendimento', payload);

    if (response.status === 201 || response.status === 200) {
      alert("Agendamento realizado com sucesso!");
      feedback.mensagem = "✅ Agendamento realizado com sucesso!";
      feedback.tipo = "sucesso";
      // Opcional: limpar o formulário após sucesso
      Object.assign(formulario, { data: '', hora: '', profissional_id: '', observacoes: '' });
    }
  } catch (error: any) {
    const msgBackend = error.response?.data?.message || "";

    feedback.tipo = "erro";
    if (msgBackend.includes("horários")) {
      feedback.mensagem = "Este horário já está ocupado. Escolha outro, por favor.";
    } else {
      feedback.mensagem = "Não conseguimos agendar. Verifique os dados e tente novamente.";
    }
  }
};
const mostrarModal = ref(false);

// 1. Chamado quando clica no "Confirmar" do formulário
const pedirConfirmacao = () => {
  // Se faltar algum campo, a gente avisa e NÃO abre o modal
  if (!formulario.data || !formulario.hora || !formulario.profissional_id || !formulario.forma_pagamento) {
    exibirFeedback("⚠️ Por favor, preencha todos os campos antes de confirmar.", "erro");
    return;
  }
  mostrarModal.value = true;
};

// 2. Chamado apenas quando clica no "Sim" dentro do Modal
const confirmarEEnviar = async () => {
  mostrarModal.value = false; // Fecha o pop-up
  await lidarComEnvio();      // Chama sua função que já funciona
};

// Função para formatar a data para o padrão brasileiro no Modal
const dataFormatadaExibicao = computed(() => {
  if (!formulario.data) return '';
  const [ano, mes, dia] = formulario.data.split('-');
  return `${dia}/${mes}/${ano}`;
});

// Função para encontrar o nome do profissional selecionado
const nomeProfissionalSelecionado = computed(() => {
  const prof = props.listaProfissionais.find(p => p.id === Number(formulario.profissional_id));
  return prof ? prof.nome : 'não selecionado';
});
watch(() => props.listaProfissionais, (novaLista) => {
  console.log("A lista de profissionais mudou:", novaLista);
}, { immediate: true });
</script>
<template>
  <div class="card-novo-wrapper">
  <form @submit.prevent="pedirConfirmacao" class="card">
    <div class="cabecalho">
      <p>Agendamento</p>
    </div>

    <div v-if="feedback.mensagem" :class="['alerta', feedback.tipo]">
      {{ feedback.mensagem }}
    </div>

    <div class="corpo">
      <div class="profissional">
        <label>Profissional:</label>
        <select v-model="formulario.profissional_id" id="profissional">
          <option value="">Selecione</option>
          <option
            v-for="prof in listaProfissionais"
            :key="prof.id"
            :value="prof.id">
            {{ prof.nome }} - {{ mapaFuncoes[prof.funcaoId] || 'Carregando função...' }}
          </option>
        </select>
      </div>

      <div class="info-datas">
        <div class="data">
          <label>Data:</label>
          <input type="date" v-model="formulario.data" required>
        </div>
        <div class="hora">
          <label>Hora:</label>
          <input type="time" v-model="formulario.hora" required>
        </div>
      </div>

      <div class="forma-pagamento">
        <label>Forma de pagamento:</label>
        <select v-model="formulario.forma_pagamento" required>
          <option value="">Selecione</option>
          <option value="DINHEIRO">DINHEIRO</option>
          <option value="PIX">PIX</option>
          <option value="CREDITO">CREDITO</option>
          <option value="DEBITO">DEBITO</option>
          <option value="BOLETO">BOLETO</option>
        </select>
      </div>

      <div class="descricao">
        <label>Descrição:</label>
        <textarea v-model="formulario.observacoes"></textarea>
      </div>
    </div>

    <div class="rodape">
      <button type="submit" class="confirmar">Confirmar</button>
    </div>
  </form>
  <div v-if="mostrarModal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Confirmar Agendamento?</h3>
    </div>

    <div class="modal-body">
      <p>Você está agendando uma consulta com:</p>
      <p class="destaque-prof">{{ nomeProfissionalSelecionado }}</p>

      <div class="info-confirmacao">
        <span><strong>{{ dataFormatadaExibicao }}</strong></span>
        <span><strong>{{ formulario.hora }}</strong></span>
      </div>

      <p class="pagamento-info">Pagamento via: <strong>{{ formulario.forma_pagamento }}</strong></p>
    </div>

    <div class="modal-acoes">
      <button @click="mostrarModal = false" class="btn-cancelar">Voltar</button>
      <button @click="confirmarEEnviar" class="btn-confirmar-final">Sim, Confirmar</button>
    </div>
  </div>
</div>
</div>
</template>

<style lang="css" scoped>
  .card-novo-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  }
  .card {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 850px;
    height: 700px;
    background-color: transparent;
    border-radius: 50px;
    box-shadow: 4px 4px 8px 8px rgba(0, 0, 0, 0.1);
  }
  .card .cabecalho p {
    font-size: 24px;
  }
  .card .cabecalho {
    border-bottom: 2px solid #128093;
  }
  .card .corpo div{
    margin-top: 10px;
  }
  .card .corpo {
    width: 80%;
    margin-top: 20px;
  }
  .card .corpo .profissional {
    width: 100%;
    flex-direction: column;
    display: flex;
    align-items: center;
  }
  .card .corpo .info-datas {
    width: 100%;
  }
  .card .corpo .info-datas .data, .card .corpo .info-datas .hora {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
  }
  .info-datas .data input, .info-datas .hora input {
    width: 50%;
    text-align: center;
  }
  .info-datas {
    display: flex;
    flex-direction: row;
  }
  .forma-pagamento {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .forma-pagamento select, .profissional select {
    padding-left: 15px;
    width: 80%;
    height: 35px;
    border-radius: 10px;
    background-color: transparent;
  }
  .card .corpo div label {
    font-size: 18px;
    padding-bottom: 5px;
  }
  .card .corpo .profissional input {
    width: 80%;
  }
  .card .corpo div input {
    height: 35px;
    border-radius: 10px;
    border: 1px solid gray;
  }
  .descricao {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  /* Seu código original com um ajuste */
  textarea {
    width: 80%;
    height: 100px; /* Aumentei um pouco para textos extensos */
    border-radius: 10px;
    background-color: transparent;
    padding: 5px;
  }

  .rodape {
    margin-top: 30px;
    display: flex;
    justify-content: space-around;
    width: 500px;
  }
  .rodape button {
    width: 200px;
    height: 40px;
    border-radius: 10px;
    font-size: 16px;
    color: aliceblue;
    border: 2px solid transparent;
  }
  .rodape .confirmar {
    background-color: rgb(54, 108, 0);
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
  }

  .rodape .confirmar:hover {
    background-color: rgb(55, 109, 1);
    filter: brightness(1.2);
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  /* Efeito de CLICK (quando você aperta) */
  .rodape .confirmar:active {
    transform: scale(0.98);            /* Efeito de 'afundar' ao clicar */
  }

  .alerta {
    padding: 10px;
    border-radius: 8px;
    margin-top: 15px;
    width: 80%;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
  }
  .sucesso {
    border: 2px solid #366c00;
    color: #366c00;
    background-color: rgba(54, 108, 0, 0.1);
  }
  .erro {
    border: 2px solid #ff0000;
    color: #ff0000;
    background-color: rgba(255, 0, 0, 0.1);
  }

  /* Botão seguindo o padrão dos seus links <a> */
  .btn-confirmar {
    font-size: 15px;
    background-color: #366c00; /* Verde sólido para o botão principal */
    color: white;
    width: 200px;
    height: 40px;
    border-radius: 8px; /* Combinando com os 8px das suas ações */
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-confirmar:hover {
    opacity: 0.9;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Fundo semi-transparente */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* Garante que fique acima de tudo */
  }

  /* A Janela do Pop-up */
  .modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 8px; /* Padrão que você definiu */
    width: 400px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }

  .modal-acoes {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }

  .btn-cancelar {
    background: transparent;
    border: 2px solid #ff0000;
    color: #ff0000;
    width: 120px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
  }

  .btn-confirmar-final {
    background: #366c00;
    border: none;
    color: white;
    width: 150px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
  }
  .modal-body {
    margin: 20px 0;
    color: #444;
  }

  .destaque-prof {
    font-size: 1.2rem;
    color: #128093;
    font-weight: bold;
    margin-bottom: 15px;
  }

  .info-confirmacao {
    display: flex;
    justify-content: center;
    gap: 20px;
    background: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .pagamento-info {
    font-size: 0.9rem;
    color: #666;
  }

  .modal-header h3 {
    color: #333;
    border-bottom: 2px solid #366c00;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
</style>
