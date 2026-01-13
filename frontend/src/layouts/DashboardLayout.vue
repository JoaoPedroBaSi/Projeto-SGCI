<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userName = ref('');
const userType = ref('');
const menuItems = ref([{ label: 'Início', icon: '🏠', route: '/dashboard' }]);

const logout = () => {
    localStorage.clear();
    router.push('/');
};

onMounted(() => {
    const data = localStorage.getItem('user_data');
    if (data) {
        const user = JSON.parse(data);
        
        userName.value = user.fullName || user.nome || 'Usuário';
        
        const tipo = user.perfil_tipo || user.perfilTipo || 'cliente';
        userType.value = tipo;

        // Monta o menu baseado no tipo encontrado
        if (tipo === 'cliente') {
            menuItems.value.push(
                { label: 'Meus Agendamentos', icon: '📅', route: '/agendamentos' },
                { label: 'Minha Saúde', icon: '❤️', route: '/saude' },
                { label: 'Financeiro', icon: '💰', route: '/financeiro' }
            );
        } else if (tipo === 'profissional') {
            menuItems.value.push(
                { label: 'Minha Agenda', icon: '📅', route: '/agenda' },
                { label: 'Pacientes', icon: '👥', route: '/pacientes' },
                
                // ✅✅✅ CORREÇÃO AQUI: Link ajustado ✅✅✅
                { label: 'Salas', icon: '🏥', route: '/profissional/pagamento-salas' }, 
                
                { label: 'Solicitar Material', icon: '📦', route: '/profissional/solicitar-reposicao' },
                { label: 'Financeiro', icon: '💰', route: '/profissional/financeiro' } 
            );
        } else if (tipo === 'admin') {
             menuItems.value.push(
                { label: 'Aprovações', icon: '✅', route: '/admin/aprovacoes' },
                { label: 'Gerenciar Salas', icon: '🏢', route: '/admin/salas' },
                { label: 'Aprovar Reservas', icon: '🗓️', route: '/admin/reservas' }, 
            );
        }
        
        menuItems.value.push({ label: 'Conta / Perfil', icon: '👤', route: '/perfil' });
    } else {
        router.push('/');
    }
});
</script>

<template>
    <div class="dashboard-container">
        <aside class="sidebar">
            <div class="logo">
                <div class="logo-placeholder">🛡️</div>
                <h2>SGCI</h2>
            </div>
            
            <nav>
                <router-link 
                    v-for="item in menuItems" 
                    :key="item.route" 
                    :to="item.route" 
                    class="menu-item"
                    active-class="active"
                >
                    <span class="icon">{{ item.icon }}</span>
                    {{ item.label }}
                </router-link>
            </nav>

            <button @click="logout" class="btn-logout">
                ↪ Sair
            </button>
        </aside>

        <main class="content">
            <header class="top-header">
                <h2>Olá, {{ userName }}!</h2>
                <span class="badge">{{ userType.toUpperCase() }}</span>
            </header>

            <hr class="divider">

            <slot></slot> 
            
        </main>
    </div>
</template>

<style scoped>
/* CONFIGURAÇÕES GERAIS */
.dashboard-container { display: flex; height: 100vh; background-color: #f0f9ff; font-family: 'Montserrat', sans-serif; }
.sidebar { width: 260px; background-color: #117a8b; color: white; display: flex; flex-direction: column; padding: 30px 20px; }
.logo { text-align: center; margin-bottom: 50px; }
.logo h2 { font-size: 2rem; margin: 0; }
.menu-item { display: flex; align-items: center; gap: 15px; padding: 12px 15px; color: #ccfbf1; text-decoration: none; border-radius: 8px; margin-bottom: 8px; transition: 0.3s; }
.menu-item:hover, .active { background-color: rgba(255,255,255,0.2); font-weight: bold; color: white; }
.btn-logout { margin-top: auto; background: transparent; border: 1px solid rgba(255,255,255,0.5); color: white; padding: 10px; border-radius: 6px; cursor: pointer; }
.content { flex: 1; padding: 40px 60px; overflow-y: auto; }
.top-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.top-header h2 { color: #117a8b; font-size: 1.8rem; margin: 0; }
.badge { background-color: #2dd4bf; color: #0f766e; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
.divider { border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 30px; }
</style>