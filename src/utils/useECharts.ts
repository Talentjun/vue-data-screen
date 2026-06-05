import { ref, onMounted, onUnmounted, watch, onWatcherCleanup, type Ref } from 'vue'
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

  // 监听 chartRef 变化，在 ref 元素变更时重新初始化图表
  watch(chartRef, (newEl, oldEl) => {
    // 清理旧的 ResizeObserver
    resizeObserver?.disconnect()
    resizeObserver = null

    if (newEl) {
      // 旧图表实例先销毁
      chart.value?.dispose()
      initChart()
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(newEl)
    }

    onWatcherCleanup(() => {
      resizeObserver?.disconnect()
      resizeObserver = null
    })
  })

  onMounted(() => {
    if (!chart.value) {
      initChart()
    }
    if (chartRef.value && !resizeObserver) {
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
