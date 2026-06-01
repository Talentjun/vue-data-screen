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

const CHINA_GEO_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'

const initChart = async () => {
  if (!chartRef.value) return

  try {
    const response = await fetch(CHINA_GEO_URL)
    const chinaGeoJson = await response.json()

    featureNames = chinaGeoJson.features.map((f: any) => f.properties.name)

    echarts.registerMap('china', chinaGeoJson as any)

    chart = echarts.init(chartRef.value)
    setOption()
  } catch (error) {
    console.error('Failed to load China map data:', error)
    if (chartRef.value) {
      chartRef.value.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.5);">地图数据加载失败</div>'
    }
  }
}

const setOption = () => {
  if (!chart) return

  const HIGHLIGHT_STYLE = {
    areaColor: '#1a6fb5',
    borderColor: '#00d4ff',
    borderWidth: 2,
    shadowColor: 'rgba(0, 212, 255, 0.8)',
    shadowBlur: 20,
  }

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        const name = params.name.replace(/省|市|自治区|维吾尔|壮族|回族|特别行政区/g, '')
        return `${name}<br/>数据量: ${params.value || 0}`
      },
    },
    visualMap: {
      min: 0,
      max: 2500,
      left: 20,
      bottom: 20,
      text: ['高', '低'],
      textStyle: { color: 'rgba(255,255,255,0.65)' },
      inRange: {
        color: ['#0a2e5c', '#0d4a8a', '#1a6fb5', '#2196f3', '#42a5f5', '#64b5f6'],
      },
      show: true,
      itemWidth: 12,
      itemHeight: 100,
    },
    series: [
      {
        type: 'map',
        map: 'china',
        roam: false,
        zoom: 1.2,
        center: [104, 36],
        data: featureNames.map((name) => {
          const shortName = name.replace(/省|市|自治区|维吾尔|壮族|回族|特别行政区/g, '')
          const found = props.data.find(d => d.name === shortName)
          return { name, value: found ? found.value : 0 }
        }),
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          },
          itemStyle: HIGHLIGHT_STYLE,
        },
        itemStyle: {
          areaColor: '#0d3b6e',
          borderColor: 'rgba(0, 212, 255, 0.4)',
          borderWidth: 1,
        },
        select: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          },
          itemStyle: HIGHLIGHT_STYLE,
        },
        selectedMode: 'single',
      },
    ],
  }

  chart.setOption(option)

  chart.on('mouseover', () => {
    stopHighlightLoop()
    if (currentHighlightName) {
      chart!.dispatchAction({ type: 'unselect', seriesIndex: 0, name: currentHighlightName })
      chart!.dispatchAction({ type: 'hideTip', seriesIndex: 0 })
      currentHighlightName = ''
    }
  })

  chart.on('mouseout', () => {
    startHighlightLoop()
  })

  startHighlightLoop()
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
  if (!chart || featureNames.length === 0) return

  if (currentHighlightName) {
    chart.dispatchAction({ type: 'unselect', seriesIndex: 0, name: currentHighlightName })
  }

  let newName: string
  do {
    newName = featureNames[Math.floor(Math.random() * featureNames.length)]
  } while (newName === currentHighlightName && featureNames.length > 1)

  currentHighlightName = newName

  chart.dispatchAction({ type: 'select', seriesIndex: 0, name: newName })
  chart.dispatchAction({ type: 'showTip', seriesIndex: 0, name: newName })
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
