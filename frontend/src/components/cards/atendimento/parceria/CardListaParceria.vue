<script lang="ts" setup>
// Definindo a interface baseada na sua tabela 'parcerias'
interface Parceria {
  nome: string;
  status_parceria: string;
  data_inicio: string;
  porcentagem_desconto: number;
}

const props = defineProps<{
  parceria: Parceria
}>();

// Emitir eventos para o pai tratar as ações
const emit = defineEmits(['editar', 'apagar']);

// Função para formatar data (Ex: 2010-10-10 -> 10/10/2010)
const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString('pt-BR');
};
</script>

<template>
  <div class="card">
    <div class="cabecalho">
      <div class="info-principal">
        <p class="label">NOME</p>
        <p class="valor"><strong>{{ parceria.nome }}</strong></p>
      </div>

      <div class="info-status">
        <p class="label">STATUS</p>
        <span :class="['status-badge', parceria.status_parceria.toLowerCase()]">
          {{ parceria.status_parceria }}
        </span>
      </div>

      <div class="info-data">
        <p class="label">DATA INÍCIO</p>
        <p class="valor">{{ formatarData(parceria.data_inicio) }}</p>
      </div>

      <div class="info-desconto">
        <p class="label">DESCONTO</p>
        <p class="valor destaque">{{ parceria.porcentagem_desconto }}%</p>
      </div>
    </div>

    <div class="corpo">
      <button class="btn-editar" @click="emit('editar')">
        Editar
      </button>
      <button class="btn-apagar" @click="emit('apagar')">
        Apagar
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
  .card {
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    margin-bottom: 15px;
    border-left: 5px solid #128093; /* Destaque lateral com a sua cor padrão */
  }

  .cabecalho {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    flex: 1;
  }

  .label {
    font-size: 0.7rem;
    color: #888;
    margin: 0 0 5px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .valor {
    margin: 0;
    font-size: 1rem;
    color: #333;
  }

  .destaque {
    color: #128093;
    font-weight: bold;
  }

  /* Estilo para o Status */
  .status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  .ativo { background-color: #e6f4ea; color: #1e7e34; }
  .pendente { background-color: #fff4e5; color: #b7791f; }
  .inativo { background-color: #fce8e8; color: #c53030; }

  .corpo {
    display: flex;
    gap: 10px;
    margin-left: 20px;
  }

  /* Estilo dos Botões */
  button {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: 0.3s;
  }

  .btn-editar {
    background-color: #f0f7f8;
    color: #128093;
  }

  .btn-editar:hover {
    background-color: #128093;
    color: white;
  }

  .btn-apagar {
    background-color: #fff1f0;
    color: #f5222d;
  }

  .btn-apagar:hover {
    background-color: #f5222d;
    color: white;
  }

  @media screen and (max-width: 900px) {
    .cabecalho {
      grid-template-columns: 1fr 1fr;
    }
    .card {
      flex-direction: column;
      align-items: flex-start;
    }
    .corpo {
      margin-top: 20px;
      margin-left: 0;
    }
  }
</style>
