<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  visivel: boolean;
  acao: string; // 'confirmar' | 'recusar'
  item: any;
}>();

const emit = defineEmits(['ao-fechar', 'ao-salvar']);

// Estados
const justificativa = ref('');

const tituloModal = computed(() => {
  return props.acao === 'confirmar' ? 'Confirmar Agendamento' : 'Recusar Solicitação';
});

const textoBotao = computed(() => {
  return props.acao === 'confirmar' ? 'Confirmar' : 'Recusar';
});

const corTextoTema = computed(() => {
  return props.acao === 'confirmar' ? 'texto-teal' : 'texto-vermelho';
});

const corBotaoTema = computed(() => {
  return props.acao === 'confirmar' ? 'botao-teal' : 'botao-vermelho';
});

const corBordaTema = computed(() => {
  return props.acao === 'confirmar' ? 'borda-teal' : 'borda-vermelho';
});

function fechar() {
  emit('ao-fechar');
  justificativa.value = '';
}

function confirmarAcao() {
  const payload = {
    id: props.item.id,
    acao: props.acao,
    dados: props.acao === 'recusar' ? { justificativa: justificativa.value } : {}
  };
  emit('ao-salvar', payload);
  fechar();
}
</script>

<template>
  <Transition name="fade">
    <div v-if="visivel" class="modal-overlay" @click.self="fechar">
      <div class="modal-container">

        <div class="modal-header" :class="corBordaTema">
          <h3 :class="corTextoTema">{{ tituloModal }}</h3>
          <button class="btn-fechar" :class="corTextoTema" @click="fechar">✕</button>
        </div>

        <div class="modal-body">
          <p class="descricao-item">
            Você deseja realmente <strong :class="corTextoTema">{{ acao }}</strong> a solicitação de <span
              class="destaque">{{ item?.titulo }}</span>?
          </p>

          <div v-if="acao === 'recusar'" class="form-group">
            <label>Motivo da recusa:</label>
            <select v-model="justificativa" class="input-padrao">
              <option value="" disabled selected>Selecione um motivo...</option>
              <option value="Sem horário disponível">Sem horário disponível</option>
              <option value="Dados incompletos">Dados incompletos</option>
              <option value="Outros">Outros</option>
            </select>
            <textarea v-if="justificativa === 'Outros'" placeholder="Descreva o motivo..."
              class="textarea-padrao"></textarea>
          </div>

          <div v-if="acao === 'confirmar'">
            <p class="aviso-simples">O horário será reservado e o paciente notificado.</p>
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn btn-cancelar" @click="fechar">Cancelar</button>
          <button class="btn btn-acao" :class="corBotaoTema" @click="confirmarAcao">
            {{ textoBotao }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
:root {
  --cor-primaria-teal: #2CAFB6;
  --cor-erro-vermelho: #ff6b6b;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  width: 90%;
  max-width: 450px;
  border-radius: 15px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  font-family: 'Montserrat', sans-serif;
  animation: scaleUp 0.3s ease;
}

/* HEADER */
.modal-header {
  background-color: white;
  padding: 20px 25px 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.borda-teal {
  border-bottom: 2px solid #2CAFB6;
}

.borda-vermelho {
  border-bottom: 2px solid #ff6b6b;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.btn-fechar {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: opacity 0.2s;
}

.btn-fechar:hover {
  opacity: 0.7;
}

.texto-teal {
  color: #2CAFB6;
}

.texto-vermelho {
  color: #ff6b6b;
}

/* BODY */
.modal-body {
  padding: 15px 25px 20px 25px;
}

.descricao-item {
  color: #555;
  margin-bottom: 15px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.destaque {
  font-weight: 600;
  color: #333;
}

.aviso-simples {
  font-size: 0.9rem;
  color: #888;
  font-style: italic;
  margin-top: 5px;
}

/* FORMULÁRIOS */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 5px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #444;
}

.input-padrao,
.textarea-padrao {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s;
  width: 100%;
}

.input-padrao:focus,
.textarea-padrao:focus {
  border-color: #2CAFB6;
}

.textarea-padrao {
  min-height: 60px;
  resize: vertical;
  margin-top: 5px;
}

/* FOOTER */
.modal-footer {
  padding: 15px 25px 25px 25px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-cancelar {
  background-color: white;
  border: 2px solid #ddd;
  color: #777;
}

.btn-cancelar:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.btn-acao {
  color: white;
}

.botao-teal {
  background-color: #2CAFB6;
}

.botao-teal:hover {
  background-color: #249aa0;
  box-shadow: 0 4px 10px rgba(44, 175, 182, 0.3);
}

.botao-vermelho {
  background-color: #ff6b6b;
}

.botao-vermelho:hover {
  background-color: #e05e5e;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
}

/* ANIMAÇÕES */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scaleUp {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
