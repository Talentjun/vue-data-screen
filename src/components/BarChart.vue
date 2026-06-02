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

const colors = ['#00bfff', '#ff4757']

const options = computed<echarts.EChartsOption>(() => ({
  backgroundColor: 'transparent',
  grid: {
    top: 35,
    right: 20,
    bottom: 10,
    left: 55,
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
    axisLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
    axisLine: { show: false },
    axisLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
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
        { offset: 0.5, color: `${colors[i]}cc` },
        { offset: 1, color: `${colors[i]}66` },
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
          { offset: 0.2, color: colors[i] },
          { offset: 1, color: `${colors[i]}99` },
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
  min-height: 200px;
}
</style>
