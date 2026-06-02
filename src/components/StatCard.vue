<template>
  <div ref="cardRef" class="stat-card" :class="{ 'is-fullscreen': isFullscreen, 'is-updating': isUpdating }" :style="{ '--card-color': data.color }">
    <button class="fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏显示'">
      <svg v-if="!isFullscreen" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 1h4a.5.5 0 0 1 0 1H2v3.5a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm9 0h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V2h-3.5a.5.5 0 0 1 0-1zM1 10.5a.5.5 0 0 1 .5.5v3.5h3.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5zm14 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1 0-1H14V11a.5.5 0 0 1 .5-.5z"/>
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.5 1h4a.5.5 0 0 1 0 1H9v3.5a.5.5 0 0 1-1 0V2H5.5a.5.5 0 0 1 0-1zm9 9h-3.5a.5.5 0 0 1 0-1H14V5.5a.5.5 0 0 1 1 0v4a.5.5 0 0 1-.5.5zM5.5 14H2v-3.5a.5.5 0 0 1 1 0V13h3.5a.5.5 0 0 1 0 1zm9-9h-3.5a.5.5 0 0 1 0-1H14v3.5a.5.5 0 0 1-1 0V5.5z"/>
      </svg>
    </button>

    <div class="card-corner tl"></div>
    <div class="card-corner tr"></div>
    <div class="card-corner bl"></div>
    <div class="card-corner br"></div>

    <div class="card-body">
      <div class="card-icon-wrap">
        <div class="card-icon-bg"></div>
        <svg v-if="data.title.includes('访问')" class="card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <svg v-else-if="data.title.includes('活跃')" class="card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <svg v-else-if="data.title.includes('转化')" class="card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <svg v-else class="card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>

      <div class="card-info">
        <div class="card-title">{{ data.title }}</div>
        <div class="card-value">
          <span class="value-num" ref="valueNumRef">{{ displayValue }}</span>
          <span v-if="data.unit" class="value-unit">{{ data.unit }}</span>
        </div>
        <div v-if="data.trend" class="card-trend" :class="data.trend">
          <span class="trend-arrow">{{ data.trend === 'up' ? '▲' : '▼' }}</span>
          <span class="trend-value">{{ data.trendValue }}</span>
        </div>
      </div>
    </div>

    <div class="card-bg-glow"></div>
    <div class="card-scan-line"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { StatCardData } from '../types'

interface Props {
  data: StatCardData
}

const props = defineProps<Props>()

const isFullscreen = ref(false)
const cardRef = ref<HTMLElement | null>(null)
const displayValue = ref(props.data.value)
const isUpdating = ref(false)

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

