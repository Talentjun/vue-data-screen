<template>
  <div class="data-screen" :style="screenStyle">
    <HeaderTitle
      title="智慧数据可视化大屏"
      :is-running="isRunning"
      :interval="interval"
      @toggle="toggle"
      @update-interval="(v: number) => setInterval(v)"
    />

    <div class="main-content">
      <div class="left-panel">
        <div class="panel-item">
          <BorderBox title="访问趋势">
            <LineChart :data="lineChartData" />
          </BorderBox>
        </div>
        <div class="panel-item">
          <BorderBox title="访问热力图">
            <CalendarChart :data="calendarChartData" />
          </BorderBox>
        </div>
        <div class="panel-item">
          <BorderBox title="流量来源">
            <PieChart :data="pieChartData" />
          </BorderBox>
        </div>
      </div>

      <div class="center-panel">
        <div class="stat-cards">
          <StatCard v-for="card in statCards" :key="card.title" :data="card" />
        </div>
        <div class="map-container">
          <BorderBox title="全国天气温度">
            <ChinaMap :data="mapData" />
          </BorderBox>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-item">
          <BorderBox title="地区占比">
            <RingChart :data="ringChartData" />
          </BorderBox>
        </div>
        <div class="panel-item">
          <BorderBox title="热门城市TOP8">
            <BarChart :data="barChartData" />
          </BorderBox>
        </div>
        <div class="panel-item">
          <BorderBox title="季度趋势">
            <LineChart :data="lineChartData" />
          </BorderBox>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HeaderTitle from './components/HeaderTitle.vue'
import BorderBox from './components/BorderBox.vue'
import StatCard from './components/StatCard.vue'
import ChinaMap from './components/ChinaMap.vue'
import LineChart from './components/LineChart.vue'
import BarChart from './components/BarChart.vue'
import PieChart from './components/PieChart.vue'
import RingChart from './components/RingChart.vue'
import CalendarChart from './components/CalendarChart.vue'
import { useRealtimeData } from './composables/useRealtimeData'
import {
  statCards as initialStatCards,
  lineChartData as initialLineChart,
  barChartData as initialBarChart,
  pieChartData as initialPieChart,
  ringChartData as initialRingChart,
  calendarChartData as initialCalendarChart,
  mapData as initialMapData,
} from './data/mockData'

const {
  statCards,
  lineChartData,
  barChartData,
  pieChartData,
  ringChartData,
  calendarChartData,
  mapData,
  isRunning,
  interval,
  toggle,
  setInterval,
} = useRealtimeData(
  initialStatCards,
  initialLineChart,
  initialBarChart,
  initialPieChart,
  initialRingChart,
  initialCalendarChart,
  initialMapData,
  { interval: 5000 },
)

const screenStyle = computed(() => ({
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
}))
</script>

<style scoped>
.data-screen {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, #112240 0%, #0a1830 60%, #0c1a2e 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  min-height: 0;
}

.left-panel,
.right-panel {
  width: 26%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.map-container {
  flex: 1;
  min-height: 0;
}

.panel-item {
  flex: 1;
  min-height: 0;
}

.panel-item :deep(.border-box) {
  height: 100%;
}

.map-container :deep(.border-box) {
  height: 100%;
}
</style>
