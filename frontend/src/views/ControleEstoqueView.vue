<script setup lang="ts">
import { ref, computed } from 'vue';
import ModalMovimentacao from '@/components/modals/ModalMovimentacao.vue';

// --- Interfaces para Tipagem ---
interface Produto {
  id: number;
  nome: string;
  codigo: string;
  categoria: string;
  lote: string;
  vence: string;
  venceAnoFull?: string;
  qtd: number;
  unidade: string;
  status: 'critico' | 'baixo' | 'normal';
}

interface Movimentacao {
  id: number;
  dataHora: string;
  responsavel: string;
  tipo: 'entrada' | 'saida';
  produto: string;
  qtd: number;
  unidade: string;
  lote: string;
}

interface LoteVencendo {
  id: number;
  produto: string;
  lote: string;
  vencimento: string;
  diasRestantes: number;
  acao: 'Descartar' | 'Priorizar Uso';
}

// --- Estado e Dados ---
const abaAtiva = ref<'visao-geral' | 'historico' | 'lotes'>('visao-geral');
const busca = ref('');
const modalAberto = ref(false);
const tipoMovimentacaoInicial = ref<'entrada' | 'saida'>('entrada');

const listaProdutos = ref<Produto[]>([
  { id: 1, nome: 'Seringa Descartável 5ml', codigo: 'COD-8821', categoria: 'Descartáveis', lote: '9982-A', vence: '10/Dez', qtd: 15, unidade: 'un', status: 'critico' },
  { id: 2, nome: 'Vacina Tetravalente', codigo: 'VAC-202', categoria: 'Imunizantes', lote: 'B-202', vence: 'Jun/2026', qtd: 40, unidade: 'un', status: 'baixo' },
  { id: 3, nome: 'Luva Látex (Tam M)', codigo: 'EPI-100', categoria: 'EPI', lote: '1102', vence: 'Indet.', qtd: 150, unidade: 'cx', status: 'normal' }
]);

const listaHistorico = ref<Movimentacao[]>([
  { id: 1, dataHora: 'Hoje, 14:30', responsavel: 'Dr. Marcos', tipo: 'saida', produto: 'Luva Látex (Tam M)', qtd: 2, unidade: 'cx', lote: '1102' },
  { id: 2, dataHora: 'Hoje, 09:15', responsavel: 'Gestor Admin', tipo: 'entrada', produto: 'Vacina HPV Quadri', qtd: 50, unidade: 'un', lote: 'HPV-99' }
]);

const listaLotes = ref<LoteVencendo[]>([
  { id: 1, produto: 'Seringa Descartável 5ml', lote: '9982-A', vencimento: '10 Dez 2025', diasRestantes: 2, acao: 'Descartar' },
  { id: 2, produto: 'Anestésico Lidocaína', lote: 'LIDO-55', vencimento: '20 Dez 2025', diasRestantes: 12, acao: 'Priorizar Uso' }
]);

// --- Métodos ---
function abrirModal(tipo: 'entrada' | 'saida') {
  tipoMovimentacaoInicial.value = tipo;
  modalAberto.value = true;
}

function processarMovimentacao(dados: any) {
  console.log('Dados processados:', dados);
  modalAberto.value = false;
  // Aqui entraria a chamada ao AdonisJS
}
</script>

