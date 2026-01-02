<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  visivel: boolean;
  tipoInicial: 'entrada' | 'saida';
}>();

const emit = defineEmits(['ao-fechar', 'ao-confirmar']);

const tipoAtual = ref<'entrada' | 'saida'>('entrada');
const form = ref({
  produto: 'Seringa Descartável 5ml', // Valor default da imagem
  quantidade: 0,
  lote: 'XYZ-00', // Valor default da imagem
  observacao: ''
});

// Atualiza o tipo quando o modal abre
watch(() => props.visivel, (val) => {
  if (val) {
    tipoAtual.value = props.tipoInicial;
  }
});

function fechar() {
  emit('ao-fechar');
}

function confirmar() {
  emit('ao-confirmar', { ...form.value, tipo: tipoAtual.value });
}

function setTipo(tipo: 'entrada' | 'saida') {
  tipoAtual.value = tipo;
}
</script>

<template>
  <div v-if="visivel" class="modal-overlay" @click.self="fechar">
    <div class="modal-card">
      <div class="modal-header">
        <h2 :class="['modal-title', tipoAtual === 'entrada' ? 'text-green' : 'text-red']">
          Registrar {{ tipoAtual === 'entrada' ? 'Entrada' : 'Saída' }} de Estoque
        </h2>
      </div>

      <div class="toggle-container">
        <button :class="['toggle-btn', { 'active-entrada': tipoAtual === 'entrada' }]" @click="setTipo('entrada')">
          ↓ Entrada
        </button>
        <button :class="['toggle-btn', { 'active-saida': tipoAtual === 'saida' }]" @click="setTipo('saida')">
          ↑ Saída
        </button>
      </div>

      <div class="form-body">
        <div class="form-group full">
          <label>Produto</label>
          <select v-model="form.produto" class="input-field">
            <option>Seringa Descartável 5ml</option>
            <option>Vacina Tetravalente</option>
          </select>
        </div>

        <div class="row-dupla">
          <div class="form-group">
            <label>Quantidade</label>
            <input type="number" v-model="form.quantidade" class="input-field">
          </div>
          <div class="form-group">
            <label>Lote (Opcional)</label>
            <input type="text" v-model="form.lote" class="input-field">
          </div>
        </div>

        <div class="form-group full">
          <label>Motivo / Observação</label>
          <textarea v-model="form.observacao" placeholder="Ex: Reposição mensal de estoque..." rows="3"
            class="input-field"></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancelar" @click="fechar">Cancelar</button>
        <button :class="['btn-confirmar', tipoAtual === 'entrada' ? 'bg-green' : 'bg-red']" @click="confirmar">
          Confirmar {{ tipoAtual === 'entrada' ? 'Entrada' : 'Saída' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  width: 500px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.text-green {
  color: #2ECC71;
}

.text-red {
  color: #FF5252;
}

/* Toggle Buttons */
.toggle-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.toggle-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #eee;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: #aaa;
  transition: 0.2s;
}

.toggle-btn.active-entrada {
  border-color: #2ECC71;
  color: #2ECC71;
  background: #F0FDF4;
}

.toggle-btn.active-saida {
  border-color: #FF5252;
  color: #FF5252;
  background: #FFEBEE;
}

/* Form Styles */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.row-dupla {
  display: flex;
  gap: 15px;
}

.form-group {
  flex: 1;
}

.form-group.full {
  width: 100%;
}

label {
  display: block;
  font-size: 0.8rem;
  color: #8898aa;
  font-weight: 700;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #333;
  box-sizing: border-box;
  font-family: inherit;
}

.input-field:focus {
  outline: none;
  border-color: #aaa;
}

/* Footer Buttons */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-cancelar {
  background: white;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
}

.btn-confirmar {
  border: none;
  padding: 10px 25px;
  border-radius: 6px;
  font-weight: 600;
  color: white;
  cursor: pointer;
}

.bg-green {
  background-color: #2ECC71;
}

.bg-red {
  background-color: #FF5252;
}
</style>
