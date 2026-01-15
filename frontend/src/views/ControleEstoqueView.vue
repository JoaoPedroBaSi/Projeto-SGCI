<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ModalMovimentacao from '@/components/modals/ModalMovimentacao.vue';
import { estoqueService, type InventarioItem, type MovimentacaoHistorico } from '@/services/estoqueService';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

const abaAtiva = ref<'visao-geral' | 'historico' | 'alertas'>('visao-geral');
const busca = ref('');
const modalAberto = ref(false);
const tipoMovimentacaoInicial = ref<'ENTRADA' | 'SAIDA'>('ENTRADA');
const idProdutoPreSelecionado = ref<number | null>(null);
const carregando = ref(true);

const listaProdutos = ref<InventarioItem[]>([]);
const listaHistorico = ref<MovimentacaoHistorico[]>([]);
const usuarioLogado = ref({ nome: 'Usuário', email: '', id: 0 });

onMounted(async () => {
  carregarDados();
  const userStr = localStorage.getItem('usuario');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      usuarioLogado.value = { nome: u.nome, email: u.email, id: u.id };
    } catch (e) { }
  }
});

async function carregarDados() {
  carregando.value = true;
  try {
    const [itens, historico] = await Promise.all([
      estoqueService.listarItens(),
      estoqueService.listarHistorico()
    ]);
    listaProdutos.value = itens;
    listaHistorico.value = historico;
  } catch (error) {
    console.error("Erro ao carregar estoque:", error);
  } finally {
    carregando.value = false;
  }
}

function criarDataLocal(isoString: string | null) {
  if (!isoString) return null;
  const dataPart = isoString.split('T')[0];
  const [ano, mes, dia] = dataPart.split('-').map(Number);
  return new Date(ano, mes - 1, dia, 12, 0, 0);
}

const produtosComputados = computed(() => {
  let lista = listaProdutos.value;

  if (busca.value && busca.value.trim() !== '') {
    const termo = busca.value.toLowerCase().trim();
    lista = lista.filter(p =>
      (p.nome && p.nome.toLowerCase().includes(termo)) ||
      (p.lote && p.lote.toLowerCase().includes(termo))
    );
  }

  return lista.map(p => {
    let status: 'critico' | 'baixo' | 'normal' = 'normal';
    let venceFormatado = 'Indeterminado';
    let diasRestantes = 9999;
    let estaVencido = false;
    let venceEmBreve = false;

    if (p.validade) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const validadeLocal = criarDataLocal(p.validade);

      if (validadeLocal) {
        const diffTime = validadeLocal.getTime() - hoje.getTime();
        diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        venceFormatado = validadeLocal.toLocaleDateString('pt-BR');
        estaVencido = diasRestantes < 0;
        venceEmBreve = diasRestantes >= 0 && diasRestantes <= 60;
      }
    }

    if (p.quantidade === 0 || estaVencido) {
      status = 'critico';
    } else if (p.quantidade <= p.pontoReposicao || venceEmBreve) {
      status = 'baixo';
    }

    return {
      ...p,
      status,
      venceFormatado,
      diasRestantes,
      motivoAlerta: estaVencido ? 'VENCIDO' : (p.quantidade === 0 ? 'ESTOQUE ZERADO' : (venceEmBreve ? 'VENCE EM BREVE' : 'ESTOQUE BAIXO'))
    };
  });
});

const historicoFiltrado = computed(() => {
  let lista = listaHistorico.value;

  if (busca.value && busca.value.trim() !== '') {
    const termo = busca.value.toLowerCase().trim();
    lista = lista.filter(h =>
      (h.inventario?.nome || '').toLowerCase().includes(termo) ||
      (h.profissional?.nome || '').toLowerCase().includes(termo) ||
      (h.tipo || '').toLowerCase().includes(termo)
    );
  }
  return lista;
});

const listaAlertas = computed(() => {
  return produtosComputados.value
    .filter(p => p.status !== 'normal')
    .sort((a, b) => {
      if (a.status === 'critico' && b.status !== 'critico') return -1;
      if (a.status !== 'critico' && b.status === 'critico') return 1;
      return a.diasRestantes - b.diasRestantes;
    });
});

const kpiEstoqueBaixo = computed(() => produtosComputados.value.filter(p => p.status === 'baixo').length);
const kpiCriticos = computed(() => produtosComputados.value.filter(p => p.status === 'critico').length);

function abrirModal(tipo: 'ENTRADA' | 'SAIDA', produtoId: number | null = null) {
  tipoMovimentacaoInicial.value = tipo;
  idProdutoPreSelecionado.value = produtoId;
  modalAberto.value = true;
}

