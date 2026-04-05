# Understanding the Codebase

## Where to Start
1. `src/App3D.js` — top-level routing + canvas setup
2. `src/components/MainShell.jsx` — navigation shell for `/main/*`
3. `src/components/QuantumField.jsx` — background particle system
4. `src/workers/quantumPhysics.worker.js` — physics ticks + buffer pool
5. `src/workers/canvas2d.worker.js` — wave, beam, gravity well
6. `src/data/localApi.js` — mock backend

## How the Quantum Background Works
- R3F canvas renders a GPU point cloud
- Physics worker sends positions via `QUANTUM_TICK`
- `QuantumField` updates geometry attributes and invalidates the frame
- Postprocessing is lazy-loaded and tuned via performance monitor

## Navigation & Routing
- Public routes: `/auth`, `/register`
- Authenticated routes: `/main/*` via `MainShell`
- Admin: `/admin` (mock portal)

## Mock Data Flow
1. UI calls `ApiManager`
2. `ApiManager` calls `localApi`
3. `localApi` reads/writes `mockDb`
4. UI updates local state from response

## Performance Debugging
Use the dev HUD:
- FPS
- Particle count
- Worker ms
- Main-thread ms

Key files:
- `src/components/QuantumDevStats.jsx`
- `src/workers/quantumPhysics.worker.js`

## Key Files at a Glance
- `src/pages/` → app features (Dashboard, Transfer, EcoAI, etc.)
- `src/components/` → shared UI and shell components
- `src/workers/` → heavy compute + offscreen rendering
- `src/lib/` → physics, event bus, toast system
- `src/data/` → mock backend + dataset
