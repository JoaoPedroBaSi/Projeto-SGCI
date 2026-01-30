<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  qtdAtendimentosConfirmados: number
  qtdAtendimentosAguardandoPagamento: number
  qtdAtendimentosNoHistorico: number
  finalidade: 'CONFIRMADO' | 'AGUARDANDO' | 'CONCLUIDO'
}>();

const config = computed(() => {
  const map = {
    CONFIRMADO: {
      label: 'Atendimentos Agendados',
      valor: props.qtdAtendimentosConfirmados,
      link: '/cliente/consultas',
      linkText: 'Ver consultas',
      cor: '#2ecc71'
    },
    AGUARDANDO: {
      label: 'Pagamentos Pendentes',
      valor: props.qtdAtendimentosAguardandoPagamento,
      link: '/cliente/consultas/pagar',
      linkText: 'Realizar Pagamento',
      cor: '#f1c40f'
    },
    CONCLUIDO: {
      label: 'Histórico de Atendimentos',
      valor: props.qtdAtendimentosNoHistorico,
      link: '/cliente/historico',
      linkText: 'Ver histórico',
      cor: '#128093'
    }
  };
  return map[props.finalidade];
});
</script>

<template>
  <div class="card-moderno">
    <div class="header-card">
      <span class="label">{{ config.label }}</span>
    </div>

    <div class="body-card">
      <h2 class="valor">{{ config.valor }}</h2>
    </div>

    <div class="footer-card" v-if="config.link">
      <RouterLink :to="config.link" class="link">
        {{ config.linkText }} <span class="seta">→</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.card-moderno {
  --primary-color: #128093;
  --border-color: #eef2f3;

  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
  border: 1px solid var(--border-color);
  min-height: 200px;
}

.card-moderno:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Estilização do Header com a Borda */
.header-card {
  padding: 16px 20px;
  border-bottom: 2px solid var(--border-color); /* A borda solicitada */
  background-color: #fafbfc;
}

.label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #64748b;
  display: block;
  text-align: center;
}

/* Corpo do Card */
.body-card {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.valor {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

/* Rodapé */
.footer-card {
  padding: 12px;
  background-color: #ffffff;
  text-align: center;
}

.link {
  text-decoration: none;
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.link:hover {
  background-color: #f0f9fa;
}

.seta {
  margin-left: 4px;
}
</style>
