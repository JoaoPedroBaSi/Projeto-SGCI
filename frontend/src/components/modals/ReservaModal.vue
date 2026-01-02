<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { reservaService } from '@/services/reservaService';

interface Sala {
  id: number;
  nome: string;
  preco: number;
}

const props = defineProps<{
  visivel: boolean;
  sala: Sala | null;
}>();

const emit = defineEmits(['ao-fechar', 'ao-confirmar', 'ao-notificar']);

const abaAtiva = ref<'avulso' | 'recorrente'>('avulso');
const enviando = ref(false);

// --- ESTADOS AVULSO ---
const dataSelecionada = ref(new Date().toISOString().split('T')[0]);
const horariosSelecionados = ref<string[]>([]);
const horariosDisponiveis = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00'
];

// --- ESTADOS RECORRENTE (Visual apenas por enquanto) ---
const recDataInicio = ref('2025-10-26');
const recDataFim = ref('2025-11-26');
const recHoraInicio = ref('07:00');
const recHoraFim = ref('12:00');
const diasSemanaSelecionados = ref<number[]>([1, 3]);

const diasOpcoes = [
  { label: 'D', value: 0 },
  { label: 'S', value: 1 },
  { label: 'T', value: 2 },
  { label: 'Q', value: 3 },
  { label: 'Q', value: 4 },
  { label: 'S', value: 5 },
  { label: 'S', value: 6 },
];

watch(() => props.visivel, (val) => {
  if (val) {
    abaAtiva.value = 'avulso'; // Sempre reseta para avulso ao abrir
    horariosSelecionados.value = [];
    enviando.value = false;
  }
});

