<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { reservaService } from '@/services/reservaService';

interface Sala {
  id: number;
  nome: string;
  preco: number;
  capacidadePacientes: number; 
}

const props = defineProps<{
  visivel: boolean;
  sala: Sala | null;
}>();

const emit = defineEmits(['ao-fechar', 'ao-confirmar', 'ao-notificar']);

const abaAtiva = ref<'avulso' | 'recorrente'>('avulso');
const enviando = ref(false);

// Controle de disponibilidade
const carregandoOcupados = ref(false);
const horariosOcupados = ref<string[]>([]); // Lista de horas ocupadas (ex: "08:00")

const hoje = new Date().toISOString().split('T')[0];

// --- ESTADOS AVULSO ---
const dataSelecionada = ref(hoje);
const horariosSelecionados = ref<string[]>([]);
const horariosDisponiveis = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00'
];

// --- ESTADOS RECORRENTE ---
const recDataInicio = ref(hoje);
const dataFutura = new Date();
dataFutura.setDate(dataFutura.getDate() + 30);
const recDataFim = ref(dataFutura.toISOString().split('T')[0]);

const recHoraInicio = ref('08:00');
const recHoraFim = ref('12:00');
const diasSemanaSelecionados = ref<number[]>([1, 3]);

const diasOpcoes = [
  { label: 'D', value: 0 }, { label: 'S', value: 1 }, { label: 'T', value: 2 },
  { label: 'Q', value: 3 }, { label: 'Q', value: 4 }, { label: 'S', value: 5 }, { label: 'S', value: 6 },
];

// --- BUSCA DE OCUPADOS---
async function buscarDisponibilidade() {
  if (!props.sala || !dataSelecionada.value || abaAtiva.value !== 'avulso') return;

  carregandoOcupados.value = true;
  horariosOcupados.value = [];

  try {
    const reservas = await reservaService.buscarOcupados(props.sala.id, dataSelecionada.value);

    // Processa o retorno para extrair apenas a HORA
    horariosOcupados.value = reservas.map((r: any) => {
      if (!r.dataHoraInicio) return '';
      const dataObj = new Date(r.dataHoraInicio);
      // Pega a hora local ou UTC
      const horas = String(dataObj.getHours()).padStart(2, '0');
      const minutos = String(dataObj.getMinutes()).padStart(2, '0');
      return `${horas}:${minutos}`;
    });

    // Remove seleções do usuário que agora colidem com ocupados
    horariosSelecionados.value = horariosSelecionados.value.filter(h => !horariosOcupados.value.includes(h));

  } catch (error) {
    console.error("Erro ao buscar disponibilidade", error);
  } finally {
    carregandoOcupados.value = false;
  }
}

watch(() => props.visivel, (val) => {
  if (val) {
    abaAtiva.value = 'avulso';
    horariosSelecionados.value = [];
    enviando.value = false;
    buscarDisponibilidade();
  }
});

watch(() => dataSelecionada.value, () => {
  if (props.visivel) buscarDisponibilidade();
});

watch(() => abaAtiva.value, (val) => {
  if (val === 'avulso') buscarDisponibilidade();
});


function toggleHorario(hora: string) {
  if (horariosOcupados.value.includes(hora)) return; // Bloqueia clique

  if (horariosSelecionados.value.includes(hora)) {
    horariosSelecionados.value = horariosSelecionados.value.filter(h => h !== hora);
  } else {
    horariosSelecionados.value.push(hora);
  }
}

function toggleDiaSemana(diaIdx: number) {
  if (diasSemanaSelecionados.value.includes(diaIdx)) {
    diasSemanaSelecionados.value = diasSemanaSelecionados.value.filter(d => d !== diaIdx);
  } else {
    diasSemanaSelecionados.value.push(diaIdx);
  }
}

function horaParaDecimal(horaStr: string): number {
  if (!horaStr) return 0;
  const [h, m] = horaStr.split(':').map(Number);
  return h + (m / 60);
}

