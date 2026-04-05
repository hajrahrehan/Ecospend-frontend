# EcoSpend Implementation Notes

## Phase 1 — Original Cosmic UI
**Goal:** Build a fully themed quantum-space banking UI.

Key work:
- Persistent 3D space background (R3F)
- Holographic cards + orbital visuals
- Gamification (XP, levels, streaks)
- Quantum metaphors across all screens

## Phase 2 — Event-Driven + Worker Optimization
**Goal:** Make visuals performant and main-thread safe.

Key work:
- `mitt` EventBus for `QUANTUM_TICK` + UI signals
- `quantumPhysics.worker.js` for particle simulation
- `canvas2d.worker.js` for offscreen 2D animations
- Transferable buffers and pool reuse
- `frameloop="demand"` + `invalidate()` for minimal renders

## Phase 3 — Lazy Loading + Full Feature Coverage
**Goal:** Make the app feel complete with all features and navigation.

Key work:
- Lazy routes for heavy pages
- Added EcoAI, EcoMall, Support, Profile, Cards, Admin
- Built a quantum-themed `MainShell` nav + header
- New quantum Sign Up page matching login aesthetics

## Mock Backend
**Goal:** Simulate backend behavior with deterministic mock data.

Key work:
- `src/data/mockDb.js` contains users, cards, beneficiaries, tickets, transactions
- `src/data/localApi.js` exposes endpoints for login, transfer, tickets, admin
- `src/helpers/ApiManager.tsx` wraps API calls for UI use

## How to Add New Features
1. Add a mock handler in `src/data/localApi.js`
2. Add a helper in `src/helpers/ApiManager.tsx`
3. Implement the UI in `src/pages/` or `src/components/`
4. Register the route in `src/App3D.js`
5. Optionally emit XP gain using `eventBus` + `quantumToast`

## Feature Timeline Summary
- Quantum background: R3F canvas + shader particles + demand rendering
- Auth: Quantum login + new holographic sign-up
- Dashboard: Balance well + collision log + quick access
- Transfer: Beneficiary flow + beam animation + balance validation
- EcoAI: Mock financial advisor chat
- EcoMall: Product grid + discount + checkout
- Support: Ticket submission + admin reply
- Admin: Users, cards, tickets, product management
