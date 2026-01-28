<script setup lang="ts">
import api from '@/services/api';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// 1. Declaramos perfilAtivo como a única fonte de dados
const perfilAtivo = ref<any>(null);
const route = useRoute();

const carregarDados = async () => {
  try {
    const userDataRaw = localStorage.getItem('user_data');
    const token = localStorage.getItem('auth_token');

    if (!userDataRaw || !token) return;

    const userData = JSON.parse(userDataRaw);

    // CORREÇÃO 1: Ajustar para 'cliente' (singular) conforme seu log mostrou
    const perfilTipo = userData.perfil_tipo;
    const rota = (perfilTipo === 'cliente' || perfilTipo === 'clientes')
                 ? '/cliente'
                 : '/profissionais';

    const response = await api.get(rota, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const dados = Array.isArray(response.data) ? response.data[0] : response.data;

    if (dados) {
      perfilAtivo.value = dados;
    }
  } catch (err) {
    console.error("Erro ao carregar dados do perfil:", err);
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
