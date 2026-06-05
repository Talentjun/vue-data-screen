<template>
  <div class="rank-container">
    <div class="rank-header">
      <span class="rank-title">排名</span>
      <span class="company-title">企业名称</span>
      <span class="score-title">综合评分</span>
    </div>
    <div class="rank-list">
      <div
        v-for="(item, index) in data"
        :key="item.name"
        class="rank-item"
        :class="{ 'top-three': index < 3 }"
      >
        <span class="rank-num" :class="'rank-' + (index + 1)">
          {{ index + 1 }}
        </span>
        <span class="company-name">{{ item.name }}</span>
        <div class="score-bar">
          <div
            class="score-fill"
            :style="{
              width: (item.value / maxValue) * 100 + '%',
              background: getGradient(index),
            }"
          ></div>
        </div>
        <span class="score-value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChartDataItem } from '../types'

interface Props {
  data: ChartDataItem[]
}

const { data } = defineProps<Props>()

const maxValue = computed(() => Math.max(...data.map((item) => item.value)))

const getGradient = (index: number) => {
  const gradients = [
    'linear-gradient(90deg, #FFD700, #FFA500)',
    'linear-gradient(90deg, #C0C0C0, #A0A0A0)',
    'linear-gradient(90deg, #CD7F32, #B8860B)',
    'linear-gradient(90deg, #00d4ff, #0099cc)',
    'linear-gradient(90deg, #00e396, #00b377)',
    'linear-gradient(90deg, #feb019, #e69500)',
    'linear-gradient(90deg, #775dd0, #6040b0)',
    'linear-gradient(90deg, #ff4560, #cc374d)',
    'linear-gradient(90deg, #008ffb, #0066cc)',
    'linear-gradient(90deg, #00e396, #00b377)',
  ]
  return gradients[index % gradients.length]
}
</script>

<style scoped>
.rank-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.rank-header {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.15);
}

.rank-title {
  width: 40px;
  text-align: center;
}

.company-title {
  flex: 1;
}

.score-title {
  width: 70px;
  text-align: right;
}

.rank-list {
  flex: 1;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  transition: background 0.3s;
}

.rank-item:hover {
  background: rgba(0, 212, 255, 0.05);
}

.rank-item.top-three {
  background: rgba(255, 215, 0, 0.03);
}

.rank-num {
  width: 40px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #1a1a2e;
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
  color: #1a1a2e;
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #b8860b);
  color: #1a1a2e;
}

.company-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  padding: 0 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-bar {
  width: 100px;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

.score-value {
  width: 50px;
  text-align: right;
  color: #00d4ff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'DIN', 'Roboto Mono', monospace;
}
</style>
