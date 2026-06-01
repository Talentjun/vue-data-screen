<template>
  <header class="header">
    <div class="header-left">
      <span class="header-time">{{ currentTime }}</span>
    </div>
    <div class="header-center">
      <div class="title-decoration left"></div>
      <h1 class="header-title">{{ title }}</h1>
      <div class="title-decoration right"></div>
    </div>
    <div class="header-right">
      <span class="header-weather">晴 26°C</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '智慧数据可视化大屏',
})

const currentTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[now.getDay()]
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${weekDay}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 30px;
  background: linear-gradient(180deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 15, 30, 0.6) 100%);
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
  position: relative;
}

.header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #00d4ff 50%, transparent 100%);
}

.header-left,
.header-right {
  flex: 1;
}

.header-right {
  text-align: right;
}

.header-time,
.header-weather {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 1px;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 2;
  justify-content: center;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 8px;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.3);
  white-space: nowrap;
  margin: 0;
}

.title-decoration {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff);
  position: relative;
}

.title-decoration.left {
  background: linear-gradient(90deg, transparent, #00d4ff);
}

.title-decoration.right {
  background: linear-gradient(90deg, #00d4ff, transparent);
}

.title-decoration::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: #00d4ff;
  border-radius: 50%;
  top: -3px;
  box-shadow: 0 0 10px #00d4ff;
}

.title-decoration.left::before {
  right: 0;
}

.title-decoration.right::before {
  left: 0;
}
</style>