const datasGeradasPreview = computed(() => {
  if (abaAtiva.value !== 'recorrente' || !recDataInicio.value || !recDataFim.value) return [];

  const listaPreview: string[] = [];
  let cursor = new Date(recDataInicio.value + 'T12:00:00');
  const fim = new Date(recDataFim.value + 'T12:00:00');

  let count = 0;
  while (cursor <= fim && count < 100) {
    if (diasSemanaSelecionados.value.includes(cursor.getDay())) {
      const dia = String(cursor.getDate()).padStart(2, '0');
      const mes = String(cursor.getMonth() + 1).padStart(2, '0');
      const ano = cursor.getFullYear();
      listaPreview.push(`${dia}/${mes}/${ano}`);
    }
    cursor.setDate(cursor.getDate() + 1);
    count++;
  }
  return listaPreview;
});

// --- CÁLCULO TOTAL ---
const totalEstimado = computed(() => {
  const precoHora = props.sala?.preco || 0;

  if (abaAtiva.value === 'avulso') {
    return horariosSelecionados.value.length * precoHora;
  } else {
    const inicioH = horaParaDecimal(recHoraInicio.value);
    const fimH = horaParaDecimal(recHoraFim.value);
    const horasPorDia = Math.max(0, fimH - inicioH);
    const diasCount = datasGeradasPreview.value.length;
    return diasCount * horasPorDia * precoHora;
  }
});

