<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import type { Atendimento, Profissional } from '@/types';
import api from '@/services/api';

interface AtendimentoDashboard extends Atendimento {
  nomeProfissional?: string;
  funcaoProfissional?: string;
  nomeSala?: string;
}

const props = defineProps<{
  consulta: AtendimentoDashboard;
  pagina: string;
  listaProfissionais?: Profissional[];
}>();

const feedback = reactive({
  mensagem: '',
  tipo: ''
});

const exibirFeedback = (msg: string, tipo: 'sucesso' | 'erro') => {
  feedback.mensagem = msg;
  feedback.tipo = tipo;
};

const emit = defineEmits(['atualizado']);

const exibindoModalEdicao = ref(false);
const carregando = ref(false);

const formularioEdicao = reactive({
  profissional_id: props.consulta.profissionalId,
  data: props.consulta.dataHoraInicio?.split('T')[0] || '',
  hora: props.consulta.dataHoraInicio?.split('T')[1]?.substring(0, 5) || '',
  forma_pagamento: props.consulta.formaPagamento,
  observacoes: props.consulta.observacoes || ''
});

const cancelarAtendimento = async () => {
  const confirmacao = confirm("Deseja realmente cancelar?");
  if (!confirmacao) return;

  carregando.value = true;

  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

    if (!token) {
      exibirFeedback("❌ Erro: Token não encontrado", "erro");
      return;
    }

    await api.patch(`/atendimento/${props.consulta.id}/cancelar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    exibirFeedback("✅ Cancelado com sucesso!", "sucesso");
    setTimeout(() => emit('atualizado'), 1500);

  } catch (error: any) {
    const msg = error.response?.data?.message || "Erro desconhecido";
    exibirFeedback(`❌ ${msg}`, "erro");
  } finally {
    carregando.value = false;
  }
};

const salvarEdicao = async () => {
  carregando.value = true;
  feedback.mensagem = '';

  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

    const payload = {
      profissionalId: Number(formularioEdicao.profissional_id),
      dataHoraInicio: `${formularioEdicao.data}T${formularioEdicao.hora}:00.000Z`,
      observacoes: formularioEdicao.observacoes,
      forma_pagamento: formularioEdicao.forma_pagamento
    };

    await api.put(`/atendimento/${props.consulta.id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    exibirFeedback("✅ Alterações salvas com sucesso!", "sucesso");

    setTimeout(() => {
      exibindoModalEdicao.value = false;
      feedback.mensagem = '';
      emit('atualizado');
    }, 1500);

  } catch (error: any) {
    const msgBackend = error.response?.data?.message || "Erro ao editar atendimento.";
    exibirFeedback(`${msgBackend}`, "erro");
  } finally {
    carregando.value = false;
  }
};

const formatarDataHora = (isoString: string | undefined, soHora = false) => {
  if (!isoString) return soHora ? '' : '---';

  const dataObjeto = new Date(isoString);

  if (soHora) {
    const horas = String(dataObjeto.getHours()).padStart(2, '0');
    const minutos = String(dataObjeto.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  const dia = String(dataObjeto.getDate()).padStart(2, '0');
  const mes = String(dataObjeto.getMonth() + 1).padStart(2, '0');
  const ano = dataObjeto.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

const dataInicio = computed(() => formatarDataHora(props.consulta.dataHoraInicio));
const horaInicio = computed(() => formatarDataHora(props.consulta.dataHoraInicio, true));

const valorFormatado = computed(() => {
  const valor = Number(props.consulta.valor);
  return isNaN(valor) ? 'R$ 0,00' : valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
});

const formaPagamentoFormatada = computed(() => {
  const nomes: Record<string, string> = { 'PIX': 'Pix', 'DEBITO': 'Débito', 'CREDITO': 'Crédito', 'DINHEIRO': 'Dinheiro', 'BOLETO': 'Boleto' };
  const pgto = props.consulta.formaPagamento || props.consulta.forma_pagamento;
  return pgto ? (nomes[pgto.toUpperCase()] || pgto) : 'Não informado';
});

const deveMostrarCard = computed(() => {
  const status = props.consulta.status;

  if (props.pagina === 'historico') {
    return ['CONCLUIDO', 'CANCELADO'].includes(status);
  }

  if (props.pagina === 'agenda') {
    return ['CONFIRMADO', 'PENDENTE'].includes(status);
  }

  return true;
});

</script>

<template>
  <div class="card-atendimento-wrapper">

    <div class="card" v-if="deveMostrarCard">

      <div class="coluna-profissional">
        <h3 class="nome">
          {{ props.pagina === 'historico' && props.consulta.funcaoProfissional === 'Paciente' ? '' : 'Dr(a). ' }}
          {{ props.consulta.nomeProfissional || 'Profissional' }}
        </h3>
        <span class="funcao">{{ props.consulta.funcaoProfissional || 'Especialista' }}</span>

        <div :class="['badge-pagamento', (props.consulta.statusPagamento || '').toLowerCase()]">
          Status: {{ props.consulta.status || 'Indefinido' }}
        </div>
      </div>

      <div class="coluna-horario">
        <div class="tempo-grupo">
          <div class="ponto">
            <small>DATA E HORA</small>
            <p>{{ dataInicio }} às <strong>{{ horaInicio }}</strong></p>
          </div>
        </div>
      </div>

      <div class="coluna-detalhes">
        <div class="detalhe-item">
          <span class="label">SALA</span>
          <span class="valor-sala">{{ props.consulta.nomeSala || '---' }}</span>
        </div>
        <div class="detalhe-item">
          <span class="label">MÉTODO</span>
          <span class="valor-metodo">{{ formaPagamentoFormatada }}</span>
        </div>
      </div>

      <div class="coluna-acoes" v-if="props.pagina === 'agenda'">
        <button class="btn-editar" @click="exibindoModalEdicao = true" :disabled="carregando">Editar</button>
        <button class="btn-cancelar" @click="cancelarAtendimento" :disabled="carregando">Cancelar</button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="exibindoModalEdicao" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Editar Atendimento</h3>
          </div>

          <div v-if="feedback.mensagem" :class="['alerta', feedback.tipo]">
            {{ feedback.mensagem }}
          </div>

          <div class="modal-body" v-if="!carregando">
            <div class="campo">
              <label>Profissional:</label>
              <select v-model="formularioEdicao.profissional_id">
                <option value="" disabled>Selecione um profissional</option>
                <option v-for="prof in props.listaProfissionais" :key="prof.id" :value="prof.id">
                  {{ prof.nome }}
                </option>
              </select>
            </div>

            <div class="grupo-input">
              <div class="campo">
                <label>Data:</label>
                <input type="date" v-model="formularioEdicao.data">
              </div>
              <div class="campo">
                <label>Hora:</label>
                <input type="time" v-model="formularioEdicao.hora">
              </div>
            </div>

            <div class="campo">
              <label>Forma de Pagamento:</label>
              <select v-model="formularioEdicao.forma_pagamento">
                <option value="DINHEIRO">DINHEIRO</option>
                <option value="PIX">PIX</option>
                <option value="CREDITO">CREDITO</option>
                <option value="DEBITO">DEBITO</option>
                <option value="BOLETO">BOLETO</option>
              </select>
            </div>

            <div class="campo">
              <label>Observação:</label>
              <textarea v-model="formularioEdicao.observacoes"></textarea>
            </div>
          </div>

          <div v-else class="carregando-container">
            <p>Processando requisição...</p>
          </div>

          <div class="modal-acoes" v-if="!carregando">
            <button @click="exibindoModalEdicao = false" class="btn-voltar">Voltar</button>
            <button @click="salvarEdicao" class="btn-salvar">Salvar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.card-atendimento-wrapper {
  display: contents;
}

.card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1000px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 20px 30px;
  margin-bottom: 20px;
  gap: 15px;
}

.coluna-profissional {
  flex: 1;
}

.coluna-horario {
  flex: 1.5;
  border-left: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

.coluna-detalhes {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.coluna-acoes {
  flex: 0.8;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-editar {
  background-color: #128093;
  color: white;
  padding: 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancelar {
  background-color: transparent;
  border: 1.5px solid #ff4d4d;
  background-color: #ff4d4d;
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-editar:hover,
.btn-cancelar:hover {
  opacity: 0.9;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 15px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header h3 {
  color: #128093;
  margin: 0 0 15px 0;
  border-bottom: 2px solid #128093;
  padding-bottom: 5px;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.campo label {
  font-size: 13px;
  font-weight: bold;
  color: #666;
  margin-bottom: 4px;
}

.campo input,
.campo select,
.campo textarea {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-family: inherit;
}

.grupo-input {
  display: flex;
  gap: 10px;
}

.grupo-input .campo {
  flex: 1;
}

.modal-acoes {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-voltar {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: none;
  cursor: pointer;
}

.btn-salvar {
  flex: 1.5;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #366c00;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.nome {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.funcao {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-transform: uppercase;
}

.badge-pagamento {
  margin-top: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  background: #eee;
  display: inline-block;
}

.badge-pagamento.pago {
  background: #e6f4ea;
  color: #1e7e34;
}

.badge-pagamento.pendente {
  background: #fff4e5;
  color: #905805;
}

.label {
  font-size: 10px;
  color: #95a5a6;
  font-weight: bold;
}

.valor-preco {
  font-size: 1.2rem;
  font-weight: 800;
  color: #128093;
}

.alerta {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.sucesso {
  border: 1px solid #366c00;
  color: #366c00;
  background-color: rgba(54, 108, 0, 0.1);
}

.erro {
  border: 1px solid #ff0000;
  color: #ff0000;
  background-color: rgba(255, 0, 0, 0.1);
}

.carregando-container {
  padding: 40px;
  text-align: center;
  color: #128093;
  font-weight: bold;
}

@media screen and (max-width: 850px) {
  .card {
    flex-direction: column;
    padding: 20px;
  }

  .coluna-horario {
    border: none;
    padding: 10px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    width: 100%;
  }

  .coluna-detalhes {
    align-items: center;
  }

  .coluna-acoes {
    flex-direction: row;
    width: 100%;
  }

  .btn-editar,
  .btn-cancelar {
    flex: 1;
  }
}
</style>
