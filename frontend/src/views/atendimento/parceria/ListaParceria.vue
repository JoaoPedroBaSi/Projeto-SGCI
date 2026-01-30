<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import CardListaParceria from '@/components/cards/atendimento/parceria/CardListaParceria.vue';
import type { Parceria } from '@/types';
import { useRouter } from 'vue-router';

const parcerias = ref<Parceria[]>([]);
const router = useRouter();
const mostrarModal = ref(false);
const parceriaSelecionada = ref<any>(null); // Usando any aqui para facilitar a manipulação do form

const carregarParcerias = async () => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const response = await api.get('/parceria', {
      headers: { 'Authorization': `Bearer ${token.trim()}` }
    });
    parcerias.value = response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      router.push('/login');
    } else {
      console.error("Erro ao carregar parcerias:", error);
    }
  }
};

const abrirModalEdicao = (item: Parceria) => {
  // Criamos uma cópia profunda para o modal não alterar o card em tempo real antes de salvar
  parceriaSelecionada.value = JSON.parse(JSON.stringify(item));
  mostrarModal.value = true;
};

const salvarEdicao = async (dadosEditados: any) => {
  const token = localStorage.getItem('auth_token');

  try {
    await api.patch(`/parceria/${dadosEditados.id}`, dadosEditados, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert("✅ Alterações salvas!");
    mostrarModal.value = false;
    await carregarParcerias();
  } catch (error: any) {
    const msg = error.response?.data?.message || "Verifique os campos.";
    alert("Erro ao salvar: " + msg);
  }
};

const confirmarExclusao = async (id: number) => {
  if (!confirm("Deseja realmente desativar esta parceria?")) return;

  const token = localStorage.getItem('auth_token');
  try {
    await api.patch(`/parceria/${id}`, { status_parceria: 'INATIVO' }, {
      headers: { 'Authorization': `Bearer ${token?.trim()}` }
    });

    alert("Parceria desativada!");
    await carregarParcerias();
  } catch (error: any) {
    alert("Erro ao desativar.");
  }
};

onMounted(carregarParcerias);
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h3>Gestão de Parcerias</h3>
      <div class="opcoes">
        <RouterLink to="/cadastro/parceria" class="botao-opcao">Cadastrar parceria</RouterLink>
        <RouterLink to="/parcerias" class="botao-opcao">Lista de parcerias</RouterLink>
      </div>
    </header>

    <main class="content">
      <section class="section-card-list">
        <CardListaParceria
          v-for="item in parcerias"
          :key="item.id"
          :parceria="item"
          @editar="abrirModalEdicao(item)"
          @apagar="confirmarExclusao(item.id)"
        />
      </section>
    </main>

    <div v-if="mostrarModal && parceriaSelecionada" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal-content">
        <header class="modal-header">
          <h4>Editar Parceria</h4>
          <button class="close-btn" @click="mostrarModal = false">&times;</button>
        </header>

        <div class="modal-scroll">
          <div class="form-group">
            <label>Nome da Empresa:</label>
            <input v-model="parceriaSelecionada.nome" type="text" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Ramo:</label>
              <input v-model="parceriaSelecionada.ramo" type="text" />
            </div>
            <div class="form-group">
              <label>Desconto (%):</label>
              <input v-model="parceriaSelecionada.porcentagem_desconto" type="number" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>CEP:</label>
              <input v-model="parceriaSelecionada.cep" type="text" maxlength="8" />
            </div>
            <div class="form-group">
              <label>Cidade:</label>
              <input v-model="parceriaSelecionada.cidade" type="text" />
            </div>
          </div>

          <div class="form-group">
            <label>Tipo de Relacionamento:</label>
            <select v-model="parceriaSelecionada.tipo_relacionamento">
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
              <option value="MISTO">Misto</option>
              <option value="ESTRATEGICO">Estratégico</option>
            </select>
          </div>
        </div>

        <div class="modal-acoes">
          <button class="btn-cancelar" @click="mostrarModal = false">Cancelar</button>
          <button class="btn-salvar" @click="salvarEdicao(parceriaSelecionada)">Salvar Alterações</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estrutura da Página */
.page-container {
  background-color: #f4f4f4;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 40px 60px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.botao-opcao {
  margin-right: 10px;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid #128093;
  color: #128093;
  border-radius: 5px;
  font-size: 14px;
  transition: 0.3s;
}

.botao-opcao:hover {
  background-color: #128093;
  color: white;
}

/* Lista de Cards */
.section-card-list {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 20px 40px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-scroll {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 12px;
  font-weight: bold;
  color: #666;
  margin-bottom: 5px;
}

input, select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.modal-acoes {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-salvar {
  background: #128093;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancelar {
  background: #eee;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
