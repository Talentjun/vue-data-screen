import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import * as echarts from 'echarts'

export function useECharts(chartRef: Ref<HTMLElement | null>, options: Ref<echarts.EChartsOption>) {
  const chart = ref<echarts.ECharts | null>(null)
  let resizeObserver: ResizeObserver | null = null

  const initChart = () => {
    if (!chartRef.value) return
    chart.value = echarts.init(chartRef.value, undefined, {
      renderer: 'canvas',
    })
    chart.value.setOption(options.value)
  }

  const handleResize = () => {
    chart.value?.resize()
  }

  watch(
    options,
    (newOpts) => {
      if (chart.value) {
        chart.value.setOption(newOpts, true)
      }
    },
    { deep: true },
  )

  onMounted(() => {
    initChart()
    if (chartRef.value) {
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(chartRef.value)
    }
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    chart.value?.dispose()
    resizeObserver?.disconnect()
    window.removeEventListener('resize', handleResize)
  })

  return { chart }
}