function toggleHorario(hora: string) {
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

// --- CÁLCULOS ---
const totalEstimado = computed(() => {
  const precoHora = props.sala?.preco || 0;

  if (abaAtiva.value === 'avulso') {
    return horariosSelecionados.value.length * precoHora;
  } else {
    // Cálculo estimado do recorrente
    const inicio = horaParaDecimal(recHoraInicio.value);
    const fim = horaParaDecimal(recHoraFim.value);
    let horasPorDia = Math.max(0, fim - inicio);
    return horasPorDia * diasSemanaSelecionados.value.length * 4 * precoHora;
  }
});

const infoPacoteRecorrente = computed(() => {
  const inicio = horaParaDecimal(recHoraInicio.value);
  const fim = horaParaDecimal(recHoraFim.value);
  const horasPorDia = Math.max(0, fim - inicio);
  const diasCount = diasSemanaSelecionados.value.length;
  const totalHorasMes = horasPorDia * diasCount * 4;
  return { dias: diasCount, horasTurno: horasPorDia, totalHoras: totalHorasMes };
});

async function confirmarERedirecionar() {
  if (!props.sala) return;

  // 1. Bloqueio da funcionalidade Recorrente (pois não tem backend ainda)
  if (abaAtiva.value === 'recorrente') {
    emit('ao-notificar', {
      mensagem: 'Agendamento recorrente em breve! Use o modo avulso.',
      tipo: 'info'
    });
    return;
  }

  // 2. Validação Avulso
  if (horariosSelecionados.value.length === 0) {
    emit('ao-notificar', { mensagem: 'Selecione pelo menos um horário.', tipo: 'erro' });
    return;
  }

  // 3. Pega Usuário (Login Check)
  const usuarioString = localStorage.getItem('usuario');
  let profissionalId = null;

  if (usuarioString) {
    try {
      const usuarioLogado = JSON.parse(usuarioString);
      profissionalId = usuarioLogado.id;
    } catch (e) {
      console.error("Erro ao ler dados do usuário", e);
    }
  }

  if (!profissionalId) {
    emit('ao-notificar', { mensagem: 'Sessão expirada. Faça login novamente.', tipo: 'erro' });
    return;
  }

  enviando.value = true;

  try {
    // Loop para criar cada reserva individualmente
    for (const hora of horariosSelecionados.value) {
      const dataInicioIso = `${dataSelecionada.value}T${hora}`;

      // Calcula DataFim (1 hora depois)
      const dataFimDate = new Date(`${dataSelecionada.value}T${hora}`);
      dataFimDate.setHours(dataFimDate.getHours() + 1);

      // Formatação manual
      const ano = dataFimDate.getFullYear();
      const mes = String(dataFimDate.getMonth() + 1).padStart(2, '0');
      const dia = String(dataFimDate.getDate()).padStart(2, '0');
      const horaF = String(dataFimDate.getHours()).padStart(2, '0');
      const minF = String(dataFimDate.getMinutes()).padStart(2, '0');
      const dataFimIso = `${ano}-${mes}-${dia}T${horaF}:${minF}`;

      // O Backend vai salvar apenas as datas e IDs.
      // O valor financeiro será calculado no Checkout frontend.
      await reservaService.criar({
        salaId: props.sala.id,
        profissionalId: profissionalId,
        dataHoraInicio: dataInicioIso,
        dataHoraFim: dataFimIso,
        // Status virá como PENDENTE por padrão no backend
        // PagamentoEfetuado virá como false
      });
    }

    // SUCESSO!
    // Enviamos o TOTAL calculado aqui para o pai usar no redirecionamento
    emit('ao-confirmar', { total: totalEstimado.value.toFixed(2) });

  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 409) {
      emit('ao-notificar', { mensagem: 'Conflito: ' + error.response.data.message, tipo: 'erro' });
    } else if (error.response?.status === 404) {
      emit('ao-notificar', { mensagem: 'Profissional não encontrado no banco.', tipo: 'erro' });
    } else {
      const msg = error.response?.data?.message || error.message;
      emit('ao-notificar', { mensagem: 'Erro ao criar reserva: ' + msg, tipo: 'erro' });
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
        <h2 class="titulo-modal">{{ sala?.nome }}</h2>
        <span class="subtitulo-modal">Configure sua reserva</span>
        <button class="btn-fechar" @click="emit('ao-fechar')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="tabs">
          <button :class="['tab-btn', { active: abaAtiva === 'avulso' }]" @click="abaAtiva = 'avulso'">
            Horário Avulso
          </button>
          <button :class="['tab-btn', { active: abaAtiva === 'recorrente' }]" @click="abaAtiva = 'recorrente'">
            Recorrente / Turno
          </button>
        </div>

        <div class="tab-padding">

          <div v-if="abaAtiva === 'avulso'">
            <label class="label-input">DATA</label>
            <div class="input-wrapper mb-4">
              <input type="date" v-model="dataSelecionada" class="form-input">
            </div>

            <label class="label-input">HORÁRIOS DISPONÍVEIS (1h)</label>
            <div class="grid-horarios">
              <button v-for="hora in horariosDisponiveis" :key="hora"
                :class="['btn-hora', { selecionado: horariosSelecionados.includes(hora) }]"
                @click="toggleHorario(hora)">
                {{ hora }}
              </button>
            </div>

            <div class="box-info azul">
              <strong>ℹ Informação</strong>
              <p>Verifique a capacidade. Selecione múltiplos horários para aumentar o tempo de uso.</p>
            </div>
          </div>

          <div v-else>
            <div class="row-dates">
              <div class="col">
                <label class="label-input">DE</label>
                <input type="date" v-model="recDataInicio" class="form-input">
              </div>
              <div class="col">
                <label class="label-input">ATÉ</label>
                <input type="date" v-model="recDataFim" class="form-input">
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
          </div>

        </div>
      </div>

      <div class="modal-footer">
        <div class="total-area">
          <span class="label-total">Total Estimado</span>
          <span class="valor-total">R${{ totalEstimado.toFixed(2).replace('.', ',') }}</span>
        </div>

        <div v-if="abaAtiva === 'recorrente'" class="box-pacote-footer">
          <p>Pacote: <strong>{{ infoPacoteRecorrente.dias }} dias/semana</strong> (turno de {{
            infoPacoteRecorrente.horasTurno }}h).</p>
          <p>Estimativa: <strong>{{ infoPacoteRecorrente.totalHoras }} horas</strong> no mês.</p>
        </div>

        <button class="btn-confirmar" :disabled="enviando" @click="confirmarERedirecionar">
          {{ enviando ? 'Processando...' : 'Confirmar Reserva' }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ESTRUTURA MODAL */
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

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  position: relative;
  flex-shrink: 0;
}

.titulo-modal {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.subtitulo-modal {
  font-size: 0.85rem;
  color: #888;
}

.btn-fechar {
  position: absolute;
  right: 20px;
  top: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
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

/* INPUTS E FORMULÁRIOS */
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

.text-center {
  text-align: center;
}

.input-wrapper {
  width: 100%;
}

/* GRID HORARIOS (AVULSO) */
.grid-horarios {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
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
}

.btn-hora:hover {
  border-color: #2CAFB6;
  color: #2CAFB6;
}

.btn-hora.selecionado {
  background-color: #2CAFB6;
  color: white;
  border-color: #2CAFB6;
}

/* LAYOUT RECORRENTE */
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

/* BOXES */
.box-info {
  padding: 15px;
  border-radius: 6px;
  font-size: 0.85rem;
  line-height: 1.4;
}

.box-info.azul {
  background-color: #E3F2FD;
  color: #1565C0;
  border: 1px solid #BBDEFB;
}

.box-pacote-footer {
  background-color: #F8F9FA;
  border: 1px solid #EEE;
  border-radius: 6px;
  padding: 10px 15px;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 15px;
}

.box-pacote-footer p {
  margin: 2px 0;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
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

.btn-confirmar:hover {
  background-color: #259aa0;
}

.btn-confirmar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
