<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { MapDataItem } from '../types'

interface Props {
  data: MapDataItem[]
}

const props = defineProps<Props>()
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null
let highlightTimer: ReturnType<typeof setInterval> | null = null
let currentHighlightName = ''
let featureNames: string[] = []
let allData: { name: string; value: number }[] = []

const CHINA_GEO_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'

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
  const maxValue = Math.max(...allData.map(d => d.value), 1)
  return allData.map(d => {
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

const initChart = async () => {
  if (!chartRef.value) return

  try {
    const response = await fetch(CHINA_GEO_URL)
    const chinaGeoJson = await response.json()
    featureNames = chinaGeoJson.features.map((f: any) => f.properties.name)

    allData = featureNames.map((name) => {
      const shortName = name.replace(/省|市|自治区|维吾尔|壮族|回族|特别行政区/g, '')
      const found = props.data.find(d => d.name === shortName)
      return { name, value: found ? found.value : 0 }
    })

    echarts.registerMap('china', chinaGeoJson as any)
    chart = echarts.init(chartRef.value)
    renderChart()

    chart.on('mouseover', (params: any) => {
      if (params.componentType !== 'series' || params.seriesType !== 'map') return
      stopHighlightLoop()
      currentHighlightName = params.name
      renderChart(params.name)
    })

    chart.on('mouseout', () => {
      startHighlightLoop()
    })

    startHighlightLoop()
  } catch (error) {
    console.error('Failed to load China map data:', error)
    if (chartRef.value) {
      chartRef.value.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.5);">地图数据加载失败</div>'
    }
  }
}

const renderChart = (hoverName?: string) => {
  if (!chart) return

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        if (params.componentType === 'series') {
          const name = params.name.replace(/省|市|自治区|维吾尔|壮族|回族|特别行政区/g, '')
          return `${name}<br/>数据量: ${params.value || 0}`
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
        center: [104, 36],
        data: buildAllData(hoverName || ''),
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          },
          itemStyle: {
            areaColor: '#f5c542',
            borderColor: '#d4a017',
            borderWidth: 2,
            shadowColor: 'rgba(245, 197, 66, 0.8)',
            shadowBlur: 20,
          },
        },
      },
    ],
  }, true)
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
  chart?.dispose()
  resizeObserver?.disconnect()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
