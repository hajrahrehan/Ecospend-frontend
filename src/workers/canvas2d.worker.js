/* eslint-disable no-restricted-globals */

import { waveProbability } from '../lib/physics'

let offscreenCtxMap = new Map() // canvasId -> ctx
let frameLoops = new Map()      // canvasId -> state & raf
let isReducedMotion = false

const stopLoop = (id) => {
  if (frameLoops.has(id)) {
    cancelAnimationFrame(frameLoops.get(id).raf)
    frameLoops.delete(id)
  }
}

const drawBalanceWell = (id, state) => {
  const ctx = offscreenCtxMap.get(id)
  if (!ctx) return
  
  const ctxCanvas = ctx.canvas
  const w = ctxCanvas.width, h = ctxCanvas.height
  const cx = w/2, cy = h/2
  
  ctx.clearRect(0, 0, w, h)
  const energy = state.energy || 0.5
  
  for (let r = 5; r < 120; r += 8) {
    const intensity = Math.max(0, 1 - r / 120) * energy
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(0,212,255,${intensity * 0.3})`
    ctx.lineWidth = 0.5
    ctx.stroke()
  }
  
  state.time += isReducedMotion ? 0.005 : 0.016
  const loopState = frameLoops.get(id)
  if (loopState) {
    loopState.raf = requestAnimationFrame(() => drawBalanceWell(id, state))
  }
}

const drawBeam = (id, state) => {
  const ctx = offscreenCtxMap.get(id)
  if (!ctx || !state.particles) return
  
  const ctxCanvas = ctx.canvas
  const W = ctxCanvas.width, H = ctxCanvas.height
  const t = state.time
  
  ctx.fillStyle = 'rgba(0,0,15,0.3)'
  ctx.fillRect(0, 0, W, H)

  state.particles.forEach(p => {
    const lt = Math.max(0, t - p.delay)
    if (lt <= 0) return
    const progress = lt * p.speed
    if (progress > 1.2) return

    const x = W * Math.min(progress, 1)
    const decay = Math.exp(-p.omega * 0.1 * lt)
    const y = H / 2 + p.amp * Math.sin(p.omega * lt + p.phase) * decay

    const alpha = Math.max(0, 1 - Math.max(0, progress - 0.8) * 5)
    // Simplify gradients for worker offscreen scaling
    ctx.fillStyle = `rgba(0,212,255,${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, p.size * 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`
    ctx.beginPath()
    ctx.arc(x, y, p.size * 0.5, 0, Math.PI * 2)
    ctx.fill()
  })

  state.time += isReducedMotion ? 0.015 : 0.025
  const loopState = frameLoops.get(id)
  if (loopState && state.time < 3) {
    loopState.raf = requestAnimationFrame(() => drawBeam(id, state))
  }
}

const drawWave = (id, state) => {
  const ctx = offscreenCtxMap.get(id)
  if (!ctx) return
  
  const canvas = ctx.canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(0,0,0,0)'
  
  const t = state.time
  for (let x = 0; x < canvas.width; x++) {
    const prob = waveProbability(x, t, canvas.width / 2, 60, 0.04, 30)
    const h = prob * canvas.height * 2.5
    const alpha = Math.min(prob * 8, 0.9)
    
    const hue = 180 + prob * 120
    ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha})`
    ctx.fillRect(x, canvas.height - h, 1, h)
  }
  
  state.time += isReducedMotion ? 0.01 : 0.025
  const loopState = frameLoops.get(id)
  if (loopState) {
    loopState.raf = requestAnimationFrame(() => drawWave(id, state))
  }
}

self.onmessage = (e) => {
  const { type, id, canvas, payload } = e.data
  
  switch(type) {
    case 'INIT_OFFSCREEN':
      offscreenCtxMap.set(id, canvas.getContext('2d'))
      break
    case 'START_BALANCE_WELL':
      stopLoop(id)
      frameLoops.set(id, { time: 0 })
      drawBalanceWell(id, { time: 0, energy: payload.energy })
      break
    case 'START_BEAM': {
      stopLoop(id)
      const state = { time: 0, particles: Array.from({ length: 60 }, (_, i) => ({
        delay: i * 0.02, phase: (Math.random() - 0.5) * 0.4, amp: (Math.random() - 0.5) * 30,
        omega: 8 + Math.random() * 4, speed: 0.4 + Math.random() * 0.3, size: Math.random() * 3 + 1,
      }))}
      frameLoops.set(id, state)
      drawBeam(id, state)
      break
    }
    case 'START_WAVE':
      stopLoop(id)
      frameLoops.set(id, { time: 0 })
      drawWave(id, { time: 0 })
      break
    case 'STOP':
      stopLoop(id)
      break
    case 'SET_REDUCED_MOTION':
      isReducedMotion = payload.reduced
      break
    default:
      break
  }
}
