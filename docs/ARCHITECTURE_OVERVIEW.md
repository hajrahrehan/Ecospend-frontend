# EcoSpend Architecture Overview

This document gives a high-level, quick-scan understanding of how the EcoSpend frontend is put together, with emphasis on the performance-governed rendering pipeline.

## System at a Glance

```
+-------------------+        +------------------------+
|  React UI Layer   | <----> |     EventBus (mitt)     |
+-------------------+        +------------------------+
          |                               ^
          |                               |
          v                               |
+-------------------+        +------------------------+
| QuantumBackground |        | Physics Worker (R3F)   |
| (Three/Canvas/CSS)| <----> | quantumPhysics.worker  |
+-------------------+        +------------------------+
          |
          | (OffscreenCanvas)
          v
+-------------------+
| Canvas2D Worker   |
| canvas2d.worker   |
+-------------------+

             +-----------------------------------+
             | PerformanceGovernor (Tier C)      |
             | - Tier selection                  |
             | - Frame budgets                   |
             | - Effect gating                   |
             +-----------------------------------+
```

## Core Subsystems

- **React UI**: Banking UI, pages, and HUD. Heavy visuals are layered behind it via `QuantumBackground`.
- **Three.js (R3F)**: Main cosmic background for high-tier devices.
- **Canvas2D Worker**: UI-bound effects (waves, beams, gravity well) via OffscreenCanvas.
- **Physics Worker**: Particle simulation updates, sent to main thread via `QUANTUM_TICK`.
- **EventBus**: High-frequency tick delivery and cross-component event signaling.
- **PerformanceGovernor**: Single source of truth for tier, budgets, and effect permissions.

## Key Design Principles

- **Progressive enhancement**: UI always works; visuals degrade gracefully.
- **Single performance brain**: Governor decides budgets and effect gating.
- **Low overhead loops**: Throttled ticks, batched events, and visibility-aware RAF.

## Where PerformanceGovernor Sits

The governor is not a separate UI system. It is a **shared utility** used by workers, event batching, and UI components to decide:

- Which effects are allowed to run
- How fast loops should tick
- When to pause or resume expensive loops
- How to batch high-frequency events

It does **not** render anything directly; it only informs other systems.
