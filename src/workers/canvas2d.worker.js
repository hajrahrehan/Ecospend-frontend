/* eslint-disable no-restricted-globals */

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
