<script setup lang="ts">
const props = defineProps<{
  qtdAtendimentosConfirmados: number
  qtdAtendimentosAguardandoPagamento: number
  qtdAtendimentosNoHistorico: number
  finalidade: string
}>();
</script>
<template>
  <div class="card">
    <div class="texto confirmado" v-if="props.finalidade === 'CONFIRMADO'">
      <p>VOCÊ TEM {{ props.qtdAtendimentosConfirmados }} ATENDIMENTOS AGENDADOS</p>
      <div class="botao-link">
        <RouterLink to="/cliente/agenda" class="link">Visualizar agenda -></RouterLink>
      </div>
    </div>
    <div class="texto aguardando" v-else-if="props.finalidade === 'AGUARDANDO'">
      <p>VOCÊ TEM {{ props.qtdAtendimentosAguardandoPagamento }} PAGAMENTOS PENDENTES</p>
    </div>
    <div class="texto historico" v-else-if="props.finalidade === 'CONCLUIDO'">
      <p>VOCÊ TEM {{ props.qtdAtendimentosNoHistorico }} ATENDIMENTOS NO HISTÓRICO</p>
      <div class="botao-link">
        <RouterLink to="/cliente/historico" class="link">Visualizar histórico -></RouterLink>
      </div>
    </div>
  </div>
</template>
<style scoped lang="css">
.card {
  display: flex;
  flex-direction: column;
  height: 230px;
  background-color: transparent;
  border-radius: 20px;
  box-shadow: 4px 4px 8px 4px rgba(0, 0, 0, 0.1);
  justify-content: center;
}
.card .texto {
  width: 100%;
  align-items: center;
}
.card .texto p {
  text-align: center;
  font-weight: bold;
  color: #128093;
}
.texto.aguardando {
  padding-top: 40px;
  padding-bottom: 40px;
}
.texto.confirmado {
  padding-top: 40px;
  padding-bottom: 40px;
}
.texto.historico {
  padding-top: 40px;
  padding-bottom: 40px;
}
.botao-link{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
}
.link{
  text-decoration: none;
  color: #128093;
}
</style>
