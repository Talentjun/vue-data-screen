<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { MapDataItem } from '../types'
import chinaGeoJson from '../data/china.json'

interface Props {
  data: MapDataItem[]
}

const props = defineProps<Props>()
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null
let highlightTimer: ReturnType<typeof setInterval> | null = null
let mouseLeaveTimer: ReturnType<typeof setTimeout> | null = null
let currentHighlightName = ''
let isUserInteracting = false
let featureNames: string[] = []
let allData: { name: string; value: number }[] = []

const BASE_BLUE = ['#0a2e5c', '#0d4a8a', '#1a6fb5', '#2196f3', '#42a5f5', '#64b5f6']

const getColor = (value: number, max: number) => {
  const ratio = Math.min(value / max, 1)
  const idx = Math.round(ratio * (BASE_BLUE.length - 1))
  return BASE_BLUE[idx]
}

const getYellowColor = (value: number, max: number) => {
  const ratio = Math.min(value / max, 1)
  const r = Math.round(255 - (255 - 180) * ratio)
  const g = Math.round(220 - (220 - 120) * ratio)
  const b = Math.round(50 - (50 - 0) * ratio)
  return `rgb(${r}, ${g}, ${b})`
}

const buildAllData = (hoverName: string) => {
  const maxValue = Math.max(...allData.map((d) => d.value), 1)
  return allData.map((d) => {
    const isHover = d.name === hoverName
    const color = isHover ? getYellowColor(d.value, maxValue) : getColor(d.value, maxValue)
    return {
      name: d.name,
      value: d.value,
      itemStyle: {
        areaColor: color,
        borderColor: isHover ? '#d4a017' : 'rgba(0, 212, 255, 0.4)',
        borderWidth: isHover ? 2 : 1,
        shadowColor: isHover ? `rgba(245, 197, 66, 0.6)` : 'transparent',
        shadowBlur: isHover ? 15 : 0,
      },
      label: {
        show: isHover || hoverName === '__all__',
        color: isHover ? '#fff' : 'rgba(255,255,255,0.45)',
        fontSize: isHover ? 12 : 9,
        fontWeight: isHover ? ('bold' as const) : ('normal' as const),
      },
    }
  })
}

const initChart = () => {
  if (!chartRef.value) return

  featureNames = (chinaGeoJson as any).features.map((f: any) => f.properties.name)

  allData = featureNames.map((name) => {
    const shortName = name.replace(/省|市|自治区|维吾尔|壮族|回族|特别行政区/g, '')
    const found = props.data.find((d) => d.name === shortName)
    return { name, value: found ? found.value : 0 }
  })

  echarts.registerMap('china', chinaGeoJson as any)
  chart = echarts.init(chartRef.value)
  renderChart()

  chart.on('mouseover', (params: any) => {
    if (params.componentType !== 'series' || params.seriesType !== 'map') return
    isUserInteracting = true
    if (mouseLeaveTimer) {
      clearTimeout(mouseLeaveTimer)
      mouseLeaveTimer = null
    }
    stopHighlightLoop()
    currentHighlightName = params.name
    renderChart(params.name)
    chart?.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      name: params.name,
    })
  })

  chart.on('mouseout', (params: any) => {
    if (params.componentType !== 'series' || params.seriesType !== 'map') return
    isUserInteracting = false
    if (mouseLeaveTimer) {
      clearTimeout(mouseLeaveTimer)
    }
    chart?.dispatchAction({ type: 'hideTip' })
    mouseLeaveTimer = setTimeout(() => {
      mouseLeaveTimer = null
      if (!isUserInteracting) {
        startHighlightLoop()
      }
    }, 300)
  })

  chart.on('globalout', () => {
    isUserInteracting = false
    if (mouseLeaveTimer) {
      clearTimeout(mouseLeaveTimer)
      mouseLeaveTimer = null
    }
    chart?.dispatchAction({ type: 'hideTip' })
    startHighlightLoop()
  })

  startHighlightLoop()
}

const renderChart = (hoverName?: string) => {
  if (!chart) return

  chart.setOption({
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        if (params.componentType === 'series') {
          return `${params.name}<br/>数据值: ${params.value || 0}`
        }
        return ''
      },
    },
    series: [
      {
        type: 'map',
        map: 'china',
        roam: false,
        zoom: 1.2,
        center: [105, 35],
        aspectScale: 0.75,
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
          },
          itemStyle: {
            areaColor: getYellowColor(
              Math.max(...allData.map((d) => d.value), 1),
              Math.max(...allData.map((d) => d.value), 1),
            ),
          },
        },
        data: buildAllData(hoverName || ''),
      },
    ],
  })
}

const startHighlightLoop = () => {
  stopHighlightLoop()
  randomHighlight()
  highlightTimer = setInterval(() => {
    randomHighlight()
  }, 2500)
}

const stopHighlightLoop = () => {
  if (highlightTimer) {
    clearInterval(highlightTimer)
    highlightTimer = null
  }
}

const randomHighlight = () => {
  if (!chart || allData.length === 0) return

  let newName: string
  do {
    newName = featureNames[Math.floor(Math.random() * featureNames.length)]
  } while (newName === currentHighlightName && featureNames.length > 1)

  currentHighlightName = newName
  renderChart(newName)
  chart.dispatchAction({
    type: 'showTip',
    seriesIndex: 0,
    name: newName,
  })
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartRef.value)
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  stopHighlightLoop()
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer)
    mouseLeaveTimer = null
  }
  chart?.dispose()
  resizeObserver?.disconnect()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
