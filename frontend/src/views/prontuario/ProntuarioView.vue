<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import api from '@/services/api';

const router = useRouter();

interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  data: string;
  status: string;
}

const busca = ref('');
const filtroStatus = ref<'Ativos' | 'Inativos'>('Ativos');
const loading = ref(false);
const listaPacientes = ref<Paciente[]>([]);
const erro = ref('');

const usuarioLogado = ref({
  nome: 'Profissional',
  email: 'profissional@sgci.com'
});

const fetchProntuarios = async () => {
  try {
    loading.value = true;
    erro.value = '';

    const response = await api.get('/profissional/prontuarios');

    listaPacientes.value = response.data.map((item: any) => {
      const cliente = item.cliente || {};

      return {
        id: item.id,
        nome: cliente.name || cliente.nome || item.nome || item.name || 'Cliente Desconhecido',

        cpf: cliente.cpf || item.cpf || '---',
        data: item.dataHoraInicio || item.data || null,

        status: item.status
      };
    });
  } catch (err) {
    console.error('Erro ao buscar prontuários:', err);
    erro.value = 'Não foi possível carregar a lista.';
  } finally {
    loading.value = false;
  }
};

const carregarDadosUsuario = () => {
  const userStr = localStorage.getItem('user_data');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      usuarioLogado.value.nome = user.nome || 'Doutor(a)';
      usuarioLogado.value.email = user.email || 'email@sgci.com';
    } catch (e) {
      console.error('Erro ao ler dados do usuário');
    }
  }
}

onMounted(() => {
  carregarDadosUsuario();
  fetchProntuarios();
});

const pacientesFiltrados = computed(() => {
  let lista = listaPacientes.value;

  if (filtroStatus.value === 'Ativos') {
    lista = lista.filter(p => p.status !== 'CANCELADO' && p.status !== 'CONCLUIDO');
  } else {
    lista = lista.filter(p => p.status === 'CANCELADO' || p.status === 'CONCLUIDO');
  }

  if (busca.value.trim()) {
    const termo = busca.value.toLowerCase();
    lista = lista.filter(p =>
      (p.nome && p.nome.toLowerCase().includes(termo)) ||
      (p.cpf && p.cpf.includes(termo))
    );
  }

  return lista;
});

function abrirProntuario(id: number) {
  router.push(`/profissional/prontuarios/${id}`);
}

function formatarData(iso: string) {
  if (!iso) return '--/--/----';
  const data = new Date(iso);
  const hoje = new Date();

  if (data.toDateString() === hoje.toDateString()) {
    return `Hoje, ${data.getHours()}:${data.getMinutes().toString().padStart(2, '0')}`;
  }

  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '')
    .replace(/ de /g, ' ');
}

function getStatusClass(status: string) {
  if (status === 'CONFIRMADO') return 'normal';
  if (status === 'PENDENTE') return 'pendente';
  return 'critico';
}
</script>

