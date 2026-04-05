import mitt from 'mitt'

export const EVENTS = {
  QUANTUM_TICK: Symbol('QUANTUM_TICK'),
  TRANSACTION_COLLISION: Symbol('TRANSACTION_COLLISION'),
  XP_GAIN: Symbol('XP_GAIN'),
  BEAM_FIRED: Symbol('BEAM_FIRED'),
  LEVEL_UP: Symbol('LEVEL_UP'),
  FIELD_UPDATE: Symbol('FIELD_UPDATE')
}

// Global robust event bus for out-of-bounds cross-component and worker communication
export const eventBus = mitt()

// Bind to window for easy debugging if necessary
if (process.env.NODE_ENV === 'development') {
  window.__ECO_BUS__ = eventBus
}
