import { getPerfTier } from '../lib/perfTier'

const listeners = new Set()
let initialized = false

let baseTier = 'mid'
let runtimeTier = 'mid'
let isHidden = false
let reducedMotion = false
let dpr = 1
let lastFrameTime = 0
let longFrameCount = 0
let downgradeUntil = 0
let lockHighTier = false

const TIERS = ['low', 'mid', 'high']

const getTierIndex = (tier) => TIERS.indexOf(tier)
const clampTier = (tier) => (TIERS.includes(tier) ? tier : 'mid')

const computeBaseTier = () => {
  try {
    return clampTier(getPerfTier())
  } catch (e) {
    return 'mid'
  }
}

const computeBudget = (tier) => {
  const eventBatchMs = tier === 'high' ? 33 : 100
  const canvasFps = tier === 'high' ? 28 : tier === 'mid' ? 28 : 20
  const canvasFpsReduced = 20
  const tickRate = 30
  return {
    eventBatchMs,
    canvasFps,
    canvasFpsReduced,
    tickRate,
  }
}

let budget = computeBudget(runtimeTier)

const notify = () => {
  const snapshot = getPerformanceState()
  listeners.forEach((fn) => fn(snapshot))
}

const setRuntimeTier = (nextTier) => {
  const next = clampTier(nextTier)
  if (next === runtimeTier) return
  runtimeTier = next
  budget = computeBudget(runtimeTier)
  notify()
}

const setHidden = (hidden) => {
  if (isHidden === hidden) return
  isHidden = hidden
  notify()
}

const setReducedMotion = (value) => {
  if (reducedMotion === value) return
  reducedMotion = value
  notify()
}

const setDpr = (value) => {
  if (dpr === value) return
  dpr = value
  notify()
}

const handleResize = () => {
  if (lockHighTier) {
    if (typeof window !== 'undefined') {
      setDpr(window.devicePixelRatio || 1)
    }
    return
  }
  const nextBase = computeBaseTier()
  if (nextBase !== baseTier) {
    baseTier = nextBase
    if (baseTier !== 'high') {
      setRuntimeTier(baseTier)
    }
  }
  if (typeof window !== 'undefined') {
    setDpr(window.devicePixelRatio || 1)
  }
}

const handleVisibility = () => {
  if (typeof document !== 'undefined') {
    setHidden(document.hidden)
  }
}

const handleLongFrame = (now) => {
  if (!lastFrameTime) {
    lastFrameTime = now
    return
  }
  const dt = now - lastFrameTime
  lastFrameTime = now

  if (dt > 50) {
    longFrameCount += 1
  } else {
    longFrameCount = Math.max(0, longFrameCount - 1)
  }

  const nowMs = performance.now()
  if (nowMs < downgradeUntil) return

  if (longFrameCount >= 3 && baseTier !== 'high') {
    const nextIndex = Math.max(0, getTierIndex(runtimeTier) - 1)
    setRuntimeTier(TIERS[nextIndex])
    downgradeUntil = nowMs + 10000
    longFrameCount = 0
    return
  }

  if (longFrameCount === 0 && runtimeTier !== baseTier && baseTier !== 'high') {
    setRuntimeTier(baseTier)
  }
}

const startMonitoring = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibility)

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  setReducedMotion(mq.matches)
  const handleMotion = (e) => setReducedMotion(e.matches)
  if (mq.addEventListener) {
    mq.addEventListener('change', handleMotion)
  } else {
    mq.addListener(handleMotion)
  }

  const rafLoop = (t) => {
    handleLongFrame(t)
    window.requestAnimationFrame(rafLoop)
  }
  window.requestAnimationFrame(rafLoop)
}

const init = () => {
  if (initialized) return
  initialized = true
  baseTier = computeBaseTier()
  runtimeTier = baseTier
  lockHighTier = baseTier === 'high'
  budget = computeBudget(runtimeTier)
  if (typeof document !== 'undefined') {
    isHidden = document.hidden
  }
  if (typeof window !== 'undefined') {
    dpr = window.devicePixelRatio || 1
  }
  startMonitoring()
}

export const getPerformanceTier = () => {
  init()
  return runtimeTier
}

export const getFrameBudget = () => {
  init()
  return { ...budget, reducedMotion, isHidden, dpr }
}

export const getTickInterval = () => {
  init()
  return 1000 / budget.tickRate
}

export const getTickRate = () => {
  init()
  return budget.tickRate
}

export const getEventBatchInterval = () => {
  init()
  return budget.eventBatchMs
}

export const getCanvasFpsCap = () => {
  init()
  return reducedMotion ? budget.canvasFpsReduced : budget.canvasFps
}

export const getPerformanceState = () => {
  init()
  return {
    tier: runtimeTier,
    baseTier,
    budget: { ...budget },
    reducedMotion,
    isHidden,
    dpr,
  }
}

export const shouldRunHeavyEffect = (effectName) => {
  init()
  switch (effectName) {
    case 'stars':
      return runtimeTier === 'high' && !isHidden
    case 'canvasWave':
    case 'balanceWell':
    case 'beam':
      return runtimeTier !== 'low' && !isHidden
    case 'backdropBlur':
      return runtimeTier !== 'low'
    case 'canvasLite':
      return runtimeTier === 'mid' && !isHidden
    default:
      return runtimeTier !== 'low' && !isHidden
  }
}

export const shouldRunCanvasWave = () => shouldRunHeavyEffect('canvasWave')
export const shouldRunBeamEffects = () => shouldRunHeavyEffect('beam')

export const subscribeToPerformanceChanges = (fn) => {
  init()
  listeners.add(fn)
  fn(getPerformanceState())
  return () => listeners.delete(fn)
}
