<script lang="ts" setup>
import api from '@/services/api';
import type { Profissional } from '@/types';
import { ref, reactive, watch, computed } from 'vue';

const props = defineProps<{
  listaProfissionais: Profissional[],
  mapaFuncoes: Record<number, string>
}>();
const token = localStorage.getItem('auth_token');

const feedback = reactive({ mensagem: '', tipo: '' });
const mostrarModal = ref(false);

const formulario = reactive({
  profissional_id: '',
  data: '',
  hora: '',
  forma_pagamento: '',
  observacoes: ''
});

const profissionalSelecionado = computed(() => {
  if (!props.listaProfissionais) return null;
  return props.listaProfissionais.find(p => p.id === Number(formulario.profissional_id));
});

const horariosDisponiveis = computed(() => {
  if (!profissionalSelecionado.value?.disponibilidades || !formulario.data) {
    return [];
  }

  return profissionalSelecionado.value.disponibilidades.filter((disp: any) => {
    const dataISO = disp.dataHoraInicio.split('T')[0];

    return dataISO === formulario.data && disp.status === 'LIVRE';
  }).map((disp: any) => {
    const horaFormatada = disp.dataHoraInicio.split('T')[1].substring(0, 5);

    return {
      ...disp,
      horaFormatada
    };
  });
});

const obterIdCliente = () => {
  const userDataRaw = localStorage.getItem('user_data');
  if (!userDataRaw) return null;
  try {
    const userData = JSON.parse(userDataRaw);
    return userData.id || userData.user?.id;
  } catch (e) {
    return null;
  }
};

const lidarComEnvio = async () => {
  const dispSelecionada = horariosDisponiveis.value.find(h => h.horaFormatada === formulario.hora);
  const clienteId = obterIdCliente();

  if (!clienteId) {
    exibirFeedback("⚠️ Erro: Cliente não identificado. Faça login novamente.", "erro");
    return;
  }

  if (!dispSelecionada) {
    exibirFeedback("Erro: Horário não encontrado.", "erro");
    return;
  }

  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const payload = {
      profissional_id: Number(formulario.profissional_id),
      cliente_id: Number(clienteId),
      disponibilidade_id: Number(dispSelecionada.id),
      data_hora_inicio: dispSelecionada.dataHoraInicio.includes('.')
        ? dispSelecionada.dataHoraInicio.split('.')[0]
        : dispSelecionada.dataHoraInicio,
      observacoes: formulario.observacoes,
      forma_pagamento: formulario.forma_pagamento,
      status: 'PENDENTE'
    };

    const response = await api.post('/atendimento', payload, config);

    if (response.status === 201 || response.status === 200) {
      exibirFeedback("✅ Agendamento solicitado com sucesso!", "sucesso");
      Object.assign(formulario, { profissional_id: '', data: '', hora: '', forma_pagamento: '', observacoes: '' });
    }
  } catch (error: any) {
    if (error.response?.data?.errors) {
      console.error("ERRO DE VALIDAÇÃO:", error.response.data.errors);
    }

    console.error("Erro 500 Detalhado:", error.response?.data);
    exibirFeedback(error.response?.data?.message || "Erro interno no servidor.", "erro");
  }
};

const exibirFeedback = (msg: string, tipo: 'sucesso' | 'erro') => {
  feedback.mensagem = msg;
  feedback.tipo = tipo;
  setTimeout(() => { feedback.mensagem = ''; }, 7000);
};

const pedirConfirmacao = () => {
  if (!formulario.data || !formulario.hora || !formulario.profissional_id || !formulario.forma_pagamento) {
    exibirFeedback("⚠️ Por favor, preencha todos os campos obrigatórios.", "erro");
    return;
  }
  mostrarModal.value = true;
};

const confirmarEEnviar = async () => {
  mostrarModal.value = false;
  await lidarComEnvio();
};

const dataFormatadaExibicao = computed(() => {
  if (!formulario.data) return '';
  const [ano, mes, dia] = formulario.data.split('-');
  return `${dia}/${mes}/${ano}`;
});

const nomeProfissionalSelecionado = computed(() => {
  return profissionalSelecionado.value?.nome || 'não selecionado';
});

watch(() => [formulario.data, formulario.profissional_id], () => {
  formulario.hora = '';
});
</script>