const animateValue = (duration = 1200) => {
  const target = props.data.value
  const numStr = target.toString().replace(/,/g, '')
  const num = parseFloat(numStr)
  if (isNaN(num)) {
    displayValue.value = target
    return
  }

  const hasDecimal = numStr.includes('.')
  const decimalPlaces = hasDecimal ? numStr.split('.')[1].length : 0
  const startTime = performance.now()

  const step = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = num * eased

    if (hasDecimal) {
      displayValue.value = current.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else {
      displayValue.value = Math.round(current).toLocaleString()
    }

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  displayValue.value = hasDecimal ? '0.' + '0'.repeat(decimalPlaces) : '0'
  requestAnimationFrame(step)
}

watch(() => props.data.value, (newVal, oldVal) => {
  if (newVal === oldVal) return
  isUpdating.value = true
  setTimeout(() => { isUpdating.value = false }, 300)
  animateValue(600)
})

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  setTimeout(animateValue, 200)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.stat-card {
  position: relative;
  background: linear-gradient(145deg, rgba(10, 25, 50, 0.95) 0%, rgba(15, 45, 85, 0.8) 50%, rgba(10, 30, 60, 0.95) 100%);
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 20px;
}

.stat-card.is-fullscreen {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  border-radius: 0;
  background: linear-gradient(145deg, rgba(12, 30, 55, 0.98) 0%, rgba(18, 50, 95, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card:hover {
  border-color: var(--card-color, #00d4ff);
  transform: translateY(-3px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px color-mix(in srgb, var(--card-color) 15%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.stat-card.is-updating {
  border-color: var(--card-color, #00d4ff);
  box-shadow:
    0 0 12px color-mix(in srgb, var(--card-color) 30%, transparent),
    inset 0 0 8px color-mix(in srgb, var(--card-color) 10%, transparent);
}

.card-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  z-index: 2;
}

.card-corner.tl {
  top: 0; left: 0;
  border-top: 2px solid var(--card-color, #00d4ff);
  border-left: 2px solid var(--card-color, #00d4ff);
  opacity: 0.7;
}

.card-corner.tr {
  top: 0; right: 0;
  border-top: 2px solid var(--card-color, #00d4ff);
  border-right: 2px solid var(--card-color, #00d4ff);
  opacity: 0.7;
}

.card-corner.bl {
  bottom: 0; left: 0;
  border-bottom: 2px solid var(--card-color, #00d4ff);
  border-left: 2px solid var(--card-color, #00d4ff);
  opacity: 0.7;
}

.card-corner.br {
  bottom: 0; right: 0;
  border-bottom: 2px solid var(--card-color, #00d4ff);
  border-right: 2px solid var(--card-color, #00d4ff);
  opacity: 0.7;
}

.stat-card:hover .card-corner {
  opacity: 1;
}

.fullscreen-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.25);
  color: rgba(0, 212, 255, 0.7);
  padding: 4px;
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
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
  color: #00d4ff;
}

.card-body {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.stat-card.is-fullscreen .card-body {
  gap: 40px;
}

.card-icon-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.is-fullscreen .card-icon-wrap {
  width: 80px;
  height: 80px;
}

.card-icon-bg {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--card-color) 20%, transparent), color-mix(in srgb, var(--card-color) 5%, transparent));
  border: 1px solid color-mix(in srgb, var(--card-color) 25%, transparent);
  transform: rotate(45deg);
}

.card-icon-svg {
  width: 24px;
  height: 24px;
  color: var(--card-color, #00d4ff);
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--card-color) 50%, transparent));
}

.stat-card.is-fullscreen .card-icon-svg {
  width: 40px;
  height: 40px;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 6px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.stat-card.is-fullscreen .card-title {
  font-size: 18px;
  letter-spacing: 4px;
  margin-bottom: 12px;
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value-num {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  font-family: 'DIN', 'Roboto Mono', monospace;
  letter-spacing: 0.5px;
  text-shadow: 0 0 24px color-mix(in srgb, var(--card-color) 60%, transparent);
}

.stat-card.is-fullscreen .value-num {
  font-size: 56px;
}

.value-unit {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 2px;
}

.stat-card.is-fullscreen .value-unit {
  font-size: 20px;
}

.card-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.stat-card.is-fullscreen .card-trend {
  font-size: 16px;
  margin-top: 16px;
  padding: 4px 14px;
}

.card-trend.up {
  color: #00e396;
  background: rgba(0, 227, 150, 0.1);
  border: 1px solid rgba(0, 227, 150, 0.2);
}

.card-trend.down {
  color: #ff4560;
  background: rgba(255, 69, 96, 0.1);
  border: 1px solid rgba(255, 69, 96, 0.2);
}

.trend-arrow {
  font-size: 10px;
}

.card-bg-glow {
  position: absolute;
  top: -60%;
  right: -15%;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, color-mix(in srgb, var(--card-color) 15%, transparent), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.stat-card.is-fullscreen .card-bg-glow {
  width: 250px;
  height: 250px;
}

.card-scan-line {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--card-color) 6%, transparent), transparent);
  pointer-events: none;
  z-index: 0;
  animation: scanLine 4s ease-in-out infinite;
}

@keyframes scanLine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}
</style>
