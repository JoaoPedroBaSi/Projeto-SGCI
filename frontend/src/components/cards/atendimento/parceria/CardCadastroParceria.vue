<script lang="ts" setup>
import { ref } from 'vue';

const form = ref({
  nome: '', ramo: '', cep: '', cnpj: '',
  cidade: '', bairro: '', rua: '', numero: '',
  url: '', tipoConvenio: '', tipoRelacionamento: '', dataInicio: ''
});

const cadastrar = () => {
  console.log("Dados da parceria:", form.value);
  // Sua lógica de API aqui
};
</script>

<template>
  <div class="card-cadastro">
    <header class="header-card">
      <h2>Nova Parceria</h2>
      <p>Preencha os dados abaixo para registrar o novo convênio</p>
    </header>

    <form @submit.prevent="cadastrar" class="form-grid">
      <section class="form-section">
        <h3 class="section-title">Identificação</h3>
        <div class="row">
          <div class="field flex-2">
            <label>Nome da Empresa</label>
            <input v-model="form.nome" type="text" placeholder="Ex: Tech Solutions">
          </div>
          <div class="field flex-1">
            <label>Ramo</label>
            <input v-model="form.ramo" type="text" placeholder="Ex: Tecnologia">
          </div>
        </div>
      </section>

      <section class="form-section">
        <h3 class="section-title">Localização e Registro</h3>
        <div class="row">
          <div class="field">
            <label>CNPJ</label>
            <input v-model="form.cnpj" type="text" placeholder="00.000.000/0000-00">
          </div>
          <div class="field">
            <label>CEP</label>
            <input v-model="form.cep" type="text" placeholder="00000-000">
          </div>
          <div class="field">
            <label>Cidade</label>
            <input v-model="form.cidade" type="text">
          </div>
        </div>
        <div class="row mt-2">
          <div class="field flex-2">
            <label>Rua</label>
            <input v-model="form.rua" type="text">
          </div>
          <div class="field flex-1">
            <label>Bairro</label>
            <input v-model="form.bairro" type="text">
          </div>
          <div class="field flex-small">
            <label>Nº</label>
            <input v-model="form.numero" type="text">
          </div>
        </div>
      </section>

      <section class="form-section">
        <h3 class="section-title">Detalhes do Contrato</h3>
        <div class="row">
          <div class="field">
            <label>URL / Site</label>
            <input v-model="form.url" type="url" placeholder="https://...">
          </div>
          <div class="field">
            <label>Tipo de Convênio</label>
            <select v-model="form.tipoConvenio">
              <option value="">Selecione...</option>
              <option value="desconto">Desconto</option>
              <option value="servico">Serviço</option>
            </select>
          </div>
          <div class="field">
            <label>Data de Início</label>
            <input v-model="form.dataInicio" type="date">
          </div>
        </div>
      </section>

      <div class="actions">
        <button type="submit" class="btn-submit">Cadastrar</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.card-cadastro {
  background: white;
  width: 100%;
  max-width: 900px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  overflow: hidden;
  border: 1px solid #eee;
}

.header-card {
  background: #f8fafc;
  padding: 25px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.header-card h2 { margin: 0; color: #1e293b; }
.header-card p { margin: 5px 0 0; color: #64748b; font-size: 0.9rem; }

.form-grid { padding: 30px; }

.form-section { margin-bottom: 25px; }

.section-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #128093;
  letter-spacing: 1px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
  margin-bottom: 15px;
}

.row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 180px;
}

.flex-2 { flex: 2; }
.flex-small { flex: 0.4; }

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

input, select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #128093;
  box-shadow: 0 0 0 3px rgba(18, 128, 147, 0.1);
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.btn-submit {
  background: #137e00;
  color: white;
  padding: 14px 40px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover {
  background: #0f6600;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(19, 126, 0, 0.2);
}

.mt-2 { margin-top: 10px; }
</style>