<template>
  <div class="booking-container">
    <div class="feedback-container">
      <transition name="fade">
        <div v-if="feedback.mensagem" :class="['alert', feedback.tipo]" role="alert">
          {{ feedback.mensagem }}
        </div>
      </transition>
    </div>

    <form @submit.prevent="pedirConfirmacao" class="booking-card">
      <header class="booking-header">
        <h2>Agendamento de Consulta</h2>
        <div class="divider"></div>
      </header>

      <div class="booking-body">
        <div class="field-group">
          <label for="profissional">Profissional</label>
          <select v-model="formulario.profissional_id" id="profissional" required>
            <option value="">Selecione um especialista</option>
            <option v-for="prof in listaProfissionais" :key="prof.id" :value="prof.id">
              {{ prof.nome }} — {{ mapaFuncoes[prof.funcaoId] || 'Especialista' }}
            </option>
          </select>
        </div>

        <div class="grid-row">
          <div class="field-group">
            <label for="data">Data da Consulta</label>
            <input type="date" id="data" v-model="formulario.data" required>
          </div>

          <div class="field-group">
            <label for="hora">Horário Disponível</label>
            <select v-model="formulario.hora" id="hora" :disabled="!horariosDisponiveis.length" required>
              <option value="" disabled>
                {{ !formulario.data ? 'Aguardando data...' : (horariosDisponiveis.length ? 'Horário' : 'Nenhum horário
                livre') }}
              </option>
              <option v-for="horario in horariosDisponiveis" :key="horario.id" :value="horario.horaFormatada">
                {{ horario.horaFormatada }}
              </option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <label for="pagamento">Forma de Pagamento</label>
          <select v-model="formulario.forma_pagamento" id="pagamento" required>
            <option value="">Selecione o método</option>
            <option v-for="metodo in ['PIX', 'CARTÃO DE CRÉDITO', 'DEBITO', 'DINHEIRO', 'BOLETO']" :key="metodo"
              :value="metodo">
              {{ metodo }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label for="observacoes">Motivo da Consulta (Opcional)</label>
          <textarea id="observacoes" v-model="formulario.observacoes" placeholder="Descreva brevemente..."
            rows="3"></textarea>
        </div>
      </div>

      <footer class="booking-footer">
        <button type="submit" class="btn-primary">Confirmar Agendamento</button>
      </footer>
    </form>

    <transition name="modal">
      <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Revisar Agendamento</h3>
          </div>
          <div class="modal-content">
            <div class="summary-item">
              <span class="label">Profissional</span>
              <span class="value highlight">{{ nomeProfissionalSelecionado }}</span>
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Data</span>
                <span class="value">{{ dataFormatadaExibicao }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Horário</span>
                <span class="value">{{ formulario.hora }}</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="label">Pagamento</span>
              <span class="value">{{ formulario.forma_pagamento }}</span>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="mostrarModal = false" class="btn-text">Corrigir</button>
            <button @click="confirmarEEnviar" class="btn-confirm">Confirmar e Finalizar</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.booking-container {
  --primary: #128093;
  --primary-dark: #0e6675;
  --success: #366c00;
  --error: #d32f2f;
  --text-main: #333;
  --text-muted: #666;
  --border: #ddd;
  --bg-light: #f8f9fa;

  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.booking-card {
  background: white;
  width: 900px;
  min-height: 750px;

  display: flex;
  flex-direction: column;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 60px;
  box-sizing: border-box;
}

.booking-header {
  text-align: center;
  margin-bottom: 40px;
}

.booking-header h2 {
  color: var(--primary);
  font-size: 2rem;
  margin-bottom: 12px;
  font-weight: 700;
}

.divider {
  height: 4px;
  width: 80px;
  background: var(--primary);
  margin: 0 auto;
  border-radius: 10px;
}

.booking-body {
  display: flex;
  flex-direction: column;
  gap: 25px;
  flex-grow: 1;
}

.feedback-wrapper {
  min-height: 60px;
}

.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-group label {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-main);
}

input,
select,
textarea {
  padding: 16px 20px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(18, 128, 147, 0.1);
}

textarea {
  height: 120px;
  resize: none;
}

.booking-footer {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.btn-primary {
  width: 100%;
  max-width: 450px;
  padding: 20px;
  background-color: var(--primary) !important;
  color: white !important;
  border: none;
  border-radius: 14px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--primary-dark) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(18, 128, 147, 0.2);
}

.feedback-container {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  z-index: 100;
  pointer-events: none;
}

.alert {
  pointer-events: auto;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid;
  animation: slideDown 0.3s ease-out;
}

.booking-card {
  position: relative;
  background: white;
  width: 900px;
  min-height: 750px;
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.sucesso {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-color: #c8e6c9;
}

.erro {
  background-color: #ffebee;
  color: #c62828;
  border-color: #ffcdd2;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.3s ease-out;
}

.modal-header h3 {
  color: var(--primary);
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.summary-item .label {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.summary-item .value {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-main);
}

.summary-item .highlight {
  color: var(--primary);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.btn-confirm {
  flex: 1;
  padding: 12px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-text {
  padding: 12px 20px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-muted);
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 950px) {
  .booking-card {
    width: 95%;
    padding: 30px;
  }
}
</style>
