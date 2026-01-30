<script setup lang="ts">
import api from '@/services/api';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// 1. Declaramos perfilAtivo como a única fonte de dados
const perfilAtivo = ref<any>(null);
const route = useRoute();

const carregarDados = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const response = await api.get('/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data) {
      perfilAtivo.value = response.data;
    }
  } catch (err) {
    console.error("Erro ao carregar perfil /me:", err);
    // Se der erro 401, pode ser token expirado
  }
}

watch(() => route.params.id, () => carregarDados());
onMounted(carregarDados);
</script>

<template>
  <div class="infos-perfil">
    <div class="foto">
      <img src="https://cdn-icons-png.flaticon.com/512/12225/12225881.png" alt="Perfil">
    </div>
    <div class="texto">
      <p class="nome">{{ perfilAtivo?.nome || 'Carregando...' }}</p>
      <p class="email">{{ perfilAtivo?.email || 'E-mail não informado' }}</p>
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
