<template>
  <div ref="containerRef" class="border-box" :class="[`border-box-${variant}`, { 'is-fullscreen': isFullscreen }]">
    <div class="border-box-content">
      <div v-if="title" class="border-box-title">
        <span class="title-text">{{ title }}</span>
        <button class="fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏显示'">
          <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 1h4a.5.5 0 0 1 0 1H2v3.5a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm9 0h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V2h-3.5a.5.5 0 0 1 0-1zM1 10.5a.5.5 0 0 1 .5.5v3.5h3.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5zm14 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1 0-1H14V11a.5.5 0 0 1 .5-.5z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 1h4a.5.5 0 0 1 0 1H9v3.5a.5.5 0 0 1-1 0V2H5.5a.5.5 0 0 1 0-1zm9 9h-3.5a.5.5 0 0 1 0-1H14V5.5a.5.5 0 0 1 1 0v4a.5.5 0 0 1-.5.5zM5.5 14H2v-3.5a.5.5 0 0 1 1 0V13h3.5a.5.5 0 0 1 0 1zm9-9h-3.5a.5.5 0 0 1 0-1H14v3.5a.5.5 0 0 1-1 0V5.5z"/>
          </svg>
        </button>
      </div>
      <slot />
    </div>
    <svg class="border-svg" :width="width" :height="height">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect
        x="2"
        y="2"
        :width="width - 4"
        :height="height - 4"
        fill="none"
        :stroke="borderColor"
        stroke-width="1"
        filter="url(#glow)"
      />
      <line x1="0" y1="0" x2="30" y2="0" :stroke="accentColor" stroke-width="3" />
      <line x1="0" y1="0" x2="0" y2="30" :stroke="accentColor" stroke-width="3" />
      <line :x1="width - 30" y1="0" :x2="width" y2="0" :stroke="accentColor" stroke-width="3" />
      <line :x1="width" y1="0" :x2="width" y2="30" :stroke="accentColor" stroke-width="3" />
      <line x1="0" :y1="height" x2="30" :y2="height" :stroke="accentColor" stroke-width="3" />
      <line x1="0" :y1="height - 30" x2="0" :y2="height" :stroke="accentColor" stroke-width="3" />
      <line :x1="width - 30" :y1="height" :x2="width" :y2="height" :stroke="accentColor" stroke-width="3" />
      <line :x1="width" :y1="height - 30" :x2="width" :y2="height" :stroke="accentColor" stroke-width="3" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  title?: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

const { title, variant = 'default' } = defineProps<Props>()

const width = ref(300)
const height = ref(200)
const isFullscreen = ref(false)
let resizeObserver: ResizeObserver | null = null
const containerRef = ref<HTMLElement | null>(null)

const borderColor = computed(() => {
  const colors: Record<string, string> = {
    default: 'rgba(0, 212, 255, 0.3)',
    primary: 'rgba(0, 212, 255, 0.5)',
    success: 'rgba(0, 227, 150, 0.5)',
    warning: 'rgba(254, 176, 25, 0.5)',
  }
  return colors[variant]
})

const accentColor = computed(() => {
  const colors: Record<string, string> = {
    default: '#00d4ff',
    primary: '#00d4ff',
    success: '#00e396',
    warning: '#feb019',
  }
  return colors[variant]
})

const toggleFullscreen = async () => {
  if (!containerRef.value) return
  
  try {
    if (!document.fullscreenElement) {
      await containerRef.value.requestFullscreen()
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
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width.value = entry.contentRect.width
        height.value = entry.contentRect.height
      }
    })
    resizeObserver.observe(containerRef.value)
  }
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  if (containerRef.value) {
    width.value = containerRef.value.offsetWidth
    height.value = containerRef.value.offsetHeight
  }
}

onUnmounted(() => {
  resizeObserver?.disconnect()
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.border-box {
  position: relative;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.9) 0%, rgba(0, 40, 80, 0.6) 100%);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.border-box.is-fullscreen {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.98) 0%, rgba(0, 40, 80, 0.95) 100%);
}

.border-box-content {
  position: relative;
  z-index: 1;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}

.border-box.is-fullscreen .border-box-content {
  padding: 24px;
}

.border-box-title {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #00d4ff;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.border-box.is-fullscreen .title-text {
  font-size: 24px;
  letter-spacing: 4px;
}

.fullscreen-btn {
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
  flex-shrink: 0;
}

.border-box:hover .fullscreen-btn {
  opacity: 1;
}

.border-box.is-fullscreen .fullscreen-btn {
  opacity: 1;
}

.fullscreen-btn:hover {
  background: rgba(0, 212, 255, 0.3);
  border-color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.border-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.border-box.is-fullscreen .border-svg {
  width: 100vw;
  height: 100vh;
}
</style>
