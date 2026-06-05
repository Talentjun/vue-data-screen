<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import * as echarts from 'echarts'
import { useECharts } from '../utils/useECharts'
import type { ChartDataItem } from '../types'

interface Props {
  data: ChartDataItem[]
}

const { data } = defineProps<Props>()
const chartRef = useTemplateRef<HTMLElement>('chartRef')

const colorPalette = ['#00d4ff', '#00e396', '#feb019', '#ff4560', '#775dd0']

const options = computed<echarts.EChartsOption>(() => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
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
      formatter: '{b}: {c}% ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
    },
    graphic: [
      {
        type: 'group',
        left: 'center',
        top: 'center',
        children: [
          {
            type: 'text',
            left: 'center',
            top: -15,
            style: {
              text: total.toString(),
              fill: '#fff',
              fontSize: 28,
              fontWeight: 'bold',
              fontFamily: 'DIN, Roboto Mono, monospace',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            left: 'center',
            top: 15,
            style: {
              text: '总计',
              fill: 'rgba(255,255,255,0.5)',
              fontSize: 12,
              textAlign: 'center',
            },
          },
        ],
      },
    ],
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '50%'],
        data: data,
        color: colorPalette,
        label: { show: false },
        emphasis: {
          scaleSize: 6,
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        itemStyle: {
          borderColor: 'rgba(0, 20, 40, 0.9)',
          borderWidth: 3,
        },
      },
      {
        type: 'pie',
        radius: ['45%', '47%'],
        center: ['50%', '50%'],
        data: [{ value: 1 }],
        color: 'rgba(0, 212, 255, 0.15)',
        label: { show: false },
        silent: true,
        itemStyle: { borderWidth: 0 },
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
