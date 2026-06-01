import { ref, onMounted, onUnmounted } from 'vue'

export function useResizeObserver() {
  const width = ref(0)
  const height = ref(0)
  let observer: ResizeObserver | null = null

  const target = ref<HTMLElement | null>(null)

  const setTarget = (el: HTMLElement) => {
    target.value = el
  }

  onMounted(() => {
    if (!target.value) return
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width.value = entry.contentRect.width
        height.value = entry.contentRect.height
      }
    })
    observer.observe(target.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { width, height, setTarget }
}

export function useScreenScale(designWidth = 1920, designHeight = 1080) {
  const scale = ref(1)

  const updateScale = () => {
    const scaleX = window.innerWidth / designWidth
    const scaleY = window.innerHeight / designHeight
    scale.value = Math.min(scaleX, scaleY)
  }

  onMounted(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScale)
  })

  return { scale }
}
