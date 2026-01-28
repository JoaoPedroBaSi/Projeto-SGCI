<script lang="ts" setup>
import CardCadastroParceria from '@/components/cards/atendimento/parceria/CardCadastroParceria.vue';

import api from '@/services/api';
import { ref } from 'vue';

const form = ref({
  nome: '',
  ramo: '',
  cnpj: '',
  cep: '',
  cidade: '',
  bairro: '',
  rua: '',
  numero: '',
  tipo_convenio: '',      // Snake_case para bater com o Vine
  data_inicio: '',        // Snake_case para bater com o Vine
  site_url: '',           // Snake_case para bater com o Vine
  status_parceria: 'EM NEGOCIACAO',
  porcentagem_desconto: 0,
  tipo_relacionamento: 'ENTRADA' // Valor padrão para não vir vazio
});

const cadastrar = async () => {
  const token = localStorage.getItem('auth_token');

  try {
    const payload = {
      ...form.value,
      cnpj: form.value.cnpj.replace(/\D/g, ''),
      cep: form.value.cep.replace(/\D/g, ''),
      porcentagem_desconto: Number(form.value.porcentagem_desconto), // Garantia extra
      site_url: form.value.site_url || null,
      data_inicio: form.value.status_parceria === 'EM NEGOCIACAO' ? null : form.value.data_inicio
    };

    // Usando a instância 'api' configurada
    const response = await api.post('/parceria', payload, {
      headers: {
        // Certifique-se de que NÃO há espaços extras ou caracteres ocultos
        'Authorization': `Bearer ${token?.trim()}`
      }
    });

    alert('Parceria cadastrada com sucesso!');
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error("ERRO 401: O servidor rejeitou o token ou o perfil não é ADMIN.");
      console.error("Detalhes do erro no back-end:", error.response.data);
      alert('Sessão inválida ou você não tem permissão de Administrador.');
    } else if (error.response?.status === 422) {
      console.warn("ERRO 422 (Vine):", error.response.data.errors);
      alert('Dados inválidos. Verifique os campos.');
    } else {
      console.error("Erro inesperado:", error);
    }
  }
};
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h3>Gestão de Parcerias</h3>
      <div class="opcoes">
        <RouterLink to="/cadastro/parceria" class="botao-opcao">Cadastrar parceria</RouterLink>
        <RouterLink to="/parcerias" class="botao-opcao">Lista de parcerias</RouterLink>
      </div>
    </header>

    <main class="content">
      <section class="section-card">
        <CardCadastroParceria />
      </section>
    </main>
  </div>
</template>

<style scoped>
  h3{
    padding-bottom: 10px;
  }
  .botao-opcao {
    margin-right: 10px;
    text-decoration: none;
    padding: 6px 12px;
    border: 1px solid #a0a0a0;
    color: #a0a0a0;
    border-radius: 5px;
    font-size: 14px;
    transition: all 0.2s;
  }
  .botao-opcao:hover {
    cursor: pointer;
    border-color: #128093;
    background-color: rgb(217, 255, 242);
    color: #128093;
  }
  .page-container {
    background-color: #e0e0e0; /* Cinza de fundo que você usou na Agenda */
    min-height: 100vh;
  }

  .page-header {
    background: white;
    padding: 50px;
    margin-bottom: 30px;
  }

  .page-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
  }

  .section-card {
    display: flex;
    justify-content: center;
    padding: 0 20px 40px;
  }
</style>
