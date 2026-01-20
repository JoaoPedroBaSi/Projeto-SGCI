<script setup lang="ts">
import api from '@/services/api';
import type { Cliente } from '@/types';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const clienteLogado = ref<Cliente | null>(null);
const route = useRoute();
const carregarDados = async () => {
  try {
  const cliResponse = await api.get('/cliente');
  const clienteEncontrado = cliResponse.data[0];

  if (clienteEncontrado) {
    console.log("ID do Cliente:", clienteEncontrado.id);
    clienteLogado.value = clienteEncontrado;
}

} catch (err) {
  console.error("Erro:", err);
}
}
// Observa mudanças na URL (ID) para recarregar os dados automaticamente
watch(() => route.params.id, () => {
  carregarDados();
});

onMounted(carregarDados);
</script>

<template>
  <div class="infos-perfil">
    <div class="foto">
      <img src="https://cdn-icons-png.flaticon.com/512/12225/12225881.png" alt="Perfil">
    </div>
    <div class="texto">
      <p class="nome">{{ clienteLogado?.nome }}</p>
      <p class="email">{{ clienteLogado?.email || 'E-mail não informado' }}</p>
    </div>
  </div>
</template>

<style lang="css" scoped>
  .infos-perfil {
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 1px solid #eee;
    padding-left: 20px;
  }
  .infos-perfil img { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; }
  .texto p { margin: 0; line-height: 1.2; }
  .texto .email { color: #666; font-size: 0.85rem; }
</style>
