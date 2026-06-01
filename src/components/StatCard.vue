<template>
  <div ref="cardRef" class="stat-card" :class="{ 'is-fullscreen': isFullscreen }" :style="{ '--card-color': data.color }">
    <button class="fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏显示'">
      <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 1h4a.5.5 0 0 1 0 1H2v3.5a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm9 0h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V2h-3.5a.5.5 0 0 1 0-1zM1 10.5a.5.5 0 0 1 .5.5v3.5h3.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5zm14 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1 0-1H14V11a.5.5 0 0 1 .5-.5z"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.5 1h4a.5.5 0 0 1 0 1H9v3.5a.5.5 0 0 1-1 0V2H5.5a.5.5 0 0 1 0-1zm9 9h-3.5a.5.5 0 0 1 0-1H14V5.5a.5.5 0 0 1 1 0v4a.5.5 0 0 1-.5.5zM5.5 14H2v-3.5a.5.5 0 0 1 1 0V13h3.5a.5.5 0 0 1 0 1zm9-9h-3.5a.5.5 0 0 1 0-1H14v3.5a.5.5 0 0 1-1 0V5.5z"/>
      </svg>
    </button>
    <div class="card-icon">
      <span class="icon-dot"></span>
    </div>
    <div class="card-info">
      <div class="card-title">{{ data.title }}</div>
      <div class="card-value">
        <span class="value-num">{{ data.value }}</span>
        <span v-if="data.unit" class="value-unit">{{ data.unit }}</span>
      </div>
      <div v-if="data.trend" class="card-trend" :class="data.trend">
        <span class="trend-arrow">{{ data.trend === 'up' ? '↑' : '↓' }}</span>
        <span class="trend-value">{{ data.trendValue }}</span>
      </div>
    </div>
    <div class="card-bg-glow"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { StatCardData } from '../types'

interface Props {
  data: StatCardData
}

defineProps<Props>()

const isFullscreen = ref(false)
const cardRef = ref<HTMLElement | null>(null)

const toggleFullscreen = async () => {
  if (!cardRef.value) return
  
  try {
    if (!document.fullscreenElement) {
      await cardRef.value.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (error) {
    console.error('全屏切换失败:', error)
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 40, 80, 0.7) 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card.is-fullscreen {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  border-radius: 0;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.98) 0%, rgba(0, 40, 80, 0.95) 100%);
  justify-content: center;
  gap: 32px;
}

.stat-card:hover {
  border-color: var(--card-color, #00d4ff);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 212, 255, 0.1);
}

.fullscreen-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  z-index: 10;
}

.stat-card:hover .fullscreen-btn {
  opacity: 1;
}

.stat-card.is-fullscreen .fullscreen-btn {
  opacity: 1;
}

.fullscreen-btn:hover {
  background: rgba(0, 212, 255, 0.3);
  border-color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--card-color, #00d4ff) 0%, transparent 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card.is-fullscreen .card-icon {
  width: 80px;
  height: 80px;
}

.icon-dot {
  width: 20px;
  height: 20px;
  background: var(--card-color, #00d4ff);
  border-radius: 50%;
  box-shadow: 0 0 15px var(--card-color, #00d4ff);
}

.stat-card.is-fullscreen .icon-dot {
  width: 32px;
  height: 32px;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.stat-card.is-fullscreen .card-title {
  font-size: 20px;
  letter-spacing: 2px;
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.value-num {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  font-family: 'DIN', 'Roboto Mono', monospace;
  text-shadow: 0 0 20px var(--card-color, #00d4ff);
}

.stat-card.is-fullscreen .value-num {
  font-size: 48px;
}

.value-unit {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.stat-card.is-fullscreen .value-unit {
  font-size: 20px;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
}

.stat-card.is-fullscreen .card-trend {
  font-size: 16px;
  margin-top: 12px;
}

.card-trend.up {
  color: #00e396;
}

.card-trend.down {
  color: #ff4560;
}

.trend-arrow {
  font-size: 14px;
}

.stat-card.is-fullscreen .trend-arrow {
  font-size: 18px;
}

.card-bg-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, var(--card-color, #00d4ff) 0%, transparent 70%);
  opacity: 0.1;
  pointer-events: none;
}

.stat-card.is-fullscreen .card-bg-glow {
  width: 200px;
  height: 200px;
  opacity: 0.15;
}
</style>
