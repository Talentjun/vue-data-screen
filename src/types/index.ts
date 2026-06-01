export interface StatCardData {
  title: string
  value: number | string
  unit?: string
  icon?: string
  color?: string
  trend?: 'up' | 'down'
  trendValue?: string
}

export interface ChartDataItem {
  name: string
  value: number
}

export interface MapDataItem {
  name: string
  value: number
}

export interface LineChartData {
  xAxis: string[]
  series: {
    name: string
    data: number[]
  }[]
}

export interface BarChartData {
  xAxis: string[]
  series: {
    name: string
    data: number[]
  }[]
}
