<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api from '@/services/api';

const props = defineProps({
  atendimento: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['atualizar']);

// Estados para o Modal
const mostrarModalValor = ref(false);
const valorConsulta = ref<number | null>(null);
const salasDisponiveis = ref<any[]>([]);
const salaSelecionada = ref<number | null>(null);

const formatarData = (data: string | Date) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

const formatarHora = (data: string) => {
  if (!data) return '';
  // Divide a string no 'T' e pega a parte do tempo: "10:30:00"
  const parteHora = data.split('T')[1];
  if (!parteHora) return '';

  // Retorna apenas HH:mm
  return parteHora.substring(0, 5);
};

const abrirModal = () => {
  mostrarModalValor.value = true;
};

const aprovarConsulta = async (id: number) => {
  if (!valorConsulta.value || valorConsulta.value <= 0) {
    alert("Informe o valor da consulta.");
    return;
  }

  if (!salaSelecionada.value) {
    alert("Por favor, selecione a sala para este atendimento.");
    return;
  }

  try {
    // Enviamos o valor E a salaId para o backend
    await api.patch(`/atendimento/${id}/aprovar`, {
      valor: valorConsulta.value,
      sala_id: salaSelecionada.value
    });

    alert("Consulta aprovada!");
    mostrarModalValor.value = false;
    emit('atualizar');
  } catch (err: any) {
    alert(err.response?.data?.message || "Erro ao aprovar.");
  }
};

const recusarConsulta = async (id: number) => {
  if (!confirm("Tem certeza que deseja recusar?")) return;
  try {
    await api.patch(`/atendimento/${id}/recusar`);
    emit('atualizar');
  } catch (err: any) {
    console.error(err);
  }
};

const buscarSalasReservadas = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    // Buscamos as salas (ou reservas) do profissional logado
    // Ajuste a rota conforme seu backend, ex: /sala/reservadas ou /sala
    const res = await api.get('/sala', {
      headers: { Authorization: `Bearer ${token}` }
    });
    salasDisponiveis.value = res.data;

    // Se o atendimento já veio com uma sala sugerida, pré-selecionamos
    if (props.atendimento.salaId) {
      salaSelecionada.value = props.atendimento.salaId;
    }
  } catch (err) {
    console.error("Erro ao carregar salas:", err);
  }
};

onMounted(buscarSalasReservadas);
</script>

<template>
  <div class="container-card">

    <div v-if="mostrarModalValor" class="modal-overlay">
      <div class="card modal-card">
        <div class="cabecalho">
          <h3>Definir Detalhes</h3>
        </div>

        <div class="corpo">
          <p>Informe os detalhes para: <br><strong>{{ atendimento.cliente?.nome }}</strong></p>

          <div class="input-container">
            <label>Selecione a Sala</label>
            <select v-model="salaSelecionada" class="select-estilizado">
              <option :value="null" disabled>Escolha uma sala reservada</option>
              <option v-for="sala in salasDisponiveis" :key="sala.id" :value="sala.id">
                {{ sala.nome }}
              </option>
            </select>
          </div>

          <div class="input-container">
            <label>Valor da Consulta (R$)</label>
            <input type="number" v-model="valorConsulta" placeholder="0.00" step="0.01">
          </div>
        </div>

        <div class="rodape">
          <div class="botao-recusar">
            <button @click="mostrarModalValor = false">Cancelar</button>
          </div>
          <div class="botao-confirmar">
            <button @click="aprovarConsulta(atendimento.id)">Confirmar</button>
          </div>
        </div>
      </div>
    </div>

    <section class="card">
      <div class="cabecalho">
        <h3>Consulta Pendente</h3>
      </div>

      <div class="corpo">
        <div class="paciente">
          <p><strong>Paciente: </strong>{{ atendimento.cliente?.nome || 'Não informado' }}</p>
        </div>
        <div class="profissional">
          <p><strong>Profissional: </strong>{{ atendimento.profissional?.nome || 'Não informado' }}</p>
        </div>
        <div class="data-hora">
          <p>
            <strong>Horário: </strong>
            {{ formatarHora(atendimento.dataHoraInicio || atendimento.data_hora_inicio) }}h -
            {{ formatarData(atendimento.dataHoraInicio || atendimento.data_hora_inicio) }}
          </p>
        </div>
        <div class="forma-pagamento">
          <p><strong>Forma de pagamento: </strong>{{ atendimento.formaPagamento }}</p>
        </div>

        <div class="rodape">
          <div class="botao-recusar">
            <button @click="recusarConsulta(atendimento.id)" class="btn-recusar">Recusar</button>
          </div>
          <div class="botao-confirmar">
            <button @click="abrirModal" class="btn-confirmar">Confirmar</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="css" scoped>
.select-estilizado {
  padding: 10px;
  border: 1px solid #128093;
  border-radius: 10px;
  outline: none;
  font-size: 16px;
  background-color: #fff;
  cursor: pointer;
  color: #444;
  appearance: none; /* Remove a seta padrão do sistema para maior controle */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23128093' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1em;
  padding-right: 40px; /* Espaço para a setinha personalizada */
}

.input-container label {
  font-weight: bold;
  color: #128093;
  font-size: 13px;
  margin-bottom: 4px;
  text-align: left; /* Alinhado à esquerda como um formulário padrão */
}

/* Garante que o select ocupe a largura total disponível */
.select-estilizado, .input-container input {
  width: 100%;
  box-sizing: border-box;
}
  /* --- SEUS ESTILOS ORIGINAIS PRESERVADOS --- */
  p, h3 { margin: 0; }
  p { font-size: 14px; margin-bottom: 8px; }

  .card {
    margin: 0;
    padding: 20px 24px;
    width: 100%;
    max-width: 400px;
    border-radius: 15px;
    background-color: #fff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 16px;
  }

  .cabecalho {
    display: flex;
    justify-content: center;
    border-bottom: 2px solid #128093;
    padding-bottom: 8px;
  }

  .cabecalho h3 { color: #128093; }

  .rodape {
    display: flex;
    justify-content: space-around;
    padding-top: 8px;
  }

  button {
    background-color: transparent;
    border-radius: 10px;
    padding: 8px 20px;
    font-weight: bold;
    transition: all 0.2s;
    cursor: pointer;
  }

  .botao-recusar button { color: red; border: 2px solid red; }
  .botao-confirmar button { color: green; border: 2px solid green; }

  button:hover { filter: brightness(0.9); background-color: rgba(0, 0, 0, 0.02); }
  button:active { transform: scale(0.98); }

  /* --- AJUSTES PARA O MODAL SE COMPORTAR COMO O CARD --- */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(18, 128, 147, 0.2); /* Um tom do seu azul com transparência */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .modal-card {
    border: 2px solid #128093; /* Destaque sutil para o modal */
  }

  .input-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
  }

  .input-container input {
    padding: 10px;
    border: 1px solid #128093;
    border-radius: 10px;
    outline: none;
    font-size: 16px;
    text-align: center;
  }
</style>
