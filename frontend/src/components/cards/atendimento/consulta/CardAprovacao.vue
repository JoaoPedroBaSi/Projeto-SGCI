<script setup lang="ts">
import api from '@/services/api';

const props = defineProps({
  atendimento: {
    type: Object,
    required: true
  }
})

// Função simples para formatar a data se necessário
const formatarData = (data: string | Date) => {
  return new Date(data).toLocaleDateString('pt-BR');
};

const formatarHora = (data: string | Date) => {
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Definimos o evento que o card pode emitir
const emit = defineEmits(['atualizar']);

const aprovarConsulta = async (id: number) => {
  try {
    await api.patch(`/atendimento/${id}/aprovar`);
    alert("Consulta aprovada!");

    // DISPARA O EVENTO para o pai
    emit('atualizar');
  } catch (err: any) {
    console.error(err);
    alert("Erro ao aprovar.");
  }
};

const recusarConsulta = async (id: number) => {
  if (!confirm("Tem certeza que deseja recusar este atendimento?")) return;

  try {
    await api.patch(`/atendimento/${id}/recusar`);
    alert("Atendimento recusado.");

    // Avisa o pai para atualizar a lista
    emit('atualizar');
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || "Erro ao recusar atendimento.");
  }
};


</script>

<template>
  <section class="card">
    <div class="cabecalho">
      <h3>Consulta Pendente</h3>
    </div>

    <div class="corpo">
      <div class="paciente">
        <p><strong>Paciente: </strong>{{ atendimento.cliente?.nome || 'Não informado' }}</p>
      </div>

      <div class="profissional">
        <p><strong>Profissional: </strong>{{ atendimento.profissional?.nome || 'Não informado' }}</p>
      </div>

      <div class="data-hora">
        <p>
          <strong>Horário: </strong>
          {{ formatarHora(atendimento.data) }}h - {{ formatarData(atendimento.data) }}
        </p>
      </div>

      <div class="rodape">
        <div class="botao-recusar">
          <button @click="recusarConsulta(atendimento.id)" class="btn-recusar">Recusar</button>
        </div>

        <div class="botao-confirmar">
          <button @click="aprovarConsulta(atendimento.id)" class="btn-confirmar">Confirmar</button>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="css" scoped>
  p{
    font-size: 14px;
  }
  .card {
    margin: 0;
    padding: 20px 24px;
    width: 100%;
    max-width: 400px;
    min-height: 250px;
    border-radius: 15px;
    background-color: #fff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .cabecalho{
    display: flex;
    justify-content: center;
    border-bottom: 2px solid #128093;
  }
  .cabecalho h3{
    color: #128093;
  }
  .rodape{
    display: flex;
    justify-content: space-around;
  }
  button{
    background-color: transparent;
    border-radius: 10px;
    padding: 5px 20px;
    font-weight: bold;

  }
  .botao-recusar button{
    color: red;
    border: 2px solid red;
  }
  .botao-confirmar button{
    color: green;
    border: 2px solid green;
  }
  button:hover {
  filter: brightness(0.9);
  cursor: pointer;
  }
  button:active {
    transform: scale(0.98);
  }
</style>
