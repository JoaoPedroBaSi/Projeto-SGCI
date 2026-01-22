<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { ref, onMounted, reactive } from 'vue';
// CORREÇÃO 1: Usando a instância configurada da API
import api from '@/services/api';

const isLoading = ref(true);
const salas = ref<any[]>([]);
const showModal = ref(false);
const isEditing = ref(false);

const form = reactive({
    id: null,
    nome: '',
    capacidade_pacientes: 0,
    preco_aluguel: 0.0,
    data_disponibilidade: '',
    status: 'DISPONIVEL'
});

// CORREÇÃO 2: Função getAuthHeader removida (o api.ts já faz isso)

const fetchSalas = async () => {
    try {
        // CORREÇÃO 3: Chamada direta para a rota relativa
        const response = await api.get('/sala');
        salas.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar salas:", error);
    } finally {
        isLoading.value = false;
    }
};

const openModal = (sala: any = null) => {
    if (sala) {
        isEditing.value = true;
        form.id = sala.id;
        form.nome = sala.nome;
        // Backend manda camelCase (capacidadePacientes), Form usa snake_case
        form.capacidade_pacientes = sala.capacidadePacientes;
        form.preco_aluguel = Number(sala.precoAluguel);
        
        // Tratamento seguro de data para o input type="date"
        form.data_disponibilidade = sala.dataDisponibilidade ? sala.dataDisponibilidade.split('T')[0] : '';
        form.status = sala.status;
    } else {
        isEditing.value = false;
        form.id = null;
        form.nome = '';
        form.capacidade_pacientes = 0;
        form.preco_aluguel = 0;
        form.data_disponibilidade = '';
        form.status = 'DISPONIVEL';
    }
    showModal.value = true;
};

const saveSala = async () => {
    try {
        // Convertendo para o formato que o Adonis espera (camelCase)
        const payload = {
            nome: form.nome,
            capacidadePacientes: Number(form.capacidade_pacientes),
            precoAluguel: Number(form.preco_aluguel),
            dataDisponibilidade: form.data_disponibilidade,
            status: form.status,
            profissionalId: undefined 
        };

        if (isEditing.value && form.id) {
            // CORREÇÃO 4: api.put sem headers manuais
            await api.put(`/sala/${form.id}`, payload);
            alert('Sala atualizada com sucesso!');
        } else {
            // CORREÇÃO 5: api.post sem headers manuais
            await api.post('/sala', payload);
            alert('Sala cadastrada com sucesso!');
        }

        showModal.value = false;
        fetchSalas(); 

    } catch (error: any) {
        console.error("Erro ao salvar:", error);
        const msg = error.response?.data?.message || 'Erro ao salvar sala.';
        let errors = '';

        if (error.response?.data?.errors) {
             errors = error.response.data.errors.map((e: any) => `• ${e.message}`).join('\n');
        }
        alert(`${msg}\n\n${errors}`);
    }
};

const deleteSala = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) return;

    try {
        // CORREÇÃO 6: api.delete
        await api.delete(`/sala/${id}`);
        fetchSalas();
    } catch (error) {
        alert('Erro ao excluir sala. Verifique se não há agendamentos vinculados.');
    }
};

// Formatadores visuais
const formatMoney = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
};

onMounted(() => {
    fetchSalas();
});
</script>

