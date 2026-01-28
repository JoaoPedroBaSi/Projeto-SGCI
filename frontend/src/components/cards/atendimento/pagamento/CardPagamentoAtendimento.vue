<script lang="ts" setup>
import api from '@/services/api';
import { computed } from 'vue';

const props = defineProps<{
  atendimento: any
}>();

const emit = defineEmits(['pagar']);

const dataFormatada = computed(() => {
  const data = new Date(props.atendimento.dataHoraInicio);
  return data.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
});
</script>

<template>
  <div class="card-consulta" v-if="atendimento.status === 'CONCLUIDO'">
    <div class="cabecalho">
      <h3>Pagamento: {{ atendimento.profissional?.nome || 'Profissional' }}</h3>
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
        </div>

        <div class="g2">
          <div class="pila status-item">
            <p><strong>Valor:</strong>
              <span class="valor-destaque">
                R$ {{ atendimento.valor || '0,00' }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .card-consulta {
    --primary: #128093;
    --success: #28a745;
    --text-dark: #333;
    --border-color: #eee;
    background-color: #ffffff;
    width: 100%;
    max-width: 45%;
    display: inline-block;
    vertical-align: top;
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    padding: 25px;
    box-sizing: border-box;
    margin: 10px;
    border: 2px solid red;
  }

  .cabecalho {
    border-bottom: 2px solid var(--primary);
    margin-bottom: 20px;
    padding-bottom: 10px;
  }

  .cabecalho h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--primary);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .corpo {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .foto-container img {
    width: 65px;
    height: 65px;
    border-radius: 12px; /* Mudei para levemente arredondado para diferenciar */
    object-fit: cover;
    background: #f9f9f9;
  }

  .infos-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pila {
    border: 1px solid var(--border-color);
    padding: 8px 15px;
    border-radius: 8px;
    background: #fcfcfc;
    flex: 1;
  }

  .pila p {
    margin: 0;
    font-size: 14px;
    color: #555;
  }

  .valor-destaque {
    font-weight: 800;
    color: var(--text-dark);
    font-size: 1.1rem;
  }

  .rodape {
    margin-top: 20px;
  }

  .btn-pagar {
    width: 100%;
    height: 50px;
    background-color: var(--primary) !important;
    color: white !important;
    border: none;
    font-weight: 800;
    font-size: 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.2s, filter 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  .btn-pagar:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    .card-consulta {
      max-width: 100%;
      margin: 10px 0;
    }
  }
</style>
