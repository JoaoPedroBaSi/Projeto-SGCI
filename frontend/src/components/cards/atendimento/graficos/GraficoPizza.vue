<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  type ChartOptions // Importando o tipo
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

defineProps<{
  chartData: any,
  chartOptions?: any
}>()

// Aplicando a tipagem correta
const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    }
  }
}
</script>
<template>
  <Pie :data="chartData" :options="chartOptions" />
</template>
