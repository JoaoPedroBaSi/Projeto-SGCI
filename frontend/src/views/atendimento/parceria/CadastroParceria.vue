<script lang="ts" setup>
import api from '@/services/api';
import { ref } from 'vue';

const form = ref({
  nome: '',
  ramo: '',
  cnpj: '',
  cep: '',
  cidade: '',
  bairro: '',
  rua: '',
  numero: '',
  tipo_convenio: '',
  data_inicio: '',
  site_url: '',
  status_parceria: 'EM NEGOCIACAO',
  porcentagem_desconto: 0,
  tipo_relacionamento: 'ENTRADA'
});

const cadastrar = async () => {
  const token = localStorage.getItem('auth_token');

  try {
    const payload = {
      ...form.value,
      cnpj: form.value.cnpj.replace(/\D/g, ''),
      cep: form.value.cep.replace(/\D/g, ''),
      porcentagem_desconto: Number(form.value.porcentagem_desconto),
      site_url: form.value.site_url || null,
      data_inicio: form.value.status_parceria === 'EM NEGOCIACAO' ? null : form.value.data_inicio
    };

    const response = await api.post('/parceria', payload, {
      headers: {
        'Authorization': `Bearer ${token?.trim()}`
      }
    });

    alert('Parceria cadastrada com sucesso!');
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error("ERRO 401: O servidor rejeitou o token ou o perfil não é ADMIN.");
      console.error("Detalhes do erro no back-end:", error.response.data);
      alert('Sessão inválida ou você não tem permissão de Administrador.');
    } else if (error.response?.status === 422) {
      console.warn("ERRO 422 (Vine):", error.response.data.errors);
      alert('Dados inválidos. Verifique os campos.');
    } else {
      console.error("Erro inesperado:", error);
    }
  }
};
</script>

<template>
  <div class="booking-container">
    <form @submit.prevent="cadastrar" class="booking-card">
      <header class="booking-header">
        <h2>Nova Parceria</h2>
        <div class="divider"></div>
        <p class="subtitle">Preencha os dados abaixo para registrar o novo convênio</p>
      </header>

      <div class="booking-body">
        <div class="grid-row">
          <div class="field-group flex-2">
            <label>Nome da Empresa</label>
            <input v-model="form.nome" type="text" placeholder="Ex: Tech Solutions" required>
          </div>
          <div class="field-group flex-1">
            <label>Ramo de Atuação</label>
            <input v-model="form.ramo" type="text" placeholder="Ex: Tecnologia">
          </div>
        </div>

        <div class="grid-row">
          <div class="field-group">
            <label>CNPJ</label>
            <input v-model="form.cnpj" type="text" placeholder="00.000.000/0000-00">
          </div>
          <div class="field-group">
            <label>CEP</label>
            <input v-model="form.cep" type="text" placeholder="00000-000">
          </div>
        </div>

        <div class="grid-row-triple">
          <div class="field-group">
            <label>Cidade</label>
            <input v-model="form.cidade" type="text">
          </div>
          <div class="field-group">
            <label>Bairro</label>
            <input v-model="form.bairro" type="text">
          </div>
          <div class="field-group flex-small">
            <label>Nº</label>
            <input v-model="form.numero" type="text">
          </div>
        </div>

        <div class="field-group">
          <label>Endereço (Rua/Avenida)</label>
          <input v-model="form.rua" type="text">
        </div>

        <div class="grid-row">
          <div class="field-group">
            <label>Tipo de Convênio</label>
            <select v-model="form.tipo_convenio">
              <option value="">Selecione...</option>
              <option value="desconto">Desconto</option>
              <option value="servico">Serviço</option>
            </select>
          </div>
          <div class="field-group">
            <label>Data de Início</label>
            <input v-model="form.data_inicio" type="date">
          </div>
        </div>

        <div class="field-group">
          <label>Website ou URL</label>
          <input v-model="form.site_url" type="url" placeholder="https://...">
        </div>
      </div>

      <div class="grid-row">
        <div class="field-group">
          <label>Status da Parceria</label>
          <select v-model="form.status_parceria">
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="EM NEGOCIACAO">Em Negociação</option>
          </select>
        </div>
        <div class="grid-row">
          <div class="field-group">
            <label>Tipo de Relacionamento</label>
            <select v-model="form.tipo_relacionamento" required>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
              <option value="MISTO">Misto</option>
              <option value="ESTRATEGICO">Estratégico</option>
            </select>
          </div>
        </div>
        <div class="field-group">
          <label>% Desconto</label>
          <input v-model="form.porcentagem_desconto" type="number">
        </div>
      </div>

      <footer class="booking-footer">
        <button type="submit" class="btn-primary">
          Cadastrar Parceria
        </button>
      </footer>
    </form>
  </div>
</template>

<style scoped>
.booking-container {
  --primary: #128093;
  --primary-dark: #0e6675;
  --text-main: #333;
  --border: #ddd;

  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

.booking-card {
  background: white;
  width: 900px;
  min-height: 850px;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 60px;
  box-sizing: border-box;
}

.booking-header {
  text-align: center;
  margin-bottom: 40px;
}

.booking-header h2 {
  color: var(--primary);
  font-size: 2rem;
  margin-bottom: 12px;
  font-weight: 700;
}

.subtitle {
  color: #666;
  margin-top: 15px;
  font-size: 1rem;
}

.divider {
  height: 4px;
  width: 80px;
  background: var(--primary);
  margin: 0 auto;
  border-radius: 10px;
}

.booking-body {
  display: flex;
  flex-direction: column;
  gap: 25px;
  flex-grow: 1;
}

.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.grid-row-triple {
  display: grid;
  grid-template-columns: 1.5fr 1fr 0.5fr;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flex-2 {
  grid-column: span 1;
}

.field-group label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-main);
}

input,
select {
  padding: 16px 20px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(18, 128, 147, 0.1);
}

.booking-footer {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}

.btn-primary {
  width: 100%;
  max-width: 450px;
  padding: 20px;
  background-color: var(--primary) !important;
  color: white !important;
  border: none;
  border-radius: 14px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--primary-dark) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(18, 128, 147, 0.2);
}

@media (max-width: 950px) {
  .booking-card {
    width: 95%;
    padding: 30px;
    min-height: auto;
  }

  .grid-row,
  .grid-row-triple {
    grid-template-columns: 1fr;
  }
}
</style>
