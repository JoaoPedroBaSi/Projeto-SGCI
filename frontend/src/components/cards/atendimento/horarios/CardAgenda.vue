<script lang="ts" setup>
import api from '@/services/api';
import type { Atendimento } from '@/types';
import { computed, ref } from 'vue';

const props = defineProps<{
  atendimento: Atendimento,
  nomeCliente: string
}>();

const emit = defineEmits(['atualizado']);
const justificativa = ref('');
const enviandoCancelamento = ref(false);
const carregando = ref(false);
const exibindoModal = ref(false);
const valorEditado = ref(props.atendimento.valor || 0);

const confirmarCancelamento = async () => {
  if (!justificativa.value.trim()) {
    alert("Por favor, informe o motivo do cancelamento.");
    return;
  }

  try {
    enviandoCancelamento.value = true;
    const token = localStorage.getItem('auth_token'); // Ajustado

    await api.patch(`/atendimento/${props.atendimento.id}/cancelar`,
      { justificativa_falta: justificativa.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Atendimento cancelado com sucesso.");
    exibindoModal.value = false;
    emit('atualizado');
  } catch (error: any) {
    // Exibe a mensagem real do Backend (ex: "Cancelamento deve ser feito com 24h de antecedência")
    const msg = error.response?.data?.message || "Erro ao cancelar.";
    alert("⚠️ " + msg);
    console.error("Erro detalhado:", error.response?.data);
  } finally {
    enviandoCancelamento.value = false;
  }
};

const salvarEdicao = async () => {
  const token = localStorage.getItem('auth_token');
  const valorNumerico = Number(valorEditado.value);
  carregando.value = true;
  try {
    await api.put(`/atendimento/${props.atendimento.id}/concluir`,
      { valor: valorNumerico },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    exibindoModal.value = false;
    emit('atualizado');
  } catch (error: any) {
    alert('Erro ao salvar valor.');
  } finally {
    carregando.value = false;
  }
};

const concluirAtendimento = async () => {
  const token = localStorage.getItem('auth_token');
  if (!confirm('Deseja confirmar a conclusão deste atendimento?')) return;

  carregando.value = true;
  try {
    // Certifique-se que o router está: router.patch('/atendimento/:id/concluir', ...)
    const response = await api.patch(`/atendimento/${props.atendimento.id}/concluir`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert(response.data.message || "Concluído!");
    emit('atualizado'); // Faz o card sumir da agenda (pois o filtro é atend.status === 'CONFIRMADO')
  } catch (error: any) {
    const msg = error.response?.data?.message || "Erro ao concluir.";
    alert("⚠️ " + msg);
  } finally {
    carregando.value = false;
  }
};

const datasFormatadas = computed(() => {
  const { dataHoraInicio, dataHoraFim } = props.atendimento;
  const formatar = (isoString: string) => {
    if (!isoString) return { data: '--/--/--', hora: '--:--' };
    const dataObjeto = new Date(isoString);
    return {
      data: dataObjeto.toLocaleDateString('pt-BR'),
      hora: dataObjeto.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };
  return { inicio: formatar(dataHoraInicio), fim: formatar(dataHoraFim) };
});
</script>

<template>
  <div class="atendimento-wrapper">
    <div class="atendimento-card" :class="{ 'status-concluido': atendimento.status === 'CONCLUIDO' }">

      <div class="bloco-horario">
        <span class="horario-texto">
          {{ datasFormatadas.inicio.hora }} - {{ datasFormatadas.fim.hora }}
        </span>
      </div>

      <div class="bloco-info">
        <h3 class="nome-cliente">{{ props.nomeCliente }}</h3>
        <div class="pagamento-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10"/></svg>
          <span v-if="atendimento.valor">R$ {{ atendimento.valor }} • {{ atendimento.formaPagamento }}</span>
          <span v-else class="aviso">Aguardando definição de valor</span>
        </div>
      </div>

      <div class="bloco-acoes">
        <button
          class="btn btn-concluir"
          @click="concluirAtendimento"
          :disabled="carregando || atendimento.status === 'CONCLUIDO' || !atendimento.valor"
        >
          Concluir
        </button>

        <button
          class="btn btn-cancelar"
          @click="exibindoModal = true"
          :disabled="carregando || atendimento.status === 'CONCLUIDO'"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="exibindoModal" class="overlay">
        <div class="modal-cancelamento">
          <header class="modal-header">
            <h3>Cancelar Atendimento</h3>
            <p>Deseja realmente cancelar o horário de <strong>{{ props.nomeCliente }}</strong>?</p>
          </header>

          <div class="corpo-modal">
            <label>Justificativa do cancelamento</label>
            <textarea
              v-model="justificativa"
              placeholder="Ex: Emergência médica, imprevisto com equipamento..."
              rows="4"
            ></textarea>
            <small class="aviso-cliente">Esta mensagem será enviada ao cliente.</small>
          </div>

          <div class="modal-acoes">
            <button @click="exibindoModal = false" class="btn-voltar">
              Voltar
            </button>
            <button
              @click="confirmarCancelamento"
              class="btn-confirmar-cancelar"
              :disabled="enviandoCancelamento || !justificativa.trim()"
            >
              {{ enviandoCancelamento ? 'Cancelando...' : 'Confirmar Cancelamento' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  </template>

<style scoped>
.atendimento-wrapper {
  width: 100%; /* Ocupa tudo que o pai oferecer */
  padding: 5px 0;
}

.atendimento-card {
  display: flex;
  align-items: center;
  width: 100%; /* Mudado de 80% para 100% */
  background: #ffffff;
  border-radius: 20px; /* Bordas um pouco mais arredondadas */
  padding: 25px 40px; /* Aumentado o respiro interno */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  gap: 40px; /* Mais espaço entre as seções */
}

.atendimento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.bloco-horario {
  min-width: 180px;
  padding-right: 35px;
}

.horario-texto {
  font-size: 1.6rem;
  color: #128093;
  font-weight: bold;
}

.data-subtexto {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

/* Bloco Central (Nome e Pagamento) */
.bloco-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nome-cliente {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
}

.pagamento-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.aviso {
  color: #e67e22;
  font-style: italic;
}

/* Botões de Ação lado a lado */
.bloco-acoes {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  min-width: 100px;
}

.btn-concluir {
  background-color: #28a745; /* Verde bonito */
  color: white;
}

.btn-concluir:hover:not(:disabled) {
  background-color: #218838;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-cancelar {
  background-color: #dc3545; /* Vermelho bonito */
  color: white;
}

.btn-cancelar:hover:not(:disabled) {
  background-color: #c82333;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(1);
}

/* Status Concluído */
.status-concluido {
  background-color: #f8fafc;
  border-left: 8px solid #cbd5e1;
}

.overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.7); /* Tom azulado escuro transparente */
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-cancelamento {
  background: white;
  padding: 40px;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  text-align: center;
  margin-bottom: 25px;
}

.icon-warning {
  font-size: 3rem;
  margin-bottom: 10px;
}

.modal-header h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0 0 10px 0;
}

.corpo-modal {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}

.corpo-modal label {
  font-weight: 600;
  color: #475569;
  font-size: 0.95rem;
}

textarea {
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #dc3545; /* Cor de erro/cancelamento */
}

.aviso-cliente {
  color: #94a3b8;
  font-size: 0.8rem;
}

.modal-acoes {
  display: flex;
  gap: 15px;
}

.btn-voltar {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.btn-confirmar-cancelar {
  flex: 2;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: #dc3545;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirmar-cancelar:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-confirmar-cancelar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transição suave */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsividade */
@media (max-width: 1024px) {
  .atendimento-card { width: 95%; }
}

@media (max-width: 768px) {
  .atendimento-card {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  .bloco-horario {
    border-right: none;
    border-bottom: 2px solid #f0f2f5;
    padding-right: 0;
    padding-bottom: 10px;
    width: 100%;
  }
  .bloco-acoes {
    width: 100%;
  }
  .btn { flex: 1; }
}
@media (max-width: 1100px) {
  .atendimento-card {
    padding: 20px;
    gap: 20px;
  }
}
</style>
