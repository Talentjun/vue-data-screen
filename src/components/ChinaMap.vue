<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { MapDataItem } from '../types'
import chinaGeoJson from '../data/china.json'

interface Props {
  data: MapDataItem[]
}

const { data } = defineProps<Props>()
const chartRef = useTemplateRef<HTMLElement>('chartRef')
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null
let highlightTimer: ReturnType<typeof setInterval> | null = null
let mouseLeaveTimer: ReturnType<typeof setTimeout> | null = null
let currentHighlightName = ''
let isUserInteracting = false
let featureNames: string[] = []
let allData: { name: string; value: number }[] = []

// 温度色系：淡黄色（低温）到 橘红色（高温）
const TEMP_COLORS = [
  '#FFF9C4', // 淡黄（极低温）
  '#FFEE58', // 黄色
  '#FFD54F', // 深黄
  '#FFB74D', // 橙黄
  '#FF9800', // 橙色
  '#FF7043', // 深橙
  '#F4511E', // 橘红
  '#E64A19', // 红橙（高温）
]

const TEMP_HOVER_COLORS = [
  '#FFF176', // 亮黄（极低温悬停）
  '#FFD600', // 亮黄色
  '#FFC400', // 亮深黄
  '#FFA726', // 亮橙黄
  '#FB8C00', // 亮橙色
  '#FF5722', // 亮深橙
  '#D84315', // 亮橘红
  '#BF360C', // 亮红橙（高温悬停）
]

const getColor = (value: number, min: number, max: number) => {
  if (max === min) return TEMP_COLORS[0]
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const idx = Math.round(ratio * (TEMP_COLORS.length - 1))
  return TEMP_COLORS[idx]
}

const getHoverColor = (value: number, min: number, max: number) => {
  if (max === min) return TEMP_HOVER_COLORS[0]
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const idx = Math.round(ratio * (TEMP_HOVER_COLORS.length - 1))
  return TEMP_HOVER_COLORS[idx]
}

const buildAllData = (hoverName: string) => {
  const values = allData.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values, 1)
  return allData.map((d) => {
    const isHover = d.name === hoverName
    const color = isHover
      ? getHoverColor(d.value, minValue, maxValue)
      : getColor(d.value, minValue, maxValue)
    return {
      name: d.name,
      value: d.value,
      itemStyle: {
        areaColor: color,
        borderColor: isHover ? '#E65100' : 'rgba(255, 152, 0, 0.4)',
        borderWidth: isHover ? 2 : 1,
        shadowColor: isHover ? `rgba(255, 87, 34, 0.6)` : 'transparent',
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
    const found = data.find((d) => d.name === shortName)
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

  const values = allData.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values, 1)

  chart.setOption({
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: 'rgba(255, 152, 0, 0.5)',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        if (params.componentType === 'series') {
          const temp = params.value || 0
          let weather = '晴'
          if (temp < 5) weather = '寒冷'
          else if (temp < 15) weather = '凉爽'
          else if (temp < 25) weather = '温暖'
          else if (temp < 35) weather = '炎热'
          else weather = '酷热'
          return `${params.name}<br/>🌡️ 温度: ${temp}°C<br/>☁️ 天气: ${weather}`
        }
        return ''
      },
    },
    visualMap: {
      show: true,
      min: minValue,
      max: maxValue,
      text: ['高温', '低温'],
      textStyle: {
        color: 'rgba(255,255,255,0.7)',
      },
      inRange: {
        color: TEMP_COLORS,
      },
      orient: 'vertical',
      left: 10,
      bottom: 20,
      itemWidth: 12,
      itemHeight: 100,
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
            areaColor: getHoverColor(
              Math.max(...allData.map((d) => d.value), 1),
              minValue,
              maxValue,
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