<template>
  <div class="layout-wrapper">
    <header class="header-pagina">
      <div class="header-content">
        <div class="titulos">
          <h1 class="titulo-principal">Controle de Estoque</h1>
        </div>

        <div class="perfil-usuario">
          <div class="dados-usuario">
            <span class="nome">Nome do Usuário</span>
            <span class="email">usuario@gmail.com</span>
          </div>
          <div class="avatar-circle">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width:24px;">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <button class="btn-notificacao">
            <span class="badge">1</span>
            <svg viewBox="0 0 24 24" fill="#757575" width="24" height="24">
              <path
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="conteudo-pagina">
      <div class="container-limite">

        <section class="cards-resumo">
          <div class="card-kpi">
            <div class="kpi-icon money">$</div>
            <div class="kpi-info">
              <span class="kpi-label">VALOR EM ESTOQUE</span>
              <span class="kpi-value">R$45.280</span>
              <span class="kpi-sub positivo">↗ +12% esse mês</span>
            </div>
          </div>

          <div class="card-kpi">
            <div class="kpi-icon critical">!</div>
            <div class="kpi-info">
              <span class="kpi-label">ITENS CRÍTICOS</span>
              <span class="kpi-value red-text">3</span>
              <span class="kpi-sub red-text">Requer ação imediata</span>
            </div>
          </div>

          <div class="card-kpi">
            <div class="kpi-icon low">!</div>
            <div class="kpi-info">
              <span class="kpi-label">ESTOQUE BAIXO</span>
              <span class="kpi-value yellow-text">5</span>
              <span class="kpi-sub yellow-text">Solicitar reposição+</span>
            </div>
          </div>

          <div class="card-kpi">
            <div class="kpi-icon move">⇄</div>
            <div class="kpi-info">
              <span class="kpi-label">MOVIMENTAÇÕES HOJE</span>
              <span class="kpi-value">24</span>
              <span class="kpi-sub">14 Entradas / 10 Saídas</span>
            </div>
          </div>
        </section>

        <section class="acoes-container">
          <nav class="abas">
            <button :class="['aba-btn', { active: abaAtiva === 'visao-geral' }]" @click="abaAtiva = 'visao-geral'">Visão
              Geral</button>
            <button :class="['aba-btn', { active: abaAtiva === 'historico' }]" @click="abaAtiva = 'historico'">Histórico
              de Movimentação</button>
            <button :class="['aba-btn', { active: abaAtiva === 'lotes' }]" @click="abaAtiva = 'lotes'">Lotes
              Vencendo</button>
          </nav>

          <div class="botoes-movimentacao">
            <button class="btn-entrada" @click="abrirModal('entrada')">⬇ Nova Entrada</button>
            <button class="btn-saida" @click="abrirModal('saida')">⬆ Nova Saída</button>
          </div>
        </section>

        <section class="conteudo-tabela">
          <div class="barra-filtro">
            <input type="text" v-model="busca" placeholder="Busca por nome, código ou lote" class="input-search">
            <button class="btn-filtros">Filtros ⌄</button>
          </div>

          <table class="tabela-custom" v-if="abaAtiva === 'visao-geral'">
            <thead>
              <tr>
                <th>PRODUTO / INSUMO</th>
                <th>CATEGORIA</th>
                <th>LOTE / VALIDADE</th>
                <th>QTD. ATUAL</th>
                <th>STATUS</th>
                <th class="text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in listaProdutos" :key="item.id"
                :class="{ 'bg-critico-light': item.status === 'critico', 'bg-baixo-light': item.status === 'baixo' }">
                <td>
                  <div class="col-produto">
                    <span class="nome-prod">{{ item.nome }}</span>
                    <span class="cod-prod">{{ item.codigo }}</span>
                  </div>
                </td>
                <td>{{ item.categoria }}</td>
                <td>
                  <div class="col-lote">
                    <span>Lote: {{ item.lote }}</span>
                    <span :class="{ 'text-red': item.status === 'critico' }">Vence: {{ item.vence }}</span>
                  </div>
                </td>
                <td class="font-bold font-color-main">{{ item.qtd }} {{ item.unidade }}</td>
                <td>
                  <span :class="['badge-status', item.status]">
                    <span class="dot">●</span> {{ item.status.toUpperCase() }}
                  </span>
                </td>
                <td class="text-right">
                  <button v-if="item.status === 'critico'" class="btn-acao">Comprar</button>
                  <button v-else-if="item.status === 'baixo'" class="btn-acao">Repor</button>
                  <button v-else class="btn-acao">Detalhes</button>
                </td>
              </tr>
            </tbody>
          </table>

          <table class="tabela-custom" v-if="abaAtiva === 'historico'">
            <thead>
              <tr>
                <th>DATA/HORA</th>
                <th>RESPONSÁVEL</th>
                <th>TIPO</th>
                <th>PRODUTO</th>
                <th>QTD.</th>
                <th class="text-right">LOTE</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mov in listaHistorico" :key="mov.id">
                <td>{{ mov.dataHora }}</td>
                <td>{{ mov.responsavel }}</td>
                <td>
                  <span :class="['badge-tipo', mov.tipo]">
                    {{ mov.tipo.toUpperCase() }}
                  </span>
                </td>
                <td>{{ mov.produto }}</td>
                <td>
                  <span v-if="mov.tipo === 'entrada'">+ {{ mov.qtd }} {{ mov.unidade }}</span>
                  <span v-else>- {{ mov.qtd }} {{ mov.unidade }}</span>
                </td>
                <td class="text-right">{{ mov.lote }}</td>
              </tr>
            </tbody>
          </table>

          <table class="tabela-custom" v-if="abaAtiva === 'lotes'">
            <thead>
              <tr>
                <th>PRODUTO</th>
                <th>LOTE</th>
                <th>VENCIMENTO</th>
                <th>DIAS RESTANTES</th>
                <th class="text-right">AÇÃO RECOMENDADA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lote in listaLotes" :key="lote.id"
                :class="{ 'bg-critico-light': lote.diasRestantes <= 5, 'bg-baixo-light': lote.diasRestantes > 5 && lote.diasRestantes < 15 }">
                <td class="font-bold">{{ lote.produto }}</td>
                <td>{{ lote.lote }}</td>
                <td :class="{ 'text-red': lote.diasRestantes <= 5, 'text-yellow': lote.diasRestantes > 5 }">{{
                  lote.vencimento }}</td>
                <td>
                  <span :class="['badge-dias', lote.diasRestantes <= 5 ? 'critico' : 'alerta']">
                    {{ lote.diasRestantes }} DIAS
                  </span>
                </td>
                <td class="text-right">
                  <button class="btn-acao-outline">{{ lote.acao }}</button>
                </td>
              </tr>
            </tbody>
          </table>

        </section>

      </div>
    </main>

    <ModalMovimentacao :visivel="modalAberto" :tipoInicial="tipoMovimentacaoInicial" @ao-fechar="modalAberto = false"
      @ao-confirmar="processarMovimentacao" />
  </div>
