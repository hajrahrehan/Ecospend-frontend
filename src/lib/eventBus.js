// eventBus.js
// Purpose: Central event hub for high-frequency ticks and UI signals.
// Depends on: performanceGovernor for batching intervals.
// Used by: QuantumField, HUD, pages (XP events), workers.
import mitt from 'mitt'
import { getEventBatchInterval } from '../perf/performanceGovernor'

/**
 * Canonical event names for the EcoSpend quantum bus.
 * Strings keep interoperability with Workers and debug tooling.
 */
export const EVENTS = Object.freeze({
  QUANTUM_TICK: 'QUANTUM_TICK',
  TRANSACTION_COLLISION: 'TRANSACTION_COLLISION',
  XP_GAIN: 'XP_GAIN',
  BEAM_FIRED: 'BEAM_FIRED',
  LEVEL_UP: 'LEVEL_UP',
  FIELD_UPDATE: 'FIELD_UPDATE',
})

// Global robust event bus for out-of-bounds cross-component and worker communication
export const eventBus = mitt()

// Bind to window for easy debugging if necessary
if (process.env.NODE_ENV === 'development') {
  window.__ECO_BUS__ = eventBus
}

let pendingQuantumTick = null
let quantumTickTimer = null
let lastQuantumEmit = 0

export const emitQuantumTick = (payload) => {
  pendingQuantumTick = payload
  const interval = getEventBatchInterval()
  const now = performance.now()
  const elapsed = now - lastQuantumEmit

  if (elapsed >= interval && !quantumTickTimer) {
    lastQuantumEmit = now
    eventBus.emit(EVENTS.QUANTUM_TICK, pendingQuantumTick)
    pendingQuantumTick = null
    return
  }

  if (!quantumTickTimer) {
    quantumTickTimer = setTimeout(() => {
      quantumTickTimer = null
      if (!pendingQuantumTick) return
      lastQuantumEmit = performance.now()
      eventBus.emit(EVENTS.QUANTUM_TICK, pendingQuantumTick)
      pendingQuantumTick = null
    }, Math.max(0, interval - elapsed))
  }
}
