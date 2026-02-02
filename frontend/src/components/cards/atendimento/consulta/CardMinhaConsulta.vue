<script lang="ts" setup>
import api from '@/services/api';
import { computed } from 'vue';

// Define a prop que o card vai receber
const props = defineProps<{
  atendimento: any
}>();

const emit = defineEmits(['atualizar']);

const cancelarAtendimento = async () => {
  if (!confirm("Deseja realmente cancelar esta consulta?")) return;

  try {
    const token = localStorage.getItem('auth_token');
    const payload = {};

    await api.patch(`/atendimento/${props.atendimento.id}/cancelar`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    emit('atualizar');
    alert("Atendimento cancelado com sucesso.");
  } catch (error: any) {
    const mensagemErro = error.response?.data?.message || "Erro ao cancelar.";
    alert("⚠️ " + mensagemErro);
    console.error("Erro no cancelamento:", error.response?.data);
  }
};

// Formata a data para o padrão brasileiro
const dataFormatada = computed(() => {
  const data = new Date(props.atendimento.dataHoraInicio);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});
</script>

<template>
  <div class="card-consulta">
    <div class="cabecalho">
      <h3>Consulta com {{ atendimento.profissional?.nome || 'Profissional' }}</h3>
    </div>

    <div class="corpo">
      <div class="foto-container">
        <img src="https://cdn-icons-png.flaticon.com/512/12225/12225881.png" alt="Profissional">
      </div>

      <div class="infos-container">
        <div class="g1">
          <div class="pila info-item">
            <p><strong>Data:</strong> {{ dataFormatada }}</p>
          </div>
          <div class="pila info-item">
            <p><strong>Sala:</strong> {{ atendimento.nomeSala || 'A definir' }}</p>
          </div>
        </div>

        <div class="g2">
          <div class="pila status-item">
            <p><strong>Status:</strong>
              <span :class="['status-valor', atendimento.status.toLowerCase()]">
                {{ atendimento.status }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="rodape" v-if="atendimento.status === 'CONFIRMADO'">
      <button class="btn btn-cancelar" @click="cancelarAtendimento">
        Cancelar atendimento
      </button>
    </div>

    <div class="rodape-vazio" v-else-if="atendimento.status === 'CANCELADO'">
      <div v-if="atendimento.justificativaFalta" class="container-justificativa">
        <p class="justificativa-texto">
          <strong>Justificativa do profissional:</strong> {{ atendimento.justificativaFalta }}
        </p>
      </div>
      <p v-else class="status-info-negativo">
        Este atendimento foi cancelado.
      </p>
    </div>

    <div class="rodape-vazio" v-else>
      <p class="status-info">Aguardando confirmação do profissional.</p>
    </div>
  </div>
</template>

<style scoped>
  .card-consulta {
    --primary: #128093;
    --danger: #d32f2f;
    --text-dark: #333;
    --border-color: #ddd;
    background-color: #ffffff;
    flex: 1 1 calc(50% - 30px);
    max-width: calc(50% - 15px);
    min-width: 350px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    padding: 25px;
    box-sizing: border-box;
  }

  .cabecalho h3 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: var(--primary);
    text-align: left;
  }

  .cabecalho {
    border-bottom: 1px solid var(--primary);
    margin-bottom: 20px;
  }

  .corpo {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .foto-container img {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    object-fit: cover;
  }

  .infos-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .g1 {
    display: flex;
    gap: 10px;
  }

  .pila {
    border: 1px solid var(--border-color);
    padding: 10px 15px;
    border-radius: 50px;
    background: #ffffff;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pila p {
    margin: 0;
    font-size: 14px;
    color: #444;
    text-align: center;
    line-height: 1.2;
  }

  .pila p strong {
    color: var(--text-dark);
    margin-right: 4px;
  }

  .status-valor {
    font-weight: 600;
  }

  .btn {
    flex: 1;
    height: 45px;
    background-color: #ffffff !important;
    font-weight: bold;
    font-size: 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    outline: none;
  }

  .g2 {
    display: flex;
  }

  .status-item {
    flex: 1;
  }

  .rodape {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 25px;
    width: 100%;
  }

  .btn-cancelar {
    border: 2px solid var(--danger);
    color: var(--danger);
    max-width: 200px;
  }

  .pendente { color: orange; }
  .confirmado { color: green; }
  .cancelado { color: red; }

  .rodape-vazio {
    margin-top: 25px;
    padding: 15px;
    background: #fdfdfd;
    border: 1px dashed #eee;
    border-radius: 10px;
    text-align: center;
  }

  .status-info { color: #888; font-size: 13px; }
  .status-info-negativo { color: #d32f2f; font-size: 13px; font-weight: bold; }

  .container-justificativa {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .justificativa-texto {
    font-size: 13px;
    color: #555;
    background: #fff0f0;
    padding: 8px;
    border-radius: 6px;
    border-left: 3px solid var(--danger);
    text-align: left;
    margin: 0;
  }

  .justificativa-texto strong {
    color: var(--danger);
  }

  @media (max-width: 1024px) {
    .card-consulta {
      flex: 1 1 100%;
      max-width: 100%;
      min-width: unset;
    }
  }
</style>
