<script setup lang="ts">
import { Building } from 'lucide-vue-next';

interface Sala {
  id: number;
  nome: string;
  tipo: 'consultorio' | 'exames' | 'terapia';
  capacidadePacientes: number;
  preco: number;
  status: 'disponivel' | 'ocupada';
}

const props = defineProps<{
  dados: Sala;
}>();

const emit = defineEmits(['ao-reservar']);
</script>

<template>
  <div class="card-sala">
    <div class="card-header-visual">
      <div class="status-badge" :class="dados.status">
        <span class="status-dot"></span>
        {{ dados.status === 'disponivel' ? 'Disponível' : 'Ocupada' }}
      </div>

      <Building class="sala-icon-svg" />
    </div>

    <div class="card-body">
      <div class="info-sala">
        <h3 class="nome-sala">{{ dados.nome }}</h3>
        <div class="capacidade">
          <svg viewBox="0 0 24 24" fill="currentColor" class="icon-users">
            <path
              d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          <span>Capacidade: {{ dados.capacidadePacientes }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="footer-card">
        <span class="preco">R${{ dados.preco.toFixed(2).replace('.', ',') }} <small>/hora</small></span>
        <button class="btn-reservar" :disabled="dados.status === 'ocupada'" @click="emit('ao-reservar', dados)">
          Reservar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-sala {
  background: white;
  border-radius: 12px;
  padding: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  border: 1px solid #fff;
  overflow: hidden;
}

.card-sala:hover {
  transform: translateY(-3px);
}

.card-header-visual {
  background-color: #F1F5F9;
  border-radius: 12px 12px 0 0;
  height: 140px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.sala-icon-svg {
  width: 64px;
  height: 64px;
  stroke: #546E7A;
  stroke-width: 1.5px;
  opacity: 0.5;
}

.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-badge.disponivel {
  color: #2E7D32;
}

.status-badge.disponivel .status-dot {
  background-color: #2E7D32;
}

.status-badge.ocupada {
  color: #C62828;
}

.status-badge.ocupada .status-dot {
  background-color: #C62828;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: block;
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.info-sala {
  margin-bottom: 15px;
}

.nome-sala {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 5px 0;
  color: #333;
}

.capacidade {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #888;
  font-size: 0.85rem;
}

.icon-users {
  width: 16px;
  height: 16px;
}

.divider {
  height: 1px;
  background-color: #eee;
  margin-bottom: 15px;
}

.footer-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.preco {
  font-weight: 700;
  color: #333;
  font-size: 1rem;
}

.preco small {
  font-weight: 400;
  color: #888;
  font-size: 0.8rem;
}


.btn-reservar {
  background-color: white;
  border: 1px solid #2CAFB6;
  color: #2CAFB6;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reservar:hover:not(:disabled) {
  background-color: #2CAFB6;
  color: white;
}

.btn-reservar:disabled {
  border-color: #ddd;
  color: #ccc;
  cursor: not-allowed;
}
</style>
