<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

const route = useRoute();
const router = useRouter();
const atendimentoId = route.params.id;

// Estados
const loading = ref(true);
const debugData = ref(null); // Variável para o Raio-X

const paciente = ref({
  nome: 'Buscando...',
  idade: '--',
  alergia: '',
  foto: '',
  id: null
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

    // --- RAIO-X: JOGA TUDO NA TELA ---
    debugData.value = dados; 
    // --------------------------------

    // TENTATIVA GENÉRICA DE ACHAR O NOME (Vamos melhorar depois do seu print)
    const cliente = dados.cliente || dados.paciente || dados.user || {};
    
    paciente.value = {
      id: cliente.id,
      nome: cliente.nome || cliente.full_name || 'NOME NÃO ENCONTRADO', 
      idade: '--',
      alergia: 'Nenhuma',
      foto: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png'
    };

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao carregar (Veja o console)");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  carregarDados();
});
</script>

<template>
  <DashboardLayout>
    <div class="page-container">

      <div style="background: #000; color: #0f0; padding: 20px; margin-bottom: 20px; border-radius: 8px; overflow: auto; max-height: 300px; font-family: monospace;">
        <h3>🔍 RAIO-X DOS DADOS (Mande print disso):</h3>
        <pre>{{ debugData }}</pre>
      </div>
      <header class="patient-header">
        <div class="patient-info">
          <button class="btn-voltar" @click="$router.back()">←</button>
          <div class="texts">
            <h2>{{ paciente.nome }}</h2>
            <p>ID Atendimento: {{ atendimentoId }}</p>
          </div>
        </div>
      </header>

      <main class="main-content">
        <section class="form-panel">
            <h3>Prontuário (Modo Teste)</h3>
            <p>Se o nome apareceu como "NOME NÃO ENCONTRADO", olhe a caixa preta acima.</p>
        </section>
      </main>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-container { padding: 20px; }
.patient-header { background: white; padding: 20px; margin-bottom: 20px; border-radius: 10px; }
.form-panel { background: white; padding: 30px; border-radius: 10px; }
</style>