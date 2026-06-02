import type {
  StatCardData,
  LineChartData,
  BarChartData,
  CalendarChartData,
  ChartDataItem,
  MapDataItem,
} from '../types'

export const statCards: StatCardData[] = [
  {
    title: '总访问量',
    value: '1,284,567',
    unit: '次',
    color: '#00d4ff',
    trend: 'up',
    trendValue: '+12.5%',
  },
  {
    title: '今日活跃',
    value: '38,492',
    unit: '人',
    color: '#00e396',
    trend: 'up',
    trendValue: '+8.3%',
  },
  {
    title: '转化率',
    value: '68.7',
    unit: '%',
    color: '#feb019',
    trend: 'down',
    trendValue: '-2.1%',
  },
  {
    title: '总收入',
    value: '856.3',
    unit: '万',
    color: '#ff4560',
    trend: 'up',
    trendValue: '+15.7%',
  },
]

export const lineChartData: LineChartData = {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  series: [
    {
      name: '2024年',
      data: [820, 932, 901, 1234, 1290, 1330, 1520, 1430, 1650, 1890, 2100, 2350],
    },
    {
      name: '2025年',
      data: [920, 1032, 1101, 1434, 1490, 1530, 1720, 1630, 1850, 2090, 2300, 2550],
    },
  ],
}

export const barChartData: BarChartData = {
  xAxis: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京'],
  series: [
    {
      name: '访问量',
      data: [12000, 9800, 8500, 7600, 6200, 5800, 5200, 4900],
    },
    {
      name: '成交量',
      data: [8000, 6500, 5200, 4800, 3900, 3500, 3100, 2800],
    },
  ],
}

export const pieChartData: ChartDataItem[] = [
  { name: '直接访问', value: 335 },
  { name: '邮件营销', value: 310 },
  { name: '联盟广告', value: 234 },
  { name: '视频广告', value: 135 },
  { name: '搜索引擎', value: 948 },
]

export const ringChartData: ChartDataItem[] = [
  { name: '华东地区', value: 35 },
  { name: '华南地区', value: 25 },
  { name: '华北地区', value: 20 },
  { name: '西南地区', value: 12 },
  { name: '其他地区', value: 8 },
]

export const mapData: MapDataItem[] = [
  { name: '北京', value: 2154 },
  { name: '上海', value: 2487 },
  { name: '广东', value: 1832 },
  { name: '四川', value: 836 },
  { name: '浙江', value: 1256 },
  { name: '江苏', value: 1198 },
  { name: '山东', value: 967 },
  { name: '河南', value: 756 },
  { name: '湖北', value: 689 },
  { name: '湖南', value: 623 },
  { name: '河北', value: 578 },
  { name: '福建', value: 534 },
  { name: '安徽', value: 489 },
  { name: '辽宁', value: 456 },
  { name: '陕西', value: 423 },
  { name: '重庆', value: 398 },
  { name: '天津', value: 367 },
  { name: '江西', value: 345 },
  { name: '广西', value: 312 },
  { name: '云南', value: 289 },
  { name: '山西', value: 267 },
  { name: '黑龙江', value: 245 },
  { name: '吉林', value: 223 },
  { name: '贵州', value: 201 },
  { name: '甘肃', value: 178 },
  { name: '内蒙古', value: 156 },
  { name: '海南', value: 134 },
  { name: '新疆', value: 112 },
  { name: '宁夏', value: 89 },
  { name: '青海', value: 67 },
  { name: '西藏', value: 45 },
]

function generateCalendarData(year: number): [string, number][] {
  const data: [string, number][] = []
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseValue = isWeekend ? 300 : 800
    const randomValue = Math.floor(Math.random() * baseValue) + 100
    data.push([dateStr, randomValue])
  }

  return data
}

export const calendarChartData: CalendarChartData = {
  data: generateCalendarData(2025),
  year: 2025,
}
