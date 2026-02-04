<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

const route = useRoute();
const router = useRouter();
const atendimentoId = route.params.id;

const loading = ref(true);
const salvando = ref(false);
const modoLeitura = ref(false);

const paciente = ref({
  nome: 'Carregando...',
  idade: '--',
  alergia: 'Verificar histórico',
  foto: '',
  id: null as number | null
});

const form = ref({
  diagnostico: '',
  medicamentosPrescritos: '',
  recomendacoes: '',
  descricao: ''
});

const carregarDados = async () => {
  try {
    loading.value = true;

    const response = await api.get(`/atendimento/${atendimentoId}`);
    const dados = response.data;

    if (dados.prontuario) {
      form.value.diagnostico = dados.prontuario.diagnostico || '';
      form.value.medicamentosPrescritos = dados.prontuario.medicamentosPrescritos || '';
      form.value.recomendacoes = dados.prontuario.recomendacoes || '';
      form.value.descricao = dados.prontuario.descricao || '';
      modoLeitura.value = true;
    }

    const cliente = dados.cliente || {};

    let nomeFinal = cliente.nome || cliente.full_name || cliente.name;

    if (!nomeFinal) {
      nomeFinal = "Japa Guei";
    }

    let idadeCalculada = '22 anos';
    if (cliente.data_nascimento || cliente.dataNascimento) {
      const dataNasc = new Date(cliente.data_nascimento || cliente.dataNascimento);
      const hoje = new Date();
      let anos = hoje.getFullYear() - dataNasc.getFullYear();
      idadeCalculada = `${anos} anos`;
    }

    paciente.value = {
      id: cliente.id || dados.clienteId,
      nome: nomeFinal,
      idade: idadeCalculada,
      alergia: 'Nenhuma registrada',
      foto: cliente.foto_perfil_url || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png'
    };

  } catch (error) {
    console.error("Erro ao carregar:", error);
    paciente.value = {
      id: 99,
      nome: "Japa Guei (Modo Offline)",
      idade: "22 anos",
      alergia: "Nenhuma",
      foto: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
    };
  } finally {
    loading.value = false;
  }
};

const salvarProntuario = async () => {
  if (!form.value.diagnostico) {
    alert('Por favor, preencha pelo menos o Diagnóstico.');
    return;
  }

  try {
    salvando.value = true;
    await api.post(`/atendimentos/${atendimentoId}/prontuario`, form.value);

    alert('✅ Prontuário salvo com sucesso!');
    await carregarDados();

  } catch (error) {
    console.error(error);
    alert('Erro ao salvar. Tente novamente.');
  } finally {
    salvando.value = false;
  }
};

onMounted(() => {
  carregarDados();
});
</script>

<template>
  <DashboardLayout>
    <div class="page-container">

      <header class="patient-header" v-if="!loading">
        <div class="patient-info">
          <button class="btn-voltar" @click="$router.back()">←</button>
          <img :src="paciente.foto" class="avatar" alt="Paciente" />
          <div class="texts">
            <h2>{{ paciente.nome }}</h2>
            <div class="meta">
              <span>{{ paciente.idade }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary">Histórico Completo</button>
        </div>
      </header>

      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
        <p>Carregando prontuário...</p>
      </div>

      <main class="main-content" v-else>
        <section class="form-panel">
          <div class="form-header">
            <h3>Prontuário Eletrônico</h3>
            <span v-if="modoLeitura" class="status-tag finalizado">
              Finalizado
            </span>
            <span v-else class="status-tag editando">
              Em Edição
            </span>
          </div>

          <div class="form-grid">
            <div class="form-group full-width">
              <label>🩺 DIAGNÓSTICO CLÍNICO</label>
              <textarea v-model="form.diagnostico" placeholder="Descreva o diagnóstico..." rows="3"
                :disabled="modoLeitura"></textarea>
            </div>

            <div class="form-group full-width">
              <label>📝 ANAMNESE / DESCRIÇÃO</label>
              <textarea v-model="form.descricao" placeholder="Queixas principais e histórico..." rows="4"
                :disabled="modoLeitura"></textarea>
            </div>

            <div class="form-group">
              <label>💊 PRESCRIÇÃO (RECEITA)</label>
              <textarea v-model="form.medicamentosPrescritos" placeholder="Ex: Dipirona 500mg..." rows="5"
                :disabled="modoLeitura"></textarea>
            </div>

            <div class="form-group">
              <label>📌 RECOMENDAÇÕES</label>
              <textarea v-model="form.recomendacoes" placeholder="Repouso, dieta..." rows="5"
                :disabled="modoLeitura"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-cancel" @click="$router.back()">Voltar</button>
            <button class="btn-save" @click="salvarProntuario" :disabled="salvando || modoLeitura">
              {{ salvando ? 'Salvando...' : 'Finalizar Atendimento' }}
            </button>
          </div>
        </section>
      </main>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-container {
  padding: 20px 40px;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-box {
  text-align: center;
  padding: 50px;
  color: #666;
}

.patient-header {
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #117a8b;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-voltar {
  background: #f0f2f5;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  color: #555;
  transition: 0.2s;
}

.btn-voltar:hover {
  background: #e4e6e9;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e0f2f1;
}

.texts h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #2c3e50;
  font-weight: 700;
}

.meta {
  font-size: 0.95rem;
  color: #7f8c8d;
  margin-top: 5px;
}

.btn-secondary {
  background: white;
  color: #117a8b;
  border: 1px solid #117a8b;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.btn-secondary:hover {
  background: #e0f2f1;
}

.form-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.form-header h3 {
  margin: 0;
  color: #117a8b;
  font-size: 1.3rem;
}

.status-tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.editando {
  background: #e3f2fd;
  color: #1976d2;
}

.finalizado {
  background: #e8f5e9;
  color: #2e7d32;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  font-weight: 700;
  color: #455a64;
  font-size: 0.85rem;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #cfd8dc;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: 0.3s;
  background: #fafafa;
  font-size: 0.95rem;
  line-height: 1.5;
}

textarea:focus {
  border-color: #117a8b;
  background: white;
  box-shadow: 0 0 0 3px rgba(17, 122, 139, 0.1);
}

textarea:disabled {
  background: #f5f5f5;
  color: #777;
  cursor: not-allowed;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.btn-cancel {
  background: #eceff1;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  cursor: pointer;
  color: #546e7a;
  font-weight: 600;
  transition: 0.2s;
}

.btn-cancel:hover {
  background: #cfd8dc;
}

.btn-save {
  background: #117a8b;
  color: white;
  border: none;
  padding: 12px 35px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: 0.2s;
  box-shadow: 0 4px 6px rgba(17, 122, 139, 0.2);
}

.btn-save:hover {
  background: #0e6b7a;
  transform: translateY(-1px);
}

.btn-save:disabled {
  background: #b0bec5;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}
</style>
