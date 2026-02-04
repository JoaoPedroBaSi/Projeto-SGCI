<script setup lang="ts">
import GraficoPizza from '../graficos/GraficoPizza.vue';
import GraficoLinha from '../graficos/GraficoLinha.vue';
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const props = defineProps<{
  finalidade: string,
  chartData?: any,
  chartOptions?: any,
  qtdAgendadas?: number,
  qtdFinalizadas?: number,
  qtdPendentesPagamento?: number,
  qtdAguardandoConfirmacao?: number,
  titulo?: string
}>();
</script>
<template>
  <div v-if="finalidade === 'rendimento'" class="card">
    <div class="infos-rendimento">
      <p>{{ titulo }}:
        <span>
          {{ typeof chartData === 'number'
            ? chartData.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'R$ 0,00'
          }}
        </span>
      </p>
    </div>
  </div>

  <div v-else-if="finalidade === 'grafico-pagamentos'" class="card">
    <div class="texto">
      <p>STATUS DE PAGAMENTOS</p>
    </div>
    <div class="chart-container">
      <GraficoPizza v-if="chartData" :chartData="props.chartData" />
    </div>
  </div>

  <div v-else-if="finalidade === 'grafico-rendimento'" class="card rendimento">
    <div class="texto">
      <p>RENDIMENTO MENSAL</p>
    </div>
    <div class="chart-container">
      <GraficoLinha v-if="chartData && chartData.datasets[0].data.length > 0" :chartData="chartData" />
    </div>
  </div>

  <div v-else-if="finalidade === 'grafico-genero'" class="card">
    <div class="texto">
      <p>PERFIL POR GÊNERO</p>
    </div>
    <div class="chart-container">
      <GraficoPizza v-if="chartData" :chartData="chartData" />
    </div>
  </div>

  <div v-else-if="finalidade === 'grafico-idade'" class="card">
    <div class="texto">
      <p>FAIXA ETÁRIA DOS CLIENTES</p>
    </div>
    <div class="chart-container">
      <GraficoPizza v-if="chartData" :chartData="chartData" />
    </div>
  </div>

  <div v-else-if="finalidade === 'agenda'" class="card">
    <div class="texto">
      <p>AGENDA</p>
    </div>
    <div class="infos">
      <p><strong>{{ qtdAgendadas || 0 }}</strong> consultas na sua <RouterLink to="/profissional/agenda">agenda
        </RouterLink> de hoje</p>
      <p><strong>{{ qtdFinalizadas || 0 }}</strong> consultas no seu <RouterLink to="/profissional/historico">histórico
        </RouterLink>
      </p>
      <p>Aguardando pagamento de <strong>{{ qtdPendentesPagamento || 0 }}</strong> consultas</p>
    </div>
  </div>

  <div v-else-if="finalidade === 'aguardando-confirmacao'" class="card">
    <div class="conteudo-interno">
      <header class="status-header">
        <span class="label-status">Aguardando confirmação</span>
      </header>

      <main class="status-foco">
        <span class="numero-destaque">{{ qtdAguardandoConfirmacao }}</span>
        <span class="subtexto">pendentes</span>
      </main>

      <footer class="status-footer">
        <RouterLink to="/consulta/aprovacao" class="link-acao">
          Ver detalhes
          <span class="seta">→</span>
        </RouterLink>
      </footer>
    </div>
  </div>
</template>
<style scoped lang="css">
.card {
  display: flex;
  flex-direction: column;
  height: 280px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 4px 4px 8px 4px rgba(0, 0, 0, 0.1);
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
}

.conteudo-interno {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 30px;
}

.status-header {
  display: flex;
  justify-content: center;
}

.label-status {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-foco {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15px 0;
}

.numero-destaque {
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary, #128093);
  line-height: 1;
}

.subtexto {
  font-size: 0.85rem;
  color: #888;
  margin-top: 4px;
}

.link-acao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  color: var(--primary, #128093);
  font-weight: 700;
  font-size: 0.95rem;
  transition: transform 0.2s ease;
}

.link-acao:hover {
  transform: translateX(5px);
}

.seta {
  font-size: 1.2rem;
}

.card .texto {
  width: 100%;
  align-items: center;
}

.card .texto p {
  border-bottom: 2px solid #128093;
  text-align: center;
  padding-bottom: 20px;
  font-weight: bold;
  color: #128093;
  font-size: 18px;
}

.infos {
  text-align: justify;
  padding-left: 30px;
}

.link {
  text-align: center;
  font-size: 14px;
}

.link a {
  text-decoration: none;
}

.infos-rendimento p {
  font-size: 26px;
  text-align: center;
  font-weight: bold;
}

.infos-rendimento span {
  color: lightseagreen;
}

.rendimento {
  width: 100%;
}
</style>