<template>
  <DashboardLayout>

    <div class="layout-wrapper">
      <header class="header-pagina">
        <div class="header-content">
          <div class="titulos">
            <h1 class="titulo-principal">Prontuários Médicos</h1>
            <p class="subtitulo">Gerencie os registros clínicos dos seus pacientes</p>
          </div>

          <div class="acoes-header">
            <div class="perfil-usuario">
              <div class="dados-usuario">
                <span class="nome">{{ usuarioLogado.nome }}</span>
                <span class="email">{{ usuarioLogado.email }}</span>
              </div>
              <div class="avatar-circle">
                <span>👨‍⚕️</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="conteudo-pagina">
        <div class="container-limite">

          <div class="toolbar-custom">
            <div class="abas-status">
              <button :class="['aba-item', { active: filtroStatus === 'Ativos' }]" @click="filtroStatus = 'Ativos'">
                Ativos
              </button>
              <button :class="['aba-item', { active: filtroStatus === 'Inativos' }]" @click="filtroStatus = 'Inativos'">
                Inativos
              </button>
            </div>

            <div class="campo-busca">
              <span class="icone-busca">🔍</span>
              <input type="text" v-model="busca" placeholder="Buscar por nome ou CPF" />
            </div>
          </div>

          <div class="grid-labels">
            <span>PACIENTE</span>
            <span>DATA DA CONSULTA</span>
            <span>STATUS</span>
            <span class="text-right">AÇÕES</span>
          </div>

          <div class="lista-pacientes">
            <div v-if="loading" class="loading-state">
              <p>Carregando prontuários...</p>
            </div>

            <div v-else-if="erro" class="error-state">
              <p>{{ erro }}</p>
            </div>

            <div v-else v-for="paciente in pacientesFiltrados" :key="paciente.id" class="card-paciente">
              <div class="col-info">
                <div class="avatar-list">👤</div>
                <div class="info-text">
                  <span class="p-name">{{ paciente.nome }}</span>
                  <span class="p-cpf">CPF: {{ paciente.cpf }}</span>
                </div>
              </div>

              <div class="col-date">
                <span class="date-text">{{ formatarData(paciente.data) }}</span>
                <div class="status-dot-wrapper">
                  <span v-if="paciente.status === 'CONFIRMADO'" class="dot green"></span>
                  <span class="status-text">{{ paciente.status === 'CONFIRMADO' ? 'Consulta Agendada' : paciente.status
                    }}</span>
                </div>
              </div>

              <div class="col-status">
                <span :class="['badge-status', getStatusClass(paciente.status)]">
                  {{ paciente.status }}
                </span>
              </div>

              <div class="col-actions">
                <button class="btn-outline" @click="abrirProntuario(paciente.id)">
                  Abrir Prontuário
                </button>
              </div>
            </div>

            <div v-if="!loading && !erro && pacientesFiltrados.length === 0" class="empty-state">
              Nenhum paciente encontrado nesta categoria.
            </div>
          </div>

        </div>
      </main>

    </div>

  </DashboardLayout>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.header-pagina {
  background-color: #FFFFFF;
  padding: 15px 40px;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.titulo-principal {
  font-size: 1.6rem;
  color: #2CAFB6;
  font-weight: 700;
  margin: 0;
}

.subtitulo {
  font-size: 0.9rem;
  color: #999;
  margin-top: 4px;
}

.acoes-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.perfil-usuario {
  display: flex;
  align-items: center;
  gap: 15px;
}

.dados-usuario {
  text-align: right;
}

.nome {
  display: block;
  font-weight: 700;
  color: #555;
  font-size: 0.9rem;
}

.email {
  color: #999;
  font-size: 0.8rem;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background-color: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.conteudo-pagina {
  padding: 30px 0;
  width: 100%;
  box-sizing: border-box;
}

.container-limite {
  max-width: 1400px;
  margin: 0 auto;
}

.toolbar-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.abas-status {
  background: #E0E0E0;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  gap: 5px;
}

.aba-item {
  border: none;
  background: transparent;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: 0.2s;
}

.aba-item.active {
  background-color: #fff;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.campo-busca {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  width: 350px;
}

.campo-busca input {
  border: none;
  outline: none;
  width: 100%;
  margin-left: 10px;
  color: #555;
}

.grid-labels {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 180px;
  padding: 0 25px;
  margin-bottom: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
}

.card-paciente {
  background: white;
  border-radius: 12px;
  padding: 20px 25px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 180px;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  border: 1px solid transparent;
}

.card-paciente:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border-color: #2CAFB6;
}

.col-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-list {
  width: 45px;
  height: 45px;
  background: #E0E0E0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #fff;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.p-name {
  font-weight: 700;
  color: #333;
  font-size: 0.95rem;
}

.p-cpf {
  font-size: 0.8rem;
  color: #999;
  margin-top: 2px;
}

.col-date {
  display: flex;
  flex-direction: column;
}

.date-text {
  font-weight: 600;
  color: #444;
  font-size: 0.9rem;
}

.status-dot-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #777;
  margin-top: 2px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.green {
  background-color: #2ECC71;
}

.badge-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
}

.badge-status.normal {
  background: #E8F5E9;
  color: #2E7D32;
}

.badge-status.pendente {
  background: #FFF3CD;
  color: #856404;
}

.badge-status.critico {
  background: #F5F5F5;
  color: #7D7D7D;
}

.text-right {
  text-align: right;
}

.col-actions {
  text-align: right;
}

.btn-outline {
  background: transparent;
  border: 1px solid #2CAFB6;
  color: #2CAFB6;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-outline:hover {
  background-color: #2CAFB6;
  color: white;
}

.loading-state,
.empty-state,
.error-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.error-state {
  color: #dc3545;
}
</style>