async function processarMovimentacao(dados: any) {
  if (!usuarioLogado.value.id) {
    alert("Erro: Usuário não identificado.");
    return;
  }
  try {
    await estoqueService.novaMovimentacao({
      id_item: dados.id_item,
      id_profissional: usuarioLogado.value.id,
      tipo: dados.tipo,
      quantidade: dados.quantidade,
      observacao: dados.observacao
    });
    await carregarDados();
    modalAberto.value = false;
    alert("Movimentação registrada!");
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Erro ao processar';
    alert(msg);
  }
}

function formatarDataHora(isoString: string) {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });
}
</script>

<template>
  <DashboardLayout>
    <div class="layout-wrapper">
      <header class="header-pagina">
        <div class="header-content">
          <div class="titulos">
            <h1 class="titulo-principal">Controle de Estoque</h1>
          </div>
          <div class="perfil-usuario">
            <div class="dados-usuario">
              <span class="nome">{{ usuarioLogado.nome }}</span>
              <span class="email">{{ usuarioLogado.email }}</span>
            </div>
            <div class="avatar-circle">
              <span>{{ usuarioLogado.nome.charAt(0) }}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="conteudo-pagina">
        <div class="container-limite">

          <section class="cards-resumo">
            <div class="card-kpi">
              <div class="kpi-icon critical">!</div>
              <div class="kpi-info">
                <span class="kpi-label">ITENS CRÍTICOS</span>
                <span class="kpi-value red-text">{{ kpiCriticos }}</span>
                <span class="kpi-sub red-text">Zerados ou Vencidos</span>
              </div>
            </div>
            <div class="card-kpi">
              <div class="kpi-icon low">!</div>
              <div class="kpi-info">
                <span class="kpi-label">ESTOQUE BAIXO</span>
                <span class="kpi-value yellow-text">{{ kpiEstoqueBaixo }}</span>
                <span class="kpi-sub yellow-text">Reposição necessária</span>
              </div>
            </div>
            <div class="card-kpi">
              <div class="kpi-icon move">⇄</div>
              <div class="kpi-info">
                <span class="kpi-label">MOVIMENTAÇÕES</span>
                <span class="kpi-value">{{ listaHistorico.length }}</span>
                <span class="kpi-sub">Total registrado</span>
              </div>
            </div>
          </section>

          <section class="acoes-container">
            <nav class="abas">
              <button :class="['aba-btn', { active: abaAtiva === 'visao-geral' }]" @click="abaAtiva = 'visao-geral'">
                Visão Geral
              </button>
              <button :class="['aba-btn', { active: abaAtiva === 'historico' }]" @click="abaAtiva = 'historico'">
                Histórico
              </button>
              <button :class="['aba-btn', { active: abaAtiva === 'alertas' }]" @click="abaAtiva = 'alertas'">
                Alertas de Estoque
              </button>
            </nav>
            <div class="botoes-movimentacao">
              <button class="btn-entrada" @click="abrirModal('ENTRADA')">⬇ Nova Entrada</button>
              <button class="btn-saida" @click="abrirModal('SAIDA')">⬆ Nova Saída</button>
            </div>
          </section>

          <section class="conteudo-tabela">
            <div v-if="carregando" class="loading-state">Carregando dados...</div>

            <div v-else>
              <div class="barra-filtro">
                <input type="text" v-model="busca" placeholder="Busca por nome, lote ou responsável..."
                  class="input-search">
              </div>

              <table class="tabela-custom" v-if="abaAtiva === 'visao-geral'">
                <thead>
                  <tr>
                    <th>PRODUTO</th>
                    <th>TIPO</th>
                    <th>LOTE / VALIDADE</th>
                    <th>QTD. ATUAL</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in produtosComputados" :key="item.id"
                    :class="{ 'bg-critico-light': item.status === 'critico', 'bg-baixo-light': item.status === 'baixo' }">
                    <td>
                      <div class="col-produto">
                        <span class="nome-prod">{{ item.nome }}</span>
                      </div>
                    </td>
                    <td>{{ item.tipo }}</td>
                    <td>
                      <div class="col-lote">
                        <span>Lote: {{ item.lote || '-' }}</span>
                        <span :class="{ 'text-red': item.diasRestantes < 0 }">
                          {{ item.venceFormatado !== 'Indeterminado' ? 'Vence: ' + item.venceFormatado : '-' }}
                        </span>
                      </div>
                    </td>
                    <td class="font-bold font-color-main">{{ item.quantidade }} {{ item.unidadeMedida }}</td>
                    <td>
                      <span :class="['badge-status', item.status]">
                        <span class="dot">●</span> {{ item.status.toUpperCase() }}
                      </span>
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
                    <th>OBS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="mov in historicoFiltrado" :key="mov.id">
                    <td>{{ formatarDataHora(mov.createdAt) }}</td>
                    <td>{{ mov.profissional?.nome || 'Admin' }}</td>
                    <td>
                      <span :class="['badge-tipo', mov.tipo === 'ENTRADA' ? 'entrada' : 'saida']">
                        {{ mov.tipo }}
                      </span>
                    </td>
                    <td>{{ mov.inventario?.nome || 'Item excluído' }}</td>
                    <td>
                      <span v-if="mov.tipo === 'ENTRADA'">+ {{ mov.quantidade }}</span>
                      <span v-else>- {{ mov.quantidade }}</span>
                    </td>
                    <td class="text-small">{{ mov.observacao || '-' }}</td>
                  </tr>
                  <tr v-if="historicoFiltrado.length === 0">
                    <td colspan="6" class="text-center padding-lg">Nenhum histórico encontrado para esta busca.</td>
                  </tr>
                </tbody>
              </table>

              <table class="tabela-custom" v-if="abaAtiva === 'alertas'">
                <thead>
                  <tr>
                    <th>PRODUTO</th>
                    <th>SITUAÇÃO</th>
                    <th>DETALHE</th>
                    <th>DIAS P/ VENCER</th>
                    <th class="text-right">AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in listaAlertas" :key="item.id"
                    :class="{ 'bg-critico-light': item.status === 'critico', 'bg-baixo-light': item.status === 'baixo' }">

                    <td class="font-bold">{{ item.nome }}</td>

                    <td>
                      <span :class="['badge-status', item.status]">
                        {{ item.motivoAlerta }}
                      </span>
                    </td>

                    <td>
                      <div v-if="item.motivoAlerta === 'VENCIDO' || item.motivoAlerta === 'VENCE EM BREVE'">
                        Lote: {{ item.lote || 'N/A' }} <br>
                        <span class="text-red font-bold">{{ item.venceFormatado }}</span>
                      </div>
                      <div v-else>
                        Restam: <span class="font-bold">{{ item.quantidade }} {{ item.unidadeMedida }}</span> <br>
                        <span class="text-small">Min: {{ item.pontoReposicao }}</span>
                      </div>
                    </td>

                    <td>
                      <span v-if="item.diasRestantes !== 9999"
                        :class="['badge-dias', item.diasRestantes <= 0 ? 'critico' : 'alerta']">
                        {{ item.diasRestantes <= 0 ? 'VENCIDO' : item.diasRestantes + ' DIAS' }} </span>
                          <span v-else class="text-small">-</span>
                    </td>

                    <td class="text-right">
                      <button v-if="item.diasRestantes <= 0 && item.diasRestantes !== 9999"
                        class="btn-acao-outline text-red" @click="abrirModal('SAIDA', item.id)">
                        Descartar
                      </button>

                      <button v-else class="btn-acao-outline text-yellow" @click="abrirModal('ENTRADA', item.id)">
                        Solicitar Reposição
                      </button>
                    </td>
                  </tr>
                  <tr v-if="listaAlertas.length === 0">
                    <td colspan="5" class="text-center padding-lg">
                      <span class="text-green">✔ Tudo certo! Nenhum alerta de estoque no momento.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>

      <ModalMovimentacao :visivel="modalAberto" :tipoInicial="tipoMovimentacaoInicial" :listaOpcoes="listaProdutos"
        :idPreSelecionado="idProdutoPreSelecionado" @ao-fechar="modalAberto = false"
        @ao-confirmar="processarMovimentacao" />
    </div>
  </DashboardLayout>
</template>

<style scoped>
.text-center {
  text-align: center;
}

.padding-lg {
  padding: 30px;
  color: #888;
}

.text-green {
  color: #2E7D32;
  font-weight: 600;
}

.text-small {
  font-size: 0.8rem;
  color: #777;
  font-style: italic;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #888;
  font-size: 1.2rem;
}

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

.red-text {
  color: #FF5252;
}

.yellow-text {
  color: #F9A825;
}

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

.btn-acao-outline {
  background: transparent;
  border: 1px solid #ddd;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
  cursor: pointer;
}

.btn-acao-outline:hover {
  background-color: #fafafa;
}

.bg-critico-light .btn-acao-outline {
  border-color: #FF5252;
  color: #FF5252;
  background: white;
}
</style>
