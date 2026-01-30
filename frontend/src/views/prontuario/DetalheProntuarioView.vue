<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

const route = useRoute();
const router = useRouter();
const atendimentoId = route.params.id; // Pega o ID da URL

// Estados da tela
const loading = ref(true);
const salvando = ref(false);
const modoLeitura = ref(false);

// Dados do Paciente
const paciente = ref({
  nome: 'Carregando...',
  idade: '--',
  alergia: 'Verificar histórico',
  foto: '',
  id: null
});

// Dados do Formulário
const form = ref({
  diagnostico: '',
  medicamentosPrescritos: '',
  recomendacoes: '',
  descricao: ''
});

// --- 1. BUSCAR DADOS DO ATENDIMENTO E PREENCHER A TELA ---
const carregarDados = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('auth_token');

    // Busca os dados no Localhost
    const response = await axios.get(`http://localhost:3333/atendimento/${atendimentoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const dados = response.data;

    // Mapeia dados do cliente
    const cliente = dados.cliente || {};
    let idade = '--';
    if (cliente.dataNascimento) {
      const anoNasc = new Date(cliente.dataNascimento).getFullYear();
      idade = `${new Date().getFullYear() - anoNasc} anos`;
    }

    // Atualiza o cabeçalho do paciente
    paciente.value = {
      id: cliente.id,
      nome: cliente.nome || cliente.name || 'Paciente sem nome',
      idade: idade,
      alergia: 'Nenhuma registrada',
      foto: cliente.foto_perfil_url || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png'
    };

    // 👇👇 AQUI ESTÁ A CORREÇÃO PRINCIPAL 👇👇
    // Se o backend retornou um prontuário salvo, joga os textos nos campos
    if (dados.prontuario) {
      console.log("Dados carregados:", dados.prontuario);

      form.value.diagnostico = dados.prontuario.diagnostico || '';
      form.value.medicamentosPrescritos = dados.prontuario.medicamentosPrescritos || '';
      form.value.recomendacoes = dados.prontuario.recomendacoes || '';
      form.value.descricao = dados.prontuario.descricao || '';
      modoLeitura.value = true;
    }
    // 👆👆 FIM DA CORREÇÃO 👆👆

  } catch (error) {
    console.error("Erro ao carregar:", error);
    alert("Erro ao carregar dados do atendimento.");
  } finally {
    loading.value = false;
  }
};

// --- 2. SALVAR PRONTUÁRIO ---
const salvarProntuario = async () => {
  if (!form.value.diagnostico) {
    alert('Por favor, preencha pelo menos o Diagnóstico.');
    return;
  }

  try {
    salvando.value = true;
    const token = localStorage.getItem('auth_token');

    await axios.post(`http://localhost:3333/atendimentos/${atendimentoId}/prontuario`, form.value, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert('✅ Sucesso! O prontuário foi salvo.');
    // Recarrega os dados para garantir sincronia
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
              <span class="alergia">⚠ {{ paciente.alergia }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary">Histórico Completo</button>
        </div>
      </header>

      <div v-if="loading" class="loading-box">
        <p>Buscando ficha do paciente...</p>
      </div>

      <main class="main-content" v-else>

        <section class="form-panel">
          <div class="form-header">
            <h3>Registro de Atendimento #{{ atendimentoId }}</h3>
            <span v-if="modoLeitura" class="status-tag finalizado">
              Prontuário Finalizado
            </span>

            <span v-else class="status-tag editando">
              Editando Agora
            </span>
          </div>

          <div class="form-group">
            <label>🩺 DIAGNÓSTICO (Obrigatório)</label>
            <textarea v-model="form.diagnostico" placeholder="Descreva o diagnóstico clínico..." rows="3"
              :disabled="modoLeitura"></textarea>
          </div>

          <div class="form-group">
            <label>📝 DESCRIÇÃO DETALHADA</label>
            <textarea v-model="form.descricao" placeholder="Detalhes da consulta, queixas do paciente..." rows="4"
              :disabled="modoLeitura"></textarea>
          </div>

          <div class="form-group">
            <label>💊 PRESCRIÇÃO MÉDICA</label>
            <textarea v-model="form.medicamentosPrescritos"
              placeholder="Ex: Amoxicilina 500mg - Tomar de 8 em 8 horas..." rows="4"
              :disabled="modoLeitura"></textarea>
          </div>

          <div class="form-group">
            <label>📌 RECOMENDAÇÕES</label>
            <textarea v-model="form.recomendacoes" placeholder="Repouso, dieta, retorno..." rows="2"
              :disabled="modoLeitura"></textarea>
          </div>

          <div class="form-actions">
            <button class="btn-cancel" @click="$router.back()">Cancelar</button>
            <button class="btn-save" @click="salvarProntuario" :disabled="salvando || modoLeitura">
              {{ salvando ? 'Salvando...' : 'Finalizar e Salvar' }}
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
}

.loading-box {
  text-align: center;
  padding: 50px;
  color: #666;
  font-weight: bold;
}

/* Cabeçalho */
.patient-header {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-voltar {
  background: none;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  font-size: 1.2rem;
  color: #555;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
}

.texts h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.meta {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.alergia {
  color: #e74c3c;
  font-weight: bold;
  background: #fceceb;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.btn-secondary {
  background: white;
  color: #555;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
}

/* Formulário */
.form-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.form-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.form-header h3 {
  margin: 0;
  color: #2CAFB6;
}

.editing-tag {
  background: #e8f5e9;
  color: #2ecc71;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}

.editando { background: #e8f5e9; color: #2ecc71; }
.finalizado { background: #f5f5f5; color: #777; border: 1px solid #ddd; }

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 700;
  color: #555;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: 0.3s;
  background: #fcfcfc;
  font-size: 0.95rem;
}

textarea:focus {
  border-color: #2CAFB6;
  background: white;
  box-shadow: 0 0 0 3px rgba(44, 175, 182, 0.1);
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-cancel {
  background: #eee;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  cursor: pointer;
  color: #555;
  font-weight: 600;
}

.btn-save {
  background: #2CAFB6;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: 0.2s;
}

.btn-save:hover {
  background: #249096;
}

.btn-save:disabled {
  background: #a0dce0;
  cursor: not-allowed;
}

/* Remove cabeçalho duplo */
:global(.top-header) {
  display: none !important;
}
</style>