/* eslint-disable no-restricted-globals */

// Internal logic decoupled from DOM
let particlesCount = 2000
let isRunning = false
let time = 0
let lastFrameTime = performance.now()
let tps = 60

// Mutable Arrays for physics tracking
let positions = new Float32Array(particlesCount * 3)
let phases = new Float32Array(particlesCount)
let targetCounts = particlesCount

const updateParticles = () => {
  const currentFrameTime = performance.now()
  const dt = currentFrameTime - lastFrameTime
  lastFrameTime = currentFrameTime

  // Dynamic Scaling
  if (dt > 16.6) {
    if (particlesCount > 800) particlesCount -= 100
  } else if (dt < 4 && particlesCount < targetCounts) {
    particlesCount += 50
  }

  // Update in place (Zero allocation!)
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3
    phases[i] += 0.02
    
    // Non-linear wave path function (mirroring physics.js without imports for speed)
    const px = (Math.sin(time * 0.2 + phases[i]) * 15)
    const pz = (Math.cos(time * 0.3 + phases[i]) * 15)
    
    // Add noise based turbulence
    positions[i3] = px
    positions[i3 + 1] = Math.sin(time + phases[i]) * (3 + Math.sin(px * 0.1))
    positions[i3 + 2] = pz
  }

  time += 0.016
}

const loop = () => {
  if (!isRunning) return
  
  updateParticles()
  
  // Allocate transferable buffers (assuming main thread owns previous ones)
  // To strictly use transferable, we slice and copy our local track array and send underlying ArrayBuffer
  // Note: Standard structured clone algorithm permits ArrayBuffers in the transfer list.
  const transferPos = new Float32Array(positions.slice(0, particlesCount * 3))
  
  self.postMessage(
    { 
      type: 'QUANTUM_TICK', 
      payload: { 
        positions: transferPos, 
        count: particlesCount 
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
      targetCounts = payload.maxParticles || 2000
      particlesCount = targetCounts
      positions = new Float32Array(particlesCount * 3)
      phases = new Float32Array(particlesCount)
      
      // Initialize layout
      for (let i = 0; i < particlesCount; i++) {
        phases[i] = Math.random() * Math.PI * 2
      }
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
    case 'SET_REDUCED_MOTION':
      tps = payload.reduced ? 15 : 60 // Dial down TPS severely on reduced motion
      targetCounts = payload.reduced ? 400 : 2000
      break
    default:
      break
  }
}
