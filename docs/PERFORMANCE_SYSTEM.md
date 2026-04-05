# Performance System (Tier A/B/C)

This document explains the performance system and how it is structured after Tier C.

## Tier A (Critical Mobile Fixes)
- Throttled canvas worker loops.
- Disabled heavy canvas effects on low tier.
- Removed expensive blur effects on low tier.
- Ensured worker loops stop cleanly on unmount.

## Tier B (Runtime Overhead Reduction)
- Batched `QUANTUM_TICK` events to avoid per-frame spam.
- Removed dynamic import from tick path.
- Gated the secondary `Stars` layer on mid tier.
- Paused background RAF when document is hidden.

## Tier C (Performance Governor)
- Centralized all performance decisions into one module.
- Unified tier selection, budgets, and effect gating.
- Provided a subscription API for runtime adaptation.
- Ensured consistent policies across workers, EventBus, and UI.

## What Is Centralized Now

- Tier decision (`low / mid / high`)
- Frame budgets (event batch intervals, canvas FPS caps)
- Visibility awareness (`document.hidden`)
- Reduced motion handling
- Effect gating (stars, canvas wave, beam, blur, etc.)

## What Remains Distributed

- The actual rendering and worker logic
- Component structure and UI state
- Physics and shader logic

## PerformanceGovernor Responsibilities

- Establish base tier at startup.
- Adjust runtime tier for mid/low devices using long-frame heuristics.
- Provide stable budgets for all subsystems.
- Gate heavy effects consistently.
- Broadcast changes via `subscribeToPerformanceChanges`.
