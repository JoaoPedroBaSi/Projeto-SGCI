<script lang="ts" setup>
import api from '@/services/api';
import type { Atendimento } from '@/types';
import { computed, ref } from 'vue';

const props = defineProps<{
  atendimento: Atendimento,
  nomeCliente: string
}>();

const emit = defineEmits(['atualizado']);

const carregando = ref(false);
const exibindoModal = ref(false);
const valorEditado = ref(props.atendimento.valor || 0);

const salvarEdicao = async () => {
  const token = localStorage.getItem('token');
  const valorNumerico = Number(valorEditado.value);
  carregando.value = true;
  try {
    await api.put(`/atendimento/${props.atendimento.id}`,
      { valor: valorNumerico },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    exibindoModal.value = false;
    emit('atualizado');
  } catch (error: any) {
    alert('Erro ao salvar valor.');
  } finally {
    carregando.value = false;
  }
};

const concluirAtendimento = async () => {
  const token = localStorage.getItem('token');
  if (!confirm('Deseja realmente concluir este atendimento?')) return;
  carregando.value = true;
  try {
    await api.patch(`/atendimento/concluir/${props.atendimento.id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    emit('atualizado');
  } catch (error: any) {
    alert('Erro ao concluir.');
  } finally {
    carregando.value = false;
  }
};

const datasFormatadas = computed(() => {
  const { dataHoraInicio, dataHoraFim } = props.atendimento;
  const formatar = (isoString: string) => {
    if (!isoString) return { data: '--/--/--', hora: '--:--' };
    const dataObjeto = new Date(isoString);
    return {
      data: dataObjeto.toLocaleDateString('pt-BR'),
      hora: dataObjeto.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };
  return { inicio: formatar(dataHoraInicio), fim: formatar(dataHoraFim) };
});
</script>

<template>
  <div class="card" :class="{ 'status-concluido': atendimento.status === 'CONCLUIDO' }">
    <div class="secao-cliente">
      <h3 class="nome-cliente">{{ props.nomeCliente }}</h3>
      <p class="descricao" v-if="atendimento.valor"><strong>Valor:</strong> R$ {{ atendimento.valor }}</p>
      <p class="descricao aviso" v-else>⚠️ Valor não definido</p>
    </div>

    <div class="secao-horarios">
      <div class="ponto-tempo">
        <small>COMEÇO</small>
        <p><strong>{{ datasFormatadas.inicio.data }}</strong> às <strong>{{ datasFormatadas.inicio.hora }}</strong></p>
      </div>
      <div class="divisor">➔</div>
      <div class="ponto-tempo">
        <small>TÉRMINO</small>
        <p><strong>{{ datasFormatadas.fim.data }}</strong> às <strong>{{ datasFormatadas.fim.hora }}</strong></p>
      </div>
    </div>

    <div class="secao-acoes">
      <button
        class="btn editar"
        @click="exibindoModal = true"
        :disabled="carregando || atendimento.status === 'CONCLUIDO'"
      >
        Editar
      </button>

      <button
        class="btn concluir"
        @click="concluirAtendimento"
        :disabled="carregando || atendimento.status === 'CONCLUIDO' || !atendimento.valor"
      >
        Concluir
      </button>
    </div>

    <Teleport to="body">
      <div v-if="exibindoModal" class="overlay">
        <div class="modal">
          <h3>Definir Valor</h3>
          <div class="campo-input">
            <span>R$</span>
            <input type="number" v-model="valorEditado" step="0.01">
          </div>
          <div class="modal-acoes">
            <button @click="exibindoModal = false" class="btn-cancelar">Sair</button>
            <button @click="salvarEdicao" class="btn-salvar" :disabled="carregando">Salvar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap; /* Permite quebrar linha em telas menores */
    background-color: #ffffff;
    border-left: 6px solid #128093;
    border-radius: 12px;
    padding: 20px 30px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    width: 100%;
    box-sizing: border-box;
    gap: 20px;
  }

  .secao-cliente {
    flex: 1 1 200px; /* Cresce e encolhe, base de 200px */
  }

  .secao-horarios {
    flex: 2 1 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 0 20px;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
  }

  .secao-acoes {
    flex: 0 1 150px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Estilos de Texto e Botões permanecem os mesmos */
  .nome-cliente { margin: 0; color: #333; font-size: 1.1rem; }
  .aviso { color: #e67e22; font-weight: bold; }
  .ponto-tempo { text-align: center; }
  .ponto-tempo small { color: #128093; font-weight: bold; font-size: 0.7rem; }
  .divisor { color: #ccc; }

  .btn {
    width: 100%;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    border: none;
    transition: 0.2s;
  }
  .editar { background: #128093; color: white; }
  .concluir { background-color: rgb(19, 126, 0); color: white; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* RESPONSIVIDADE (MEDIA QUERIES) */
  @media (max-width: 900px) {
    .secao-horarios {
      border: none; /* Remove divisores em tablets/celulares */
      padding: 10px 0;
      order: 3; /* Joga os horários para baixo do nome e das ações se necessário */
      width: 100%;
      background: #fcfcfc;
      border-radius: 8px;
    }
    .secao-acoes {
      flex: 1 1 100%; /* Ações ocupam largura total ou ficam ao lado do nome */
      flex-direction: row;
      order: 2;
    }
  }

  @media (max-width: 600px) {
    .card { padding: 15px; }
    .secao-cliente { text-align: center; width: 100%; }
    .secao-acoes { flex-direction: row; }
    .divisor { transform: rotate(90deg); } /* Seta aponta para baixo no mobile */
    .secao-horarios { flex-direction: column; gap: 10px; }
  }

  /* MODAL ESTILOS */
  .overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; }
  .modal { background: white; padding: 30px; border-radius: 15px; width: 90%; max-width: 350px; text-align: center; }
  .campo-input { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px 0; }
  .campo-input input { padding: 10px; border: 1px solid #ddd; border-radius: 8px; width: 100px; }
  .modal-acoes { display: flex; gap: 10px; }
  .btn-cancelar { flex: 1; padding: 10px; border-radius: 6px; border: none; background: #eee; cursor: pointer; }
  .btn-salvar { flex: 1; padding: 10px; border-radius: 6px; border: none; background: #128093; color: white; cursor: pointer; }
</style>
