<script setup lang="ts">
interface Solicitacao {
  id: number;
  titulo: string;
  paciente: string;
  profissional: string;
  dataHora: string;
  tipoConsulta: string;
}

defineProps<{
  dados: Solicitacao
}>();

const emit = defineEmits(['ao-confirmar', 'ao-recusar']);
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3 class="titulo-card">{{ dados.titulo }}</h3>
      <div class="divisor"></div>
    </div>

    <div class="card-body">
      <div class="info-lista">
        <p><strong>Paciente:</strong> <span>{{ dados.paciente }}</span></p>
        <p><strong>Profissional:</strong> <span>{{ dados.profissional }}</span></p>
        <p><strong>Data/Hora:</strong> <span>{{ dados.dataHora }}</span></p>
        <p><strong>Tipo:</strong> <span>{{ dados.tipoConsulta }}</span></p>
      </div>
    </div>

    <div class="card-footer">
      <button class="btn btn-recusar" @click="emit('ao-recusar', dados)">
        Recusar
      </button>
      <button class="btn btn-confirmar" @click="emit('ao-confirmar', dados)">
        Confirmar
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.card-header {
  text-align: center;
  margin-bottom: 15px;
}

.titulo-card {
  color: #2CAFB6;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.divisor {
  height: 2px;
  background-color: #2CAFB6;
  width: 100%;
  margin: 0 auto;
}

.card-body {
  flex: 1;
  margin-bottom: 20px;
}

.info-lista p {
  margin: 8px 0;
  font-size: 0.85rem;
  color: #555;
  line-height: 1.4;
}

.info-lista strong {
  color: #333;
  font-weight: 700;
  margin-right: 4px;
}

.info-lista span {
  color: #666;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  background-color: transparent;
  transition: all 0.2s;
  text-transform: capitalize;
}

.btn-recusar {
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
}

.btn-recusar:hover {
  background-color: #ff6b6b;
  color: white;
}

.btn-confirmar {
  border: 1px solid #51cf66;
  color: #51cf66;
}

.btn-confirmar:hover {
  background-color: #51cf66;
  color: white;
}
</style>
