<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement,
  PointElement, CategoryScale, LinearScale
} from 'chart.js'

// Registro obrigatório dos módulos do Chart.js
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

defineProps<{
  chartData: any,
  chartOptions?: any
}>()

// Opções padrão para garantir que o gráfico preencha o container
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}
</script>
