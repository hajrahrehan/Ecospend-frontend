/* eslint-disable no-restricted-globals */

// Internal logic decoupled from DOM
let particlesCount = 2000
let isRunning = false
let time = 0
let lastFrameTime = performance.now()
let tps = 30
let lastDt = 16.6

// Mutable Arrays for physics tracking
let phases = new Float32Array(particlesCount)
let targetCounts = particlesCount

const bufferPool = []
const MAX_POOL = 3
const clampMax = (val) => Math.max(200, Math.min(8000, val || 0))

const ensurePool = (size) => {
  bufferPool.length = 0
  for (let i = 0; i < MAX_POOL; i++) {
    bufferPool.push(new Float32Array(size))
  }
}

const acquireBuffer = (size) => {
  if (bufferPool.length > 0) {
    const buf = bufferPool.pop()
    if (buf.length === size) return buf
  }
  return new Float32Array(size)
}

const releaseBuffer = (buffer) => {
  if (!buffer || bufferPool.length >= MAX_POOL) return
  if (buffer.length === particlesCount * 3) bufferPool.push(buffer)
}

const resizeParticles = (nextCount) => {
  if (nextCount === particlesCount) return
  const prevCount = particlesCount
  particlesCount = nextCount
  const nextPhases = new Float32Array(particlesCount)
  nextPhases.set(phases.subarray(0, Math.min(prevCount, particlesCount)))
  for (let i = prevCount; i < particlesCount; i++) {
    nextPhases[i] = Math.random() * Math.PI * 2
  }
  phases = nextPhases
  ensurePool(particlesCount * 3)
}

const updateParticles = (writeBuffer) => {
  const currentFrameTime = performance.now()
  const dt = currentFrameTime - lastFrameTime
  lastFrameTime = currentFrameTime
  lastDt = dt

  // Dynamic Scaling
  if (dt > 40) {
    if (particlesCount > 800) resizeParticles(Math.max(800, particlesCount - 100))
  } else if (dt < 20 && particlesCount < targetCounts) {
    resizeParticles(Math.min(targetCounts, particlesCount + 50))
  }

  // Update in place (Zero allocation!) into the write buffer
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3
    phases[i] += 0.02
    
    // Non-linear wave path function (mirroring physics.js without imports for speed)
    const px = (Math.sin(time * 0.2 + phases[i]) * 15)
    const pz = (Math.cos(time * 0.3 + phases[i]) * 15)
    
    // Add noise based turbulence
    writeBuffer[i3] = px
    writeBuffer[i3 + 1] = Math.sin(time + phases[i]) * (3 + Math.sin(px * 0.1))
    writeBuffer[i3 + 2] = pz
  }

  time += 0.016
}

const loop = () => {
  if (!isRunning) return
  
  const transferPos = acquireBuffer(particlesCount * 3)
  updateParticles(transferPos)
  
  self.postMessage(
    { 
      type: 'QUANTUM_TICK', 
      payload: { 
        positions: transferPos, 
        count: particlesCount,
        dt: lastDt
      }
    },
    [transferPos.buffer]
  )

  // Use internal throttle (setTimeout logic or native requestAnimationFrame in some workers)
  // Workers now support requestAnimationFrame natively in most context, but setTimeout is universally safe for out-of-DOM ticking.
  setTimeout(loop, 1000 / tps)
}

self.onmessage = (e) => {
  const { type, payload } = e.data
  switch (type) {
    case 'INIT': {
      targetCounts = clampMax(payload.maxParticles || 1200)
      particlesCount = Math.min(payload.startParticles || Math.min(800, targetCounts), targetCounts)
      tps = Math.min(payload.tickRate || 30, 30)
      phases = new Float32Array(particlesCount)
      ensurePool(particlesCount * 3)
      
      // Initialize layout
      for (let i = 0; i < particlesCount; i++) {
        phases[i] = Math.random() * Math.PI * 2
      }
      break
    }
    case 'SET_PERF': {
      const nextMax = payload?.maxParticles ? clampMax(payload.maxParticles) : targetCounts
      const nextStart = payload?.startParticles ? Math.min(payload.startParticles, nextMax) : particlesCount
      targetCounts = nextMax
      if (particlesCount > nextMax) {
        resizeParticles(nextMax)
      } else if (nextStart !== particlesCount) {
        resizeParticles(nextStart)
      }
      if (payload?.tickRate) tps = Math.min(payload.tickRate, 30)
      break
    }
    case 'START':
      if (!isRunning) {
        isRunning = true
        lastFrameTime = performance.now()
        loop()
      }
      break
    case 'PAUSE':
      isRunning = false
      break
    case 'SLEEP':
      isRunning = false
      break
    case 'WAKE':
      if (!isRunning) {
        isRunning = true
        lastFrameTime = performance.now()
        loop()
      }
      break
    case 'RETURN_BUFFER':
      releaseBuffer(payload)
      break
    case 'SET_REDUCED_MOTION':
      tps = payload.reduced ? 15 : 30 // Dial down TPS on reduced motion
      targetCounts = payload.reduced ? 400 : targetCounts
      break
    default:
      break
  }
}
