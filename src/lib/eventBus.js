import mitt from 'mitt'

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
