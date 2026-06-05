<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import * as echarts from 'echarts'
import { useECharts } from '../utils/useECharts'
import type { LineChartData } from '../types'

interface Props {
  data: LineChartData
}

const { data } = defineProps<Props>()
const chartRef = useTemplateRef<HTMLElement>('chartRef')

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
    data: data.series.map((s) => s.name),
    textStyle: { color: 'rgba(255,255,255,0.65)' },
    right: 10,
    top: 5,
  },
  xAxis: {
    type: 'category',
    data: data.xAxis,
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
  series: data.series.map((s, i) => ({
    name: s.name,
    type: 'line' as const,
    data: s.data,
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: {
      width: 2,
      color: i === 0 ? '#00d4ff' : '#00e396',
    },
    itemStyle: {
      color: i === 0 ? '#00d4ff' : '#00e396',
    },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: i === 0 ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 227, 150, 0.3)' },
        { offset: 1, color: i === 0 ? 'rgba(0, 212, 255, 0.02)' : 'rgba(0, 227, 150, 0.02)' },
      ]),
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
