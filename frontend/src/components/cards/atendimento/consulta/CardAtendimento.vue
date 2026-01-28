<script setup lang="ts">
import { computed } from 'vue';
import type { Atendimento } from '@/types/index';

const props = defineProps<{
  consulta: Atendimento
}>();

// Formatações Reutilizáveis
const dataHoraFormatada = computed(() => {
  const dataBruta = props.consulta?.dataHoraInicio;
  if (!dataBruta) return 'Data não disponível';

  // Divide e garante que temos a parte da data
  const dataParte = dataBruta.split('T')[0];
  if (!dataParte) return 'Data inválida';

  const [ano, mes, dia] = dataParte.split('-');
  return `${dia}/${mes}/${ano}`;
});

const horaFormatada = computed(() => {
  const dataBruta = props.consulta?.dataHoraInicio;
  if (!dataBruta) return '--:--';

  // Divide a string e pega a segunda parte (após o T)
  const partes = dataBruta.split('T');
  const horaParte = partes[1]; // Aqui o TS ainda acha que pode ser undefined

  // Verificação explícita para o TypeScript
  if (!horaParte) return '--:--';

  return horaParte.substring(0, 5);
});

const valorFormatado = computed(() => {
  // Converte para Number, garantindo que mesmo se vier String, funcione
  const v = Number(props.consulta.valor);

  // Verifica se o resultado é um número válido e não zero/nulo
  if (!v || isNaN(v)) return 'R$ 0,00'; // Ou return null se preferir esconder

  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
});

// Lógica de Cores para Badges
const getStatusClass = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'concluido') return 'status-verde';
  if (s === 'confirmado') return 'status-azul';
  return 'status-padrao';
};

const getPagamentoClass = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'pago') return 'status-verde';
  if (s === 'pendente') return 'status-laranja';
  if (['cancelado', 'negado'].includes(s)) return 'status-vermelho';
  return 'status-azul';
};

</script>

<template>
  <div class="card" v-if="props.consulta.status !== 'CANCELADO'">
    <div class="card-header-top">
      <p>CONSULTA COM {{ props.consulta.nomeProfissional?.toUpperCase() }}</p>
    </div>

    <div class="card-content">
      <header class="perfil-section">
        <img
          src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=300"
          alt="Foto do Profissional"
          class="foto-profissional"
        >
        <div class="perfil-infos">
          <div class="badges-row">
            <span class="info-tag">{{ dataHoraFormatada }}</span>
            <span class="info-tag">{{ horaFormatada }}</span>
          </div>
          <span :class="['badge-status', getStatusClass(props.consulta.status)]">
            {{ props.consulta.status }}
          </span>
        </div>
      </header>

      <div class="detalhes-grid">
        <div class="detalhe-item full">
          <label>Sala</label>
          <p>{{ props.consulta.nomeSala || 'Não informado' }}</p>
        </div>

        <div class="detalhe-item full observacoes">
          <label>Observações</label>
          <p>{{ props.consulta.observacoes || 'Sem observações.' }}</p>
        </div>

        <div class="detalhe-item">
          <label>Valor</label>
          <p v-if="valorFormatado">{{ valorFormatado }}</p>
          <p v-else class="texto-alerta">Aguardando análise</p>
        </div>

        <div class="detalhe-item">
          <label>Pagamento</label>
          <span :class="['badge-status', getPagamentoClass(props.consulta.statusPagamento || '')]">
            {{ props.consulta.statusPagamento || 'APÓS O ATENDIMENTO' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estrutura Principal */
.card {
  width: 100%;
  max-width: 500px;
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e6ed;
}

.card-header-top {
  background-color: #128093;
  padding: 12px 20px;
}

.card-header-top p {
  color: white;
  margin: 0;
  font-weight: bold;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.card-content {
  padding: 20px;
}

/* Seção Perfil */
.perfil-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f4f8;
  margin-bottom: 20px;
}

.foto-profissional {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f4f8;
}

.perfil-infos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badges-row {
  display: flex;
  gap: 8px;
}

.info-tag {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
}

/* Grid de Detalhes */
.detalhes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detalhe-item label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: bold;
  margin-bottom: 4px;
}

.detalhe-item p {
  margin: 0;
  font-weight: 500;
  color: #1e293b;
}

.detalhe-item.full {
  grid-column: span 2;
}

.observacoes {
  background: #f8fafc;
  padding: 10px;
  border-radius: 8px;
  min-height: 60px;
}

.texto-alerta {
  color: #e11d48 !important;
  font-size: 0.9rem;
}

/* Badges de Status */
.badge-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
  width: fit-content;
}

.status-verde { background: #dcfce7; color: #166534; }
.status-azul { background: #dbeafe; color: #1e40af; }
.status-laranja { background: #ffedd5; color: #9a3412; }
.status-vermelho { background: #fee2e2; color: #991b1b; }
.status-padrao { background: #f1f5f9; color: #475569; }

/* Rodapé e Botão */
.card-footer {
  padding: 15px 20px;
  background: #f8fafc;
  display: flex;
  justify-content: center;
}

.btn-cancelar {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background-color: #ef4444;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancelar:hover {
  background-color: #dc2626;
}
</style>