</template>

<style scoped>
/* ESTRUTURA GLOBAL */
.layout-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #F0F2F5;
  width: 100%;
  min-height: 100vh;
}

.header-pagina {
  background-color: #FFFFFF;
  padding: 15px 40px;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.titulo-principal {
  font-size: 1.6rem;
  color: #2CAFB6;
  font-weight: 700;
  margin: 0;
}

.perfil-usuario {
  display: flex;
  align-items: center;
  gap: 15px;
}

.dados-usuario {
  text-align: right;
}

.nome {
  display: block;
  font-weight: 700;
  color: #555;
  font-size: 0.9rem;
}

.email {
  color: #999;
  font-size: 0.8rem;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background-color: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.btn-notificacao {
  background: none;
  border: none;
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #FF5252;
  color: white;
  font-size: 0.6rem;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.conteudo-pagina {
  padding: 30px 40px;
  width: 100%;
  box-sizing: border-box;
}

.container-limite {
  max-width: 1600px;
  margin: 0 auto;
}

.cards-resumo {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.card-kpi {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.kpi-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.kpi-icon.money {
  background: #E8F5E9;
  color: #2E7D32;
}

.kpi-icon.critical {
  background: #FFEBEE;
  color: #C62828;
}

.kpi-icon.low {
  background: #FFF8E1;
  color: #F9A825;
}

.kpi-icon.move {
  background: #E3F2FD;
  color: #1565C0;
}

.kpi-info {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.75rem;
  color: #999;
  font-weight: 700;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.kpi-sub {
  font-size: 0.75rem;
  margin-top: 4px;
  color: #888;
  font-weight: 600;
}

.kpi-sub.positivo {
  color: #4CAF50;
}

.kpi-sub.red-text {
  color: #FF5252;
}

.kpi-sub.yellow-text {
  color: #F9A825;
}

.red-text {
  color: #FF5252;
}

.yellow-text {
  color: #F9A825;
}

/* Navegação e Botões */
.acoes-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0px;
}

.abas {
  display: flex;
  gap: 20px;
}

.aba-btn {
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: #888;
  padding: 10px 5px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: 0.2s;
}

.aba-btn:hover {
  color: #2CAFB6;
}

.aba-btn.active {
  color: #2CAFB6;
  border-bottom-color: #2CAFB6;
}

.botoes-movimentacao {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.btn-entrada {
  background: #fff;
  border: 1px solid #ddd;
  color: #333;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-saida {
  background: #3B82F6;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

/* Tabela e Filtros */
.conteudo-tabela {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  padding: 20px;
}

.barra-filtro {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.input-search {
  width: 400px;
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fafafa;
}

.btn-filtros {
  background: white;
  border: 1px solid #eee;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
}

.tabela-custom {
  width: 100%;
  border-collapse: collapse;
}

.tabela-custom th {
  text-align: left;
  font-size: 0.75rem;
  color: #999;
  font-weight: 700;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.tabela-custom td {
  padding: 15px;
  font-size: 0.9rem;
  color: #444;
  vertical-align: middle;
  border-bottom: 1px solid #f9f9f9;
}

.text-right {
  text-align: right;
}

.text-red {
  color: #FF5252;
  font-weight: 600;
}

.text-yellow {
  color: #F9A825;
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.font-color-main {
  color: #F9A825;
}

.bg-critico-light {
  background-color: #FFF5F5;
}

.bg-baixo-light {
  background-color: #FFFDE7;
}

.col-produto {
  display: flex;
  flex-direction: column;
}

.nome-prod {
  font-weight: 700;
  color: #333;
}

.cod-prod {
  font-size: 0.8rem;
  color: #888;
}

.col-lote {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.badge-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.badge-status.critico {
  background: #FFEBEE;
  color: #D32F2F;
  border: 1px solid #FFCDD2;
}

.badge-status.baixo {
  background: #FFF8E1;
  color: #F57F17;
  border: 1px solid #FFECB3;
}

.badge-status.normal {
  background: #E8F5E9;
  color: #2E7D32;
  border: 1px solid #C8E6C9;
}

.dot {
  font-size: 1.2em;
  line-height: 0;
}

.badge-tipo {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-tipo.entrada {
  background: #E8F5E9;
  color: #2E7D32;
}

.badge-tipo.saida {
  background: #FFEBEE;
  color: #D32F2F;
}

.badge-dias {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
}

.badge-dias.critico {
  background: #FFEBEE;
  color: #D32F2F;
}

.badge-dias.alerta {
  background: #FFF8E1;
  color: #F57F17;
}

.btn-acao {
  background: white;
  border: 1px solid #eee;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-acao:hover {
  background: #f5f5f5;
}

.btn-acao-outline {
  background: transparent;
  border: 1px solid #ddd;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
}

.bg-critico-light .btn-acao-outline {
  border-color: #FF5252;
  color: #FF5252;
  background: white;
}
</style>
