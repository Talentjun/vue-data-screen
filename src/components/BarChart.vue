<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as echarts from 'echarts'
import { useECharts } from '../utils/useECharts'
import type { BarChartData } from '../types'

interface Props {
  data: BarChartData
}

const props = defineProps<Props>()
const chartRef = ref<HTMLElement | null>(null)

const colors = ['#00e5ff', '#ff2d55']

const options = computed<echarts.EChartsOption>(() => ({
  backgroundColor: 'transparent',
  animation: true,
  animationDuration: 800,
  animationEasing: 'cubicOut' as const,
  grid: {
    top: 30,
    right: 15,
    bottom: 30,
    left: 45,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0, 20, 40, 0.9)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
    textStyle: { color: '#fff' },
  },
  legend: {
    data: props.data.series.map((s) => s.name),
    textStyle: { color: 'rgba(255,255,255,0.65)' },
    right: 10,
    top: 5,
  },
  xAxis: {
    type: 'category',
    data: props.data.xAxis,
    axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 6 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 0,
    splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
    axisLine: { show: false },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  },
  series: props.data.series.map((s, i) => ({
    name: s.name,
    type: 'bar' as const,
    data: s.data,
    barWidth: '35%',
    barGap: '20%',
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: colors[i] },
        { offset: 0.5, color: `${colors[i]}dd` },
        { offset: 1, color: `${colors[i]}88` },
      ]),
      borderRadius: [4, 4, 0, 0],
      shadowColor: `${colors[i]}80`,
      shadowBlur: 10,
      shadowOffsetY: 4,
    },
    emphasis: {
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#fff' },
          { offset: 0.15, color: colors[i] },
          { offset: 1, color: `${colors[i]}bb` },
        ]),
        shadowColor: `${colors[i]}cc`,
        shadowBlur: 20,
        shadowOffsetY: 6,
      },
    },
  })),
}))

useECharts(chartRef, options)
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