// --- ENVIO ---
function gerarListaRecorrenteBackend() {
  const lista: { inicio: string, fim: string }[] = [];
  if (!recDataInicio.value || !recDataFim.value) return [];

  let cursor = new Date(recDataInicio.value + 'T12:00:00');
  const fim = new Date(recDataFim.value + 'T12:00:00');

  while (cursor <= fim) {
    const diaSemana = cursor.getDay();
    if (diasSemanaSelecionados.value.includes(diaSemana)) {
      const ano = cursor.getFullYear();
      const mes = String(cursor.getMonth() + 1).padStart(2, '0');
      const dia = String(cursor.getDate()).padStart(2, '0');
      const dataIso = `${ano}-${mes}-${dia}`;
      lista.push({
        inicio: `${dataIso}T${recHoraInicio.value}`,
        fim: `${dataIso}T${recHoraFim.value}`
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return lista;
}

async function confirmarERedirecionar() {
  if (!props.sala) return;

  const usuarioString = localStorage.getItem('usuario');
  let profissionalId = null;
  if (usuarioString) {
    try { profissionalId = JSON.parse(usuarioString).id; }
    catch (e) { console.error(e); }
  }

  if (!profissionalId) {
    emit('ao-notificar', { mensagem: 'Sessão expirada. Faça login novamente.', tipo: 'erro' });
    return;
  }

  let listaParaEnviar: { inicio: string, fim: string }[] = [];

  if (abaAtiva.value === 'avulso') {
    if (horariosSelecionados.value.length === 0) {
      emit('ao-notificar', { mensagem: 'Selecione pelo menos um horário.', tipo: 'erro' });
      return;
    }
    listaParaEnviar = horariosSelecionados.value.map(hora => {
      const dataInicioIso = `${dataSelecionada.value}T${hora}`;
      const dataFimDate = new Date(dataInicioIso);
      dataFimDate.setHours(dataFimDate.getHours() + 1);

      const ano = dataFimDate.getFullYear();
      const mes = String(dataFimDate.getMonth() + 1).padStart(2, '0');
      const dia = String(dataFimDate.getDate()).padStart(2, '0');
      const horaF = String(dataFimDate.getHours()).padStart(2, '0');
      const minF = String(dataFimDate.getMinutes()).padStart(2, '0');
      return { inicio: dataInicioIso, fim: `${ano}-${mes}-${dia}T${horaF}:${minF}` };
    });
  } else {
    if (recDataInicio.value < hoje) {
      emit('ao-notificar', { mensagem: 'Início não pode ser no passado.', tipo: 'erro' });
      return;
    }
    if (diasSemanaSelecionados.value.length === 0) {
      emit('ao-notificar', { mensagem: 'Selecione os dias da semana.', tipo: 'erro' });
      return;
    }
    listaParaEnviar = gerarListaRecorrenteBackend();
    if (listaParaEnviar.length === 0) {
      emit('ao-notificar', { mensagem: 'Nenhuma data válida encontrada no período.', tipo: 'erro' });
      return;
    }
  }

  enviando.value = true;
  try {
    const resposta = await reservaService.criarEmLote({
      salaId: props.sala.id,
      profissionalId: profissionalId,
      horarios: listaParaEnviar
    });
    emit('ao-confirmar', { total: resposta.valorTotal });
  } catch (error: any) {
    if (error.response?.status === 409) {
      emit('ao-notificar', { mensagem: 'Conflito: ' + error.response.data.message, tipo: 'erro' });
    } else {
      const msg = error.response?.data?.message || error.message;
      emit('ao-notificar', { mensagem: 'Erro: ' + msg, tipo: 'erro' });
    }
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div v-if="visivel" class="modal-overlay" @click.self="emit('ao-fechar')">
    <div class="modal-container">

      <div class="modal-header">
        <div class="header-top">
          <h2 class="titulo-modal">{{ sala?.nome }}</h2>
          <button class="btn-fechar" @click="emit('ao-fechar')">&times;</button>
        </div>
        <div class="detalhes-sala">
          <span class="badge-sala">R$ {{ sala?.preco?.toFixed(2) }}/h</span>
          <span class="badge-sala" v-if="sala?.capacidadePacientes">
            Capacidade: {{ sala?.capacidadePacientes }} pessoas
          </span>
        </div>
      </div>

      <div class="modal-body">
        <div class="tabs">
          <button :class="['tab-btn', { active: abaAtiva === 'avulso' }]" @click="abaAtiva = 'avulso'">Horário
            Avulso</button>
          <button :class="['tab-btn', { active: abaAtiva === 'recorrente' }]"
            @click="abaAtiva = 'recorrente'">Recorrente / Turno</button>
        </div>

        <div class="tab-padding">

          <div v-if="abaAtiva === 'avulso'">
            <label class="label-input">DATA</label>
            <div class="input-wrapper mb-4">
              <input type="date" v-model="dataSelecionada" :min="hoje" class="form-input">
            </div>

            <div class="flex-between">
              <label class="label-input">HORÁRIOS</label>
              <span v-if="carregandoOcupados" class="loading-text">Verificando agenda...</span>
            </div>

            <div class="grid-horarios">
              <button v-for="hora in horariosDisponiveis" :key="hora" :disabled="horariosOcupados.includes(hora)"
                :class="['btn-hora', {
                  selecionado: horariosSelecionados.includes(hora),
                  ocupado: horariosOcupados.includes(hora)
                }]" @click="toggleHorario(hora)">
                {{ hora }}
                <span v-if="horariosOcupados.includes(hora)" class="tag-ocupado">OCP</span>
              </button>
            </div>

            <div class="legenda">
              <span class="dot livre"></span> Livre
              <span class="dot ocupado"></span> Ocupado
              <span class="dot selecionado"></span> Selecionado
            </div>
          </div>

          <div v-else>
            <div class="row-dates">
              <div class="col">
                <label class="label-input">DE</label>
                <input type="date" v-model="recDataInicio" :min="hoje" class="form-input">
              </div>
              <div class="col">
                <label class="label-input">ATÉ</label>
                <input type="date" v-model="recDataFim" :min="recDataInicio" class="form-input">
              </div>
            </div>

            <label class="label-input mt-4">DIAS DA SEMANA</label>
            <div class="dias-semana">
              <button v-for="diaObj in diasOpcoes" :key="diaObj.value"
                :class="['circle-day', { active: diasSemanaSelecionados.includes(diaObj.value) }]"
                @click="toggleDiaSemana(diaObj.value)">
                {{ diaObj.label }}
              </button>
            </div>

            <label class="label-input mt-4">HORÁRIO DO TURNO</label>
            <div class="row-dates">
              <div class="col flex-center">
                <input type="time" v-model="recHoraInicio" class="form-input text-center">
              </div>
              <span class="ate-txt">às</span>
              <div class="col flex-center">
                <input type="time" v-model="recHoraFim" class="form-input text-center">
              </div>
            </div>

            <label class="label-input mt-4">DATAS SELECIONADAS ({{ datasGeradasPreview.length }})</label>
            <div class="lista-datas-preview">
              <span v-for="dataStr in datasGeradasPreview" :key="dataStr" class="chip-data">
                {{ dataStr }}
              </span>
              <span v-if="datasGeradasPreview.length === 0" class="text-muted">
                Nenhuma data encontrada. Verifique o período e os dias.
              </span>
            </div>

          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="total-area">
          <span class="label-total">Total Estimado</span>
          <span class="valor-total">R${{ totalEstimado.toFixed(2).replace('.', ',') }}</span>
        </div>

        <button class="btn-confirmar"
          :disabled="enviando || (abaAtiva === 'avulso' && horariosSelecionados.length === 0) || (abaAtiva === 'recorrente' && datasGeradasPreview.length === 0)"
          @click="confirmarERedirecionar">
          {{ enviando ? 'Processando...' : 'Confirmar Reserva' }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  width: 500px;
  max-width: 95%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: 90vh;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

/* HEADER */
.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.titulo-modal {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.btn-fechar {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.detalhes-sala {
  display: flex;
  gap: 10px;
  font-size: 0.85rem;
  color: #666;
}

.badge-sala {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.modal-body {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* TABS */
.tabs {
  display: flex;
  border-bottom: 2px solid #eee;
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 15px;
  background: none;
  border: none;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.95rem;
}

.tab-btn.active {
  color: #2CAFB6;
  border-bottom-color: #2CAFB6;
}

.tab-padding {
  padding: 25px;
}

/* INPUTS */
.label-input {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #555;
  font-family: inherit;
  box-sizing: border-box;
}

.input-wrapper {
  width: 100%;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

/* GRID E BOTÕES */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.loading-text {
  font-size: 0.8rem;
  color: #f39c12;
}

.grid-horarios {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.btn-hora {
  padding: 8px 0;
  border: 1px solid #eee;
  background: #F8F9FA;
  border-radius: 6px;
  cursor: pointer;
  color: #555;
  font-weight: 600;
  transition: all 0.2s;
  position: relative;
}

.btn-hora:hover:not(:disabled) {
  border-color: #2CAFB6;
  color: #2CAFB6;
}

.btn-hora.selecionado {
  background-color: #2CAFB6;
  color: white;
  border-color: #2CAFB6;
}

.btn-hora:disabled,
.btn-hora.ocupado {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  border-color: #ddd;
}

.tag-ocupado {
  font-size: 0.6rem;
  position: absolute;
  top: 2px;
  right: 2px;
  color: #777;
}

/* LEGENDA */
.legenda {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: #666;
  margin-top: 10px;
  justify-content: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
}

.dot.livre {
  background: #F8F9FA;
  border: 1px solid #ccc;
}

.dot.ocupado {
  background: #e0e0e0;
}

.dot.selecionado {
  background: #2CAFB6;
}

/* RECORRENTE */
.row-dates {
  display: flex;
  gap: 15px;
  align-items: center;
  width: 100%;
}

.col {
  flex: 1;
  min-width: 0;
}

.ate-txt {
  color: #888;
  font-weight: 600;
  font-size: 0.9rem;
}

.dias-semana {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.circle-day {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.circle-day:hover {
  border-color: #2CAFB6;
  color: #2CAFB6;
}

.circle-day.active {
  background-color: #00BCD4;
  color: white;
  border-color: #00BCD4;
}

.lista-datas-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-height: 100px;
  overflow-y: auto;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #eee;
}

.chip-data {
  font-size: 0.75rem;
  background: #e3f2fd;
  color: #1565c0;
  padding: 2px 8px;
  border-radius: 10px;
}

.text-muted {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
}

.text-center {
  text-align: center;
}

/* FOOTER */
.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eee;
  background-color: #fff;
  flex-shrink: 0;
}

.total-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.label-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.valor-total {
  font-size: 1.3rem;
  font-weight: 800;
  color: #333;
}

.btn-confirmar {
  width: 100%;
  background-color: #2CAFB6;
  color: white;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirmar:hover:not(:disabled) {
  background-color: #259aa0;
}

.btn-confirmar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
