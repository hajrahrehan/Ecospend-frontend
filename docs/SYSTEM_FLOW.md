# System Flow (EcoSpend)

This document explains how data and control flow through the system at runtime.

## 1) User Action Flow (Example: Transfer)

```
User clicks "TRANSFER" button
  -> Transfer.jsx validates input
  -> API call via ApiManager
  -> EventBus emits XP_GAIN
  -> HUD animates XP gain
```

Where performance fits:
- `PerformanceGovernor` decides if beam effects are allowed (`shouldRunHeavyEffect('beam')`).
- If allowed, the Canvas2D worker renders the beam animation.

## 2) QUANTUM_TICK Flow (Physics Worker → React)

```
quantumPhysics.worker.js (tick)
  -> postMessage({ type: 'QUANTUM_TICK', payload })
  -> useQuantumWorker.onmessage
  -> emitQuantumTick(payload) [EventBus batching]
  -> eventBus.emit(EVENTS.QUANTUM_TICK)
  -> QuantumField listener updates BufferAttribute
  -> R3F invalidate() (throttled)
```

Notes:
- EventBus batching reduces per-tick overhead (Tier B).
- Rendering is demand-driven; no continuous RAF in R3F.

## 3) Worker → EventBus → React Update Path

```
Worker (Physics) -> EventBus -> React (QuantumField)
Worker (Canvas2D) -> OffscreenCanvas -> DOM <canvas>
```

- Physics worker updates 3D positions (via transferable buffers).
- Canvas worker updates 2D UI effects in offscreen canvases.
- React does NOT store positions in state; updates are ref-based.

## 4) Performance Tier Influence

```
PerformanceGovernor
  -> tier decision
  -> frame budgets
  -> effect permission (stars, blur, beam, waves)

Subsystems ask governor before running:
  - QuantumField (stars)
  - CanvasLiteBackground (RAF + FPS caps)
  - Login/Dashboard/Transfer effects
```
