<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router'; // Para pegar o ID da URL se necessário
import api from '@/services/api';

const route = useRoute();

const carregando = ref<Record<string, boolean>>({});
const faltaData = ref('');
const faltaInicio = ref('');
const faltaFim = ref('');
const carregandoFalta = ref(false);

const diasDaSemana = ref([
  { nome: 'Segunda', inicio: '10:00', fim: '18:00', almocoInicio: '11:00', almocoFim: '12:00' },
  { nome: 'Terça',   inicio: '10:00', fim: '18:00', almocoInicio: '11:00', almocoFim: '12:00' },
  { nome: 'Quarta',  inicio: '10:00', fim: '18:00', almocoInicio: '11:00', almocoFim: '12:00' },
  { nome: 'Quinta',  inicio: '10:00', fim: '18:00', almocoInicio: '11:00', almocoFim: '12:00' },
  { nome: 'Sexta',   inicio: '10:00', fim: '18:00', almocoInicio: '11:00', almocoFim: '12:00' },
  { nome: 'Sábado',  inicio: '10:00', fim: '14:00', almocoInicio: '00:00', almocoFim: '00:00' },
]);

const getProximaData = (nomeDia: string, horarioStr: string) => {
  const diasSemanaMap: Record<string, number> = {
    'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3,
    'Quinta': 4, 'Sexta': 5, 'Sábado': 6
  };
  const hoje = new Date();
  const diaSemanaAlvo = diasSemanaMap[nomeDia];
  const diaSemanaAtual = hoje.getDay();
  let diferenca = diaSemanaAlvo! - diaSemanaAtual;
  if (diferenca <= 0) diferenca += 7;

  const dataResultado = new Date(hoje);
  dataResultado.setDate(hoje.getDate() + diferenca);
  const [horas, minutos] = horarioStr.split(':');

  return `${dataResultado.toISOString().split('T')[0]}T${horas}:${minutos}:00.000Z`;
};

const criarDisponibilidade = async (dia: any) => {
  // Pega o token do localStorage ou do seu Store de autenticação
  const token = localStorage.getItem('token');
  const profissionalId = route.params.id; // Ou do store do usuário logado

  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    return;
  }

  carregando.value[dia.nome] = true;

  try {
    const payload = {
      profissional_id: Number(profissionalId),
      data_hora_inicio: getProximaData(dia.nome, dia.inicio),
      data_hora_fim: getProximaData(dia.nome, dia.fim)
    };

    // O Axios permite passar os headers como terceiro parâmetro
    await api.post('/disponibilidade', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    alert(`Horário de ${dia.nome} salvo!`);
  } catch (error: any) {
    console.error("Erro na requisição:", error.response?.data);
    alert(error.response?.data?.message || "Erro ao salvar");
  } finally {
    carregando.value[dia.nome] = false;
  }
};

const cadastrarFalta = async () => {
  const token = localStorage.getItem('token');
  const profissionalId = route.params.id;

  console.log('Dados preenchidos:', {
    data: faltaData.value,
    inicio: faltaInicio.value,
    fim: faltaFim.value
  });

  // Validação simples
  if (!faltaData.value || !faltaInicio.value || !faltaFim.value) {
    alert("Por favor, preencha a data e os horários da falta.");
    return;
  }

  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    return;
  }

  carregandoFalta.value = true;

  try {
    // Monta o ISO String combinando a data escolhida com os horários
    const payload = {
      profissional_id: Number(profissionalId),
      data_hora_inicio: `${faltaData.value}T${faltaInicio.value}:00.000Z`,
      data_hora_fim: `${faltaData.value}T${faltaFim.value}:00.000Z`,
      status: 'BLOQUEADO' // Garante que o sistema trate como bloqueio
    };

    console.log(payload);

    await api.post('/disponibilidade', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert(`Falta cadastrada com sucesso para o dia ${faltaData.value}!`);

    // Limpa o formulário após o sucesso
    faltaData.value = '';
    faltaInicio.value = '';
    faltaFim.value = '';

  } catch (error: any) {
    console.error("Erro na requisição:", error.response?.data);
    alert(error.response?.data?.message || "Erro ao salvar falta");
  } finally {
    carregandoFalta.value = false;
  }
};
</script>

<template>
  <div class="card">
    <header>
      <h3>Horário padrão</h3>
      <small>Define seus horários da semana</small>
    </header>

    <main class="corpo">
      <div v-for="dia in diasDaSemana" :key="dia.nome" class="config-dia">

        <div class="dia-status">
          <span class="nome-dia">{{ dia.nome }}</span>
        </div>

        <div class="periodo">
          <span class="label">De</span>
          <input type="time" v-model="dia.inicio" class="horario-input">
          <span class="separador">Até</span>
          <input type="time" v-model="dia.fim" class="horario-input">
        </div>

        <div class="divisor-vertical"></div>

        <div class="periodo">
          <span class="label">Almoço:</span>
          <input type="time" v-model="dia.almocoInicio" class="horario-input">
          <span class="separador">-</span>
          <input type="time" v-model="dia.almocoFim" class="horario-input">
        </div>

        <div class="botao-adicionar">
          <button @click="criarDisponibilidade(dia)">Adicionar</button>
        </div>
      </div>

      <div class="informar-falta">
        <h3 class="titulo">Informar falta</h3>
        <div class="input-grupo">
          <div class="campo">
            <span class="label">Dia</span>
            <input type="date" v-model="faltaData">
          </div>
          <div class="campo">
            <span class="label">De</span>
            <input type="time" v-model="faltaInicio">
          </div>
          <div class="campo">
            <span class="label">Até</span>
            <input type="time" v-model="faltaFim">
          </div>
        </div>
        <div class="botao-falta">
          <button @click="cadastrarFalta" :disabled="carregandoFalta">
            {{ carregandoFalta ? 'Salvando...' : 'Cadastrar falta' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="css" scoped>
  .card{
    border-radius: 15px;
    background-color: white;
    padding: 10px 30px;
  }
  header{
    margin-bottom: 20px;
  }
  .switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  input:checked + .slider {
    background-color: #128093;
  }

  input:checked + .slider:before {
    transform: translateX(24px);
  }
  .config-dia {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding: 12px 16px;
    background-color: transparent;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    margin-bottom: 10px;
    transition: all 0.3s ease;
  }

  .dia-status {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 140px;
  }

  .nome-dia {
    font-weight: 600;
    color: #1e293b;
  }

  .periodo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 500;
  }

  .horario-box {
    background: white;
    border: 1px solid #cbd5e1;
    padding: 4px 10px;
    border-radius: 6px;
    font-family: 'monospace';
    font-size: 0.9rem;
    color: black;
    font-weight: bold;
  }

  .separador {
    color: #94a3b8;
    font-size: 0.8rem;
  }

  .divisor-vertical {
    width: 1px;
    height: 24px;
    background-color: #cbd5e1;
  }

  .botao-adicionar button{
    padding: 4px;
    font-size: 15px;
    background-color: rgb(19, 126, 0);
    color: white;
    border: none;
    border-radius: 5px;
  }

  .botao-adicionar button:hover{
    cursor: pointer;
    background-color: rgb(13, 83, 0);
  }

  .horario-input {
    background: white;
    border: 1px solid #cbd5e1;
    padding: 4px 6px;
    border-radius: 6px;
    font-family: 'monospace';
    font-size: 0.9rem;
    color: black;
    font-weight: bold;
    outline: none;
    cursor: pointer;
    min-height: 35px;
    text-align: center;
  }

  .horario-input:focus {
    border-color: #128093;
  }

  /* Garante que o botão não mude de tamanho */
  .botao-adicionar button {
    min-width: 80px;
    transition: background 0.3s;
  }
  .informar-falta {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: sans-serif;
  }

  .informar-falta .titulo {
    font-weight: bold;
    color: #333;
  }

  .informar-falta .input-grupo {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .informar-falta .campo {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .informar-falta .label {
    font-size: 13px;
    color: #666;
  }

  .informar-falta input[type="time"], .informar-falta input[type="date"]{
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
  }

  .informar-falta input[type="date"]:focus, .informar-falta input[type="time"]:focus {
    border-color: #007bff;
  }

  .botao-falta{
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
  .botao-falta button{
    width: 80%;
    padding: 10px;
    font-size: 15px;
    font-weight: bold;
    color: white;
    background-color: rgb(190, 0, 0);
    border: none;
    border-radius: 10px;
  }
  .botao-falta button:hover{
    background-color: rgb(154, 0, 0);
    cursor: pointer;
  }

  @media (max-width: 768px) {
  .card {
    padding: 15px;
  }
  .config-dia {
    flex-direction: column;
    height: auto;
    align-items: stretch;
    gap: 12px;
    padding: 20px 15px;
  }
  .dia-status {
    justify-content: center;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 8px;
    min-width: unset;
  }
  .periodo {
    justify-content: center;
    flex-wrap: wrap;
  }
  .divisor-vertical {
    display: none;
  }
  .botao-adicionar {
    display: flex;
    justify-content: center;
  }
  .botao-adicionar button {
    width: 100%;
    padding: 10px;
  }
  .informar-falta .input-grupo {
    flex-direction: column;
  }
  }
</style>
