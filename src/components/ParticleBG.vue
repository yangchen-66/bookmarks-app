<template>
  <canvas ref="canvasRef" class="particle-bg"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)
let scene, camera, renderer, particleGroup, mouseX, mouseY
let animationId

// ── Three.js 初始化 ──
function init() {
  const canvas = canvasRef.value
  if (!canvas) return

  const width = window.innerWidth
  const height = window.innerHeight

  // Scene
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.z = 30

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // ── 粒子组（统一旋转 + 鼠标视差） ──
  particleGroup = new THREE.Group()
  scene.add(particleGroup)

  // ── 工具：生成圆形辉光纹理 ──
  function makeGlowTexture(r, g, b) {
    const c = document.createElement('canvas')
    c.width = 32; c.height = 32
    const ctx = c.getContext('2d')
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    grad.addColorStop(0, `rgba(${r},${g},${b},0.8)`)
    grad.addColorStop(0.3, `rgba(${r},${g},${b},0.3)`)
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(c)
  }

  // ── 辅助：创建粒子系统 ──
  function createParticles(count, spreadMin, spreadMax, size, color, opacity, texColor) {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = spreadMin + Math.random() * (spreadMax - spreadMin)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      size,
      map: makeGlowTexture(texColor[0], texColor[1], texColor[2]),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity,
      color: new THREE.Color(color),
      depthWrite: false,
      sizeAttenuation: true,
    })
    const pts = new THREE.Points(geo, mat)
    particleGroup.add(pts)
    return pts
  }

  // ── 400 金色粒子（主星群） ──
  createParticles(400, 15, 27, 0.6, '#d4a853', 0.6, [212, 168, 83])

  // ── 200 白色微小星点 ──
  createParticles(200, 10, 40, 0.15, '#ffffff', 0.3, [255, 255, 255])

  // ── 1500 白色粒子（亮度提升） ──
  createParticles(1500, 12, 35, 0.3, '#f0f4ff', 0.8, [240, 244, 255])

  // ── 100 红色粒子 ──
  createParticles(100, 14, 26, 0.5, '#ff4757', 0.6, [255, 71, 87])

  // 鼠标位置
  mouseX = 0
  mouseY = 0
  document.addEventListener('mousemove', onMouseMove)

  animate()
}

// ── 鼠标跟踪 ──
function onMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1
}

// ── 动画循环 ──
function animate() {
  animationId = requestAnimationFrame(animate)

  // 粒子组缓慢自转 + 鼠标视差
  if (particleGroup) {
    particleGroup.rotation.y += 0.001
    particleGroup.rotation.x += 0.0003
    particleGroup.rotation.y += mouseX * 0.002
    particleGroup.rotation.x += mouseY * 0.001
  }

  renderer.render(scene, camera)
}

// ── 窗口自适应 ──
function onResize() {
  if (!camera || !renderer) return
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// ── 生命周期 ──
onMounted(() => {
  init()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  if (renderer) {
    renderer.dispose()
    renderer = null
  }
})
</script>

<style scoped>
.particle-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}
</style>
