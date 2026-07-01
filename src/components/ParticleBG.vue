<template>
  <canvas ref="canvasRef" class="particle-bg"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)
let scene, camera, renderer, particles, mouseX, mouseY
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

  // ── 粒子系统 ──
  const count = 400
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    // 分布在球体空间内
    const radius = 15 + Math.random() * 12
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    sizes[i] = 0.5 + Math.random() * 1.5
    speeds[i] = 0.1 + Math.random() * 0.3
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  // 粒子纹理：圆形渐变
  const textureCanvas = document.createElement('canvas')
  textureCanvas.width = 32
  textureCanvas.height = 32
  const ctx = textureCanvas.getContext('2d')
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(212, 168, 83, 0.8)')
  gradient.addColorStop(0.3, 'rgba(212, 168, 83, 0.3)')
  gradient.addColorStop(1, 'rgba(212, 168, 83, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 32, 32)
  const texture = new THREE.CanvasTexture(textureCanvas)

  const material = new THREE.PointsMaterial({
    size: 0.6,
    map: texture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.6,
    color: new THREE.Color('#d4a853'),
    depthWrite: false,
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  // ── 额外连线粒子（少量，产生星点效果） ──
  const starCount = 200
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 60
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 60
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const starMat = new THREE.PointsMaterial({
    size: 0.15,
    color: '#ffffff',
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)

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

  // 粒子缓慢自转
  if (particles) {
    particles.rotation.y += 0.001
    particles.rotation.x += 0.0003

    // 鼠标跟随视差
    particles.rotation.y += mouseX * 0.002
    particles.rotation.x += mouseY * 0.001
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
