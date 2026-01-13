<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
</script>

<template>
    <DashboardLayout>
        <div class="profissional-dashboard">
            <div class="welcome-box">
                <h2>🩺 Área do Profissional</h2>
                <p>Bem-vindo, doutor(a)!</p>
                <div class="aviso">
                    🚧 Tela em construção (Sprint 2)
                </div>
            </div>
        </div>
    </DashboardLayout>
</template>

<style scoped>
.profissional-dashboard { padding: 30px; }
.welcome-box { background: white; padding: 30px; border-radius: 12px; border-left: 5px solid #117a8b; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.welcome-box h2 { color: #117a8b; margin-top: 0; }
.aviso { background: #e0f2f1; color: #00695c; padding: 15px; border-radius: 8px; margin-top: 20px; font-weight: bold; }
</style>