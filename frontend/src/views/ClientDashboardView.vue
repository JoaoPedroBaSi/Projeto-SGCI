<script setup lang="ts">
// Importa a moldura (Layout)
import DashboardLayout from '@/layouts/DashboardLayout.vue';
</script>

<template>
    <DashboardLayout>
        <div class="painel-cliente">
            <h1>Área do Paciente</h1>
            <p>Seja bem-vindo!</p>
            <div class="aviso">
                🚧 Esta tela será construída pelo Kauê (Tarefas 06 e 08).
            </div>
        </div>
    </DashboardLayout>
</template>

<style scoped>
.painel-cliente { padding: 30px; }
.aviso { background: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 20px; color: #856404; }
</style>