<template>
    <DashboardLayout>
        <div class="page-content">
            <div class="header-section">
                <div>
                    <h1 class="page-title">Gerenciamento de Salas</h1>
                    <span class="breadcrumb">Recursos / <span class="active">Salas</span></span>
                </div>
            </div>

            <div class="main-card">
                <div class="card-top">
                    <h3 class="card-title">Salas Cadastradas ({{ salas.length }})</h3>
                    <button class="btn-novo" @click="openModal(null)">+ Nova Sala</button>
                </div>

                <div class="table-responsive">
                    <table class="styled-table">
                        <thead>
                            <tr>
                                <th>NOME (ID)</th>
                                <th>DATA DISP.</th>
                                <th>CAP. PACIENTES</th>
                                <th>VALOR/HORA</th>
                                <th>STATUS</th>
                                <th>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="sala in salas" :key="sala.id">
                                <td>
                                    <div class="sala-info">
                                        <div class="sala-icon">🏢</div>
                                        <div>
                                            <strong>{{ sala.nome }}</strong>
                                            <div class="sala-id">#{{ sala.id }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{{ formatDate(sala.dataDisponibilidade) }}</td>
                                <td>{{ sala.capacidadePacientes }}</td>
                                <td><strong>{{ formatMoney(sala.precoAluguel) }}</strong></td>
                                <td>
                                    <span class="status-badge" :class="sala.status === 'DISPONIVEL' ? 'status-green' : (sala.status === 'OCUPADO' ? 'status-red' : 'status-yellow')">
                                        {{ sala.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-icon edit" @click="openModal(sala)">✏️</button>
                                    <button class="btn-icon delete" @click="deleteSala(sala.id)">🗑️</button>
                                </td>
                            </tr>
                            <tr v-if="salas.length === 0">
                                <td colspan="6" class="text-center">Nenhuma sala cadastrada.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>{{ isEditing ? 'Editar Sala' : 'Cadastrar Nova Sala' }}</h2>
                </div>
                
                <form @submit.prevent="saveSala" class="modal-form">
                    <div class="form-group">
                        <label>NOME DA SALA</label>
                        <input type="text" v-model="form.nome" placeholder="Ex: Sala 05" required class="input-flat">
                    </div>

                    <div class="row-dupla">
                        <div class="form-group">
                            <label>CAPACIDADE PACIENTES</label>
                            <input type="number" v-model="form.capacidade_pacientes" required class="input-flat">
                        </div>
                        <div class="form-group">
                            <label>PREÇO ALUGUEL (R$)</label>
                            <input type="number" step="0.01" v-model="form.preco_aluguel" required class="input-flat">
                        </div>
                    </div>

                    <div class="row-dupla">
                        <div class="form-group">
                            <label>DATA DISPONIBILIDADE</label>
                            <input type="date" v-model="form.data_disponibilidade" required class="input-flat">
                        </div>
                        <div class="form-group">
                            <label>STATUS</label>
                            <select v-model="form.status" class="input-flat">
                                <option value="DISPONIVEL">DISPONÍVEL</option>
                                <option value="OCUPADO">OCUPADO</option>
                                <option value="MANUTENÇÃO">MANUTENÇÃO</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>
                        <button type="submit" class="btn-save">Salvar Sala</button>
                    </div>
                </form>
            </div>
        </div>
    </DashboardLayout>
</template>

<style scoped>
/* Fonte e Cores baseadas no Figma */
.page-content { padding: 30px; font-family: 'Montserrat', sans-serif; background-color: #f8f9fa; min-height: 100vh; }

/* Header */
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.page-title { color: #117a8b; font-size: 1.8rem; font-weight: 700; margin: 0; }
.breadcrumb { color: #64748b; font-size: 0.9rem; }
.active { color: #117a8b; font-weight: 600; }

/* Card Principal */
.main-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 25px; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-title { font-size: 1.2rem; color: #334155; font-weight: 700; margin: 0; }

/* Botão Nova Sala */
.btn-novo { background-color: #117a8b; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-novo:hover { background-color: #0e7490; }

/* Tabela */
.styled-table { width: 100%; border-collapse: collapse; }
.styled-table th { text-align: left; color: #94a3b8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 15px 10px; border-bottom: 1px solid #e2e8f0; }
.styled-table td { padding: 15px 10px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 0.9rem; vertical-align: middle; }

/* Ícone da Sala */
.sala-info { display: flex; align-items: center; gap: 12px; }
.sala-icon { width: 40px; height: 40px; background: #e0f2fe; color: #0ea5e9; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1.2rem; }
.sala-id { font-size: 0.75rem; color: #94a3b8; }

/* Status Badges */
.status-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-green { background-color: #dcfce7; color: #166534; } /* Disponível */
.status-red { background-color: #fee2e2; color: #991b1b; }   /* Ocupado */
.status-yellow { background-color: #fef3c7; color: #92400e; } /* Manutenção */

/* Botões de Ação */
.btn-icon { background: none; border: 1px solid #e2e8f0; border-radius: 6px; width: 32px; height: 32px; cursor: pointer; margin-right: 5px; transition: 0.2s; }
.edit:hover { background-color: #e0f2fe; border-color: #38bdf8; }
.delete:hover { background-color: #fee2e2; border-color: #f87171; }

/* MODAL IGUAL FIGMA */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-content { background: white; width: 100%; max-width: 600px; border-radius: 12px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header h2 { color: #117a8b; font-size: 1.4rem; margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; }

/* Inputs do Modal (Estilo Clean/Flat) */
.form-group { margin-bottom: 20px; }
.form-group label { display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
.input-flat { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; color: #334155; outline: none; transition: 0.2s; box-sizing: border-box; }
.input-flat:focus { border-color: #117a8b; box-shadow: 0 0 0 3px rgba(17, 122, 139, 0.1); }

.row-dupla { display: flex; gap: 20px; }
.row-dupla .form-group { flex: 1; }

.modal-actions { display: flex; justify-content: space-between; margin-top: 30px; }
.btn-cancel { background: white; border: 1px solid #cbd5e1; color: #64748b; padding: 10px 25px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-cancel:hover { background: #f1f5f9; }
.btn-save { background: #117a8b; border: none; color: white; padding: 10px 30px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-save:hover { background: #0e7490; }
</style>