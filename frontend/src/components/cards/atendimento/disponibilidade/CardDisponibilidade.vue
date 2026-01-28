<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();

const carregando = ref<Record<string, boolean>>({});

// Iniciamos como null para buscar no onMounted ou dentro da função de forma segura
const usuarioLogado = ref<any>(null);

const diasDaSemana = ref([
  { nome: 'Segunda', inicio: '10:00', fim: '18:00' },
  { nome: 'Terça',   inicio: '10:00', fim: '18:00' },
  { nome: 'Quarta',  inicio: '10:00', fim: '18:00' },
  { nome: 'Quinta',  inicio: '10:00', fim: '18:00' },
  { nome: 'Sexta',   inicio: '10:00', fim: '18:00' },
  { nome: 'Sábado',  inicio: '10:00', fim: '14:00' },
]);

// Função para extrair o ID independente da estrutura do objeto salvo
const extrairIdProfissional = () => {
  const userRaw = localStorage.getItem('user_data');
  if (!userRaw) return null;

  try {
    const user = JSON.parse(userRaw);
    // Tenta pegar o ID direto, ou de dentro de uma propriedade 'user' (comum no Adonis)
    return user.id || user.user?.id || user.id_usuario;
  } catch (e) {
    return null;
  }
};

const getProximaData = (nomeDia: string, horarioStr: string) => {
  const diasSemanaMap: Record<string, number> = {
    'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3,
    'Quinta': 4, 'Sexta': 5, 'Sábado': 6
  };

  const hoje = new Date();
  // Usamos o || 0 apenas para o TS não reclamar,
  // mas como o seu array 'diasDaSemana' é controlado, ele sempre achará o valor.
  const diaSemanaAlvo = diasSemanaMap[nomeDia] ?? 0;
  const diaSemanaAtual = hoje.getDay();

  let diferenca = diaSemanaAlvo - diaSemanaAtual;

  // Se for hoje ou dia passado, pula para a próxima semana
  if (diferenca <= 0) {
    diferenca += 7;
  }

  const dataResultado = new Date(hoje);
  dataResultado.setDate(hoje.getDate() + diferenca);

  const ano = dataResultado.getFullYear();
  const mes = String(dataResultado.getMonth() + 1).padStart(2, '0');
  const dia = String(dataResultado.getDate()).padStart(2, '0');

  // Retorna a string formatada localmente
  return `${ano}-${mes}-${dia}T${horarioStr}:00`;
};
const criarDisponibilidade = async (dia: any) => {
  const token = localStorage.getItem('auth_token');
  const profissionalId = extrairIdProfissional();

  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    return;
  }

  if (!profissionalId) {
    alert("Erro: ID do profissional não identificado. Tente fazer login novamente.");
    return;
  }

  carregando.value[dia.nome] = true;

  try {
    const payload = {
      profissional_id: Number(profissionalId),
      data_hora_inicio: getProximaData(dia.nome, dia.inicio),
      data_hora_fim: getProximaData(dia.nome, dia.fim)
    };

    await api.post('/disponibilidade', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert(`Horários para ${dia.nome} gerados com sucesso!`);
  } catch (error: any) {
    console.error("Erro na requisição:", error.response?.data);
    alert(error.response?.data?.message || "Erro ao salvar horários");
  } finally {
    carregando.value[dia.nome] = false;
  }
};

const formatarHora = (dataIso: string) => {
  return new Date(dataIso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<template>
  <div class="booking-container">
    <div class="booking-card">
      <header class="booking-header">
        <h2>Configurações de Agenda</h2>
        <div class="divider"></div>
        <p class="subtitle">Gerencie sua disponibilidade semanal e informe ausências</p>
      </header>

      <main class="booking-body">
        <section class="config-section">
          <h3 class="section-title">Horário Padrão Semanal</h3>

          <div class="list-dias">
            <div v-for="dia in diasDaSemana" :key="dia.nome" class="config-dia-row">
              <div class="dia-info">
                <span class="nome-dia">{{ dia.nome }}</span>
              </div>

              <div class="periodo-inputs">
                <div class="input-field">
                  <label>De</label>
                  <input type="time" v-model="dia.inicio" class="time-input">
                </div>
                <span class="seta-intervalo"> até </span>
                <div class="input-field">
                  <label>Até</label>
                  <input type="time" v-model="dia.fim" class="time-input">
                </div>
              </div>

              <div class="acao-dia">
                <button
  class="btn-add-small"
  @click="criarDisponibilidade(dia)"
  :disabled="carregando[dia.nome]"
>
  <template v-if="!carregando[dia.nome]">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
    Adicionar
  </template>
  <template v-else>
    Gerando...
  </template>
</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.booking-container {
  --primary: #128093;
  --primary-dark: #0e6675;
  --danger: #be0000;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border: #e2e8f0;

  padding: 40px 20px;
  display: flex;
  justify-content: center;
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

.booking-card {
  background: white;
  width: 900px;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  padding: 60px;
  box-sizing: border-box;
}

.booking-header {
  text-align: center;
  margin-bottom: 50px;
}

.booking-header h2 {
  color: var(--primary);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.divider {
  height: 4px;
  width: 60px;
  background: var(--primary);
  margin: 0 auto 15px;
  border-radius: 10px;
}

.subtitle { color: var(--text-muted); font-size: 1rem; }

.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--primary);
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 10px;
  margin-bottom: 25px;
  font-weight: 700;
}

.section-title.danger { color: var(--danger); border-color: #fee2e2; }

/* Lista de Dias */
.list-dias { display: flex; flex-direction: column; gap: 12px; margin-bottom: 50px; }

.config-dia-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 25px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.config-dia-row:hover { border-color: var(--primary); background: #fff; }

.nome-dia { font-weight: 700; color: var(--text-main); min-width: 120px; }

.periodo-inputs {
  display: flex;
  align-items: center;
  gap: 15px;
}

.input-field { display: flex; flex-direction: column; gap: 4px; }
.input-field label { font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }

.time-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  font-weight: 600;
  color: var(--text-main);
  outline: none;
}

.seta-intervalo { color: var(--text-muted); font-size: 0.8rem; font-weight: 500; }

.btn-add-small {
  background: #137e00;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-add-small:hover { background: #0f6600; transform: scale(1.05); }

/* Seção de Falta */
.falta-section {
  background: #fff5f5;
  padding: 30px;
  border-radius: 20px;
  border: 1px dashed #fecaca;
}

.falta-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.field-group { display: flex; flex-direction: column; gap: 8px; }
.field-group label { font-weight: 600; font-size: 0.9rem; color: var(--text-main); }

.main-input {
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  font-size: 1rem;
}

.btn-danger {
  width: 100%;
  padding: 18px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-danger:hover:not(:disabled) {
  background: #9a0000;
  box-shadow: 0 8px 20px rgba(190, 0, 0, 0.2);
}

.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 850px) {
  .booking-card { padding: 30px; width: 95%; }
  .config-dia-row { flex-direction: column; gap: 15px; text-align: center; }
  .falta-grid { grid-template-columns: 1fr; }
}
</style>
