import { ref, onUnmounted, type Ref } from 'vue'
import type { StatCardData, LineChartData, BarChartData, ChartDataItem, MapDataItem } from '../types'

interface RealtimeDataConfig {
  interval?: number
  autoStart?: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function fluctuate(base: number, ratio: number, min?: number, max?: number) {
  const delta = base * ratio * (Math.random() * 2 - 1)
  let result = base + delta
  if (min !== undefined) result = Math.max(result, min)
  if (max !== undefined) result = Math.min(result, max)
  return Math.round(result)
}

function fluctuateFloat(base: number, ratio: number, min: number, max: number, decimals = 1) {
  const delta = base * ratio * (Math.random() * 2 - 1)
  const result = clamp(base + delta, min, max)
  return parseFloat(result.toFixed(decimals))
}

function formatWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function deepCloneStatCards(cards: StatCardData[]): StatCardData[] {
  return cards.map(c => ({ ...c }))
}

function deepCloneLineChartData(data: LineChartData): LineChartData {
  return {
    xAxis: [...data.xAxis],
    series: data.series.map(s => ({ name: s.name, data: [...s.data] })),
  }
}

function deepCloneBarChartData(data: BarChartData): BarChartData {
  return {
    xAxis: [...data.xAxis],
    series: data.series.map(s => ({ name: s.name, data: [...s.data] })),
  }
}

function deepCloneChartData(items: ChartDataItem[]): ChartDataItem[] {
  return items.map(i => ({ ...i }))
}

function deepCloneMapData(items: MapDataItem[]): MapDataItem[] {
  return items.map(i => ({ ...i }))
}

export function useRealtimeData(
  initialStatCards: StatCardData[],
  initialLineChart: LineChartData,
  initialBarChart: BarChartData,
  initialPieChart: ChartDataItem[],
  initialRingChart: ChartDataItem[],
  initialMapData: MapDataItem[],
  config?: RealtimeDataConfig,
) {
  const intervalMs = ref(config?.interval ?? 5000)
  const isRunning = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const statCards = ref<StatCardData[]>(deepCloneStatCards(initialStatCards))
  const lineChartData = ref<LineChartData>(deepCloneLineChartData(initialLineChart))
  const barChartData = ref<BarChartData>(deepCloneBarChartData(initialBarChart))
  const pieChartData = ref<ChartDataItem[]>(deepCloneChartData(initialPieChart))
  const ringChartData = ref<ChartDataItem[]>(deepCloneChartData(initialRingChart))
  const mapData = ref<MapDataItem[]>(deepCloneMapData(initialMapData))

  let totalVisits = 1284567

  function updateStatCards() {
    statCards.value = statCards.value.map((card) => {
      if (card.title === '总访问量') {
        totalVisits += Math.floor(Math.random() * 500)
        const change = Math.floor(Math.random() * 500)
        const trendPct = ((change / totalVisits) * 100).toFixed(1)
        return {
          ...card,
          value: formatWithCommas(totalVisits),
          trend: 'up' as const,
          trendValue: `+${trendPct}%`,
        }
      }
      if (card.title === '今日活跃') {
        const raw = parseFloat(String(card.value).replace(/,/g, ''))
        const newVal = fluctuate(raw, 0.013, 30000)
        const change = newVal - raw
        const trendPct = ((Math.abs(change) / raw) * 100).toFixed(1)
        return {
          ...card,
          value: formatWithCommas(newVal),
          trend: change >= 0 ? ('up' as const) : ('down' as const),
          trendValue: `${change >= 0 ? '+' : '-'}${trendPct}%`,
        }
      }
      if (card.title === '转化率') {
        const raw = parseFloat(String(card.value))
        const newVal = fluctuateFloat(raw, 0.03, 60, 75)
        const change = newVal - raw
        const trendPct = Math.abs(change).toFixed(1)
        return {
          ...card,
          value: newVal.toFixed(1),
          trend: change >= 0 ? ('up' as const) : ('down' as const),
          trendValue: `${change >= 0 ? '+' : '-'}${trendPct}%`,
        }
      }
      if (card.title === '总收入') {
        const raw = parseFloat(String(card.value))
        const newVal = fluctuateFloat(raw, 0.05, 500, 1200)
        const change = newVal - raw
        const trendPct = ((Math.abs(change) / raw) * 100).toFixed(1)
        return {
          ...card,
          value: newVal.toFixed(1),
          trend: change >= 0 ? ('up' as const) : ('down' as const),
          trendValue: `${change >= 0 ? '+' : '-'}${trendPct}%`,
        }
      }
      return card
    })
  }

  function updateLineChart() {
    const newData = deepCloneLineChartData(lineChartData.value)
    for (const s of newData.series) {
      s.data = s.data.map(v => fluctuate(v, 0.1, 200))
    }
    lineChartData.value = newData
  }

  function updateBarChart() {
    const newData = deepCloneBarChartData(barChartData.value)
    for (const s of newData.series) {
      s.data = s.data.map(v => fluctuate(v, 0.15, 500))
    }
    barChartData.value = newData
  }

  function updatePieChart() {
    const newData = deepCloneChartData(pieChartData.value)
    for (const item of newData) {
      item.value = fluctuate(item.value, 0.12, 50)
    }
    pieChartData.value = newData
  }

  function updateRingChart() {
    const newData = deepCloneChartData(ringChartData.value)
    for (const item of newData) {
      item.value = Math.max(1, fluctuate(item.value, 0.12, 1))
    }
    ringChartData.value = newData
  }

  function updateMapData() {
    const newData = deepCloneMapData(mapData.value)
    for (const item of newData) {
      item.value = fluctuate(item.value, 0.1, 10)
    }
    mapData.value = newData
  }

  function updateAll() {
    updateStatCards()
    updateLineChart()
    updateBarChart()
    updatePieChart()
    updateRingChart()
    updateMapData()
  }

  function start() {
    if (timer) return
    isRunning.value = true
    timer = setInterval(updateAll, intervalMs.value)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isRunning.value = false
  }

  function toggle() {
    if (isRunning.value) stop()
    else start()
  }

  function setIntervalMs(ms: number) {
    intervalMs.value = ms
    if (isRunning.value) {
      stop()
      start()
    }
  }

  onUnmounted(() => {
    stop()
  })

  if (config?.autoStart !== false) {
    start()
  }

  return {
    statCards,
    lineChartData,
    barChartData,
    pieChartData,
    ringChartData,
    mapData,
    isRunning,
    interval: intervalMs,
    start,
    stop,
    toggle,
    setInterval: setIntervalMs,
  }
}
