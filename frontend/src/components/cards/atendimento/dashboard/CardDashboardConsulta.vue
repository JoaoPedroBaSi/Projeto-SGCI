<script setup lang="ts">
import type { Atendimento } from '@/types';
import { computed } from 'vue';

const props = defineProps<{
  consulta: Atendimento;
}>();

defineEmits(['detalhar']);

const dataBase = computed(() => {
  return props.consulta.dataHoraInicio ? new Date(props.consulta.dataHoraInicio) : null;
});

const dataExibida = computed(() => {
  if (!dataBase.value) return 'Data não disponível';
  return dataBase.value.toLocaleDateString('pt-BR');
});

const horaExibida = computed(() => {
  if (!dataBase.value) return '--:--';
  return dataBase.value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
});

const valorFormatado = computed(() => {
  const v = props.consulta.valor;
  if (v === null || v === undefined) return null;

  const valorNumerico = Number(v);
  if (isNaN(valorNumerico)) return null;

  return valorNumerico.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
});

const statusClass = computed(() => {
  const s = props.consulta.status?.toLowerCase();
  if (s === 'confirmado') return 'status-verde';
  if (s === 'cancelado') return 'status-vermelho';
  return 'status-padrao';
});
</script>

<template>
  <div class="card" v-if="props.consulta.status === 'CONFIRMADO'">
    <header class="cabecalho">
      <img src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=300"
        alt="Foto do Profissional" class="foto">
      <div class="titulo">
        <h4>{{ props.consulta.nomeProfissional || 'Profissional' }}</h4>
        <span :class="['badge', statusClass]">{{ props.consulta.status }}</span>
      </div>
    </header>

    <div class="corpo">
      <div class="info-item">
        <label>Data</label>
        <p>{{ dataExibida }} às {{ horaExibida }}</p>
      </div>

      <div class="info-item">
        <label>Valor</label>
        <p v-if="valorFormatado">{{ valorFormatado }}</p>
        <p v-else class="texto-alerta">A definir</p>
      </div>

      <div class="info-item full">
        <label>Pagamento</label>
        <p v-if="!props.consulta.statusPagamento" class="texto-alerta">Após a consulta</p>
        <p v-else>{{ props.consulta.statusPagamento }}</p>
      </div>
    </div>

    <footer class="rodape">
      <button @click="$emit('detalhar', props.consulta)" class="btn-link">
        Ver detalhes →
      </button>
    </footer>
  </div>
</template>

<style scoped>
.card {
  width: 350px;
  flex: 0 0 350px;
  background-color: #ffffff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e6ed;
  scroll-snap-align: start;
  padding: 20px;
  transition: transform 0.3s ease;
  margin-bottom: 10px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.cabecalho {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.foto {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #128093;
}

.titulo h4 {
  margin: 0;
  color: #128093;
  font-size: 1.1rem;
}

.badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  font-weight: bold;
}

.status-verde {
  background: #e6f4ea;
  color: #1e7e34;
}

.status-vermelho {
  background: #fce8e6;
  color: #d93025;
}

.status-padrao {
  background: #f1f3f4;
  color: #5f6368;
}

.corpo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item label {
  display: block;
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 4px;
}

.info-item p {
  margin: 0;
  font-weight: 500;
  color: #333;
}

.info-item.full {
  grid-column: span 2;
}

.texto-alerta {
  color: #d93025;
  font-style: italic;
}

.rodape {
  margin-top: auto;
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.link-detalhes {
  text-decoration: none;
  color: #128093;
  font-weight: bold;
  font-size: 0.9rem;
}

.link-detalhes span {
  transition: margin-left 0.2s;
}

.link-detalhes:hover span {
  margin-left: 8px;
}

.btn-link {
  background-color: transparent;
  border: none;
  font-size: 14px;
  font-weight: bold;
  color: #128093;
  cursor: pointer;
  transition: gap 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.btn-link:hover {
  text-decoration: underline;
}

@media screen and (max-width: 600px) {
  .card {
    flex: 0 0 280px;
    width: 280px;
  }
}

@media screen and (max-width: 900px) {
  .card {
    flex: 0 0 85%;
    width: 85%;
  }
}
</style>
