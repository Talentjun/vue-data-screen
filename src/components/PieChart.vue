<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as echarts from 'echarts'
import { useECharts } from '../utils/useECharts'
import type { ChartDataItem } from '../types'

interface Props {
  data: ChartDataItem[]
}

const props = defineProps<Props>()
const chartRef = ref<HTMLElement | null>(null)

const colorPalette = ['#00d4ff', '#00e396', '#feb019', '#ff4560', '#775dd0', '#546E7A', '#26a69a']

const options = computed<echarts.EChartsOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(0, 20, 40, 0.9)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
    textStyle: { color: '#fff' },
    formatter: '{b}: {c} ({d}%)',
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
  series: [
    {
      type: 'pie',
      radius: ['0%', '65%'],
      center: ['40%', '45%'],
      data: props.data,
      color: colorPalette,
      label: {
        show: false,
      },
      emphasis: {
        scaleSize: 8,
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
      itemStyle: {
        borderColor: 'rgba(0, 20, 40, 0.9)',
        borderWidth: 2,
      },
    },
  ],
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
