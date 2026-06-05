<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import * as echarts from 'echarts'
import { useECharts } from '../utils/useECharts'
import type { CalendarChartData } from '../types'

interface Props {
  data: CalendarChartData
}

const { data } = defineProps<Props>()
const chartRef = useTemplateRef<HTMLElement>('chartRef')

const options = computed<echarts.EChartsOption>(() => {
  const maxValue = Math.max(...data.data.map((item) => item[1]))

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        const date = params.data[0]
        const value = params.data[1]
        return `${date}<br/>访问量: ${value}`
      },
    },
    visualMap: {
      show: true,
      min: 0,
      max: maxValue,
      inRange: {
        color: ['#0a2e5c', '#0d4a8a', '#1a6fb5', '#2196f3', '#42a5f5', '#00e5ff'],
      },
      textStyle: {
        color: 'rgba(255,255,255,0.65)',
      },
      orient: 'horizontal',
      left: 'center',
      bottom: 5,
      itemWidth: 12,
      itemHeight: 80,
    },
    calendar: {
      top: 30,
      left: 40,
      right: 20,
      bottom: 50,
      cellSize: ['auto', 13],
      range: String(data.year),
      itemStyle: {
        borderWidth: 2,
        borderColor: 'rgba(0, 20, 40, 0.8)',
        color: 'rgba(0, 212, 255, 0.05)',
      },
      yearLabel: {
        show: true,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
      },
      monthLabel: {
        show: true,
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
      },
      dayLabel: {
        show: true,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 9,
        nameMap: ['日', '一', '二', '三', '四', '五', '六'],
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.2)',
          width: 1,
        },
      },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data.data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 212, 255, 0.5)',
          },
        },
      },
    ],
  }
})

useECharts(chartRef, options)
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
