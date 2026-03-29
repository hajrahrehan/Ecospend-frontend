# Architecture, Performance, and Zero Trust Report (Frontend)

This report is tailored to the current React codebase. It assumes a fully untrusted browser and does not rely on backend fixes. The goal is to improve architecture, performance, scalability, and frontend-only security posture.

**PART 1: Architecture Analysis**

**Component Structure and Coupling**

- Views are feature pages under `src/views/*` and `src/views/admin/*`.
- Layouts and route shells are under `src/layouts/*`.
- Modals and feature components are grouped under `src/components/*`.
- Many views are tightly coupled to API calls (directly importing `ApiManager` inside views).

**Data Flow**

- Typical flow: view mounts → `ApiManager` call → `useState` updates → UI render.
- Modal flows: parent stores ref → modal performs API action → parent resets state and re-fetches.

**State Management Patterns**

- Local component state via `useState` dominates.
- No centralized auth state; tokens are read from `sessionStorage` in multiple places.
- No shared state for cross-page updates (dashboard does not auto-update when transfers happen).

**API Interaction Patterns (ApiManager)**

- Single centralized helper `src/helpers/ApiManager.tsx`.
- Every view calls `ApiManager` functions directly.
- No response schema validation, no centralized error normalization beyond toast.

**Routing and Layout Structure**

- `src/index.js` defines routes and mounts layout shells.
- `src/routes.js` provides route metadata for sidebar and layout routing.
- `AuthProtected` and `AdminAuthProtected` perform token presence checks.

**Architecture Issues**

- Tight coupling between views and API logic (harder to test and reuse).
- Repeated list-fetch patterns and refresh logic across multiple views.
- Storage-based role checks spread across UI components (`Sidebar`, admin routes).
- Modals rely on refs for control, which increases implicit coupling and makes state flow less obvious.

---

**PART 2: Performance Analysis**

**Unnecessary Re-Renders**

- Multiple `useEffect` hooks without dependency arrays cause repeated API calls (`Beneficiary`, `Transfer`, `Tickets`, `PersonalInfo`).
- State resets (`setlogData(null)`) trigger full re-fetch loops even if only a single item changes.

**Improper useEffect Usage**

- Fetch effects often run every render. They should run on mount or when dependencies change.
- Some logic uses `isActive` flags instead of proper cleanup with dependencies.

**Sequential API Calls**

- Views often fetch in sequence, even where parallel would be safe (e.g., user profile + cards + limits).

**Lack of Lazy Loading / Code Splitting**

- All views are bundled and loaded upfront in `src/index.js` and `src/routes.js`.
- Admin pages and rarely-used views are not lazy-loaded.

**Large Bundle / Blocking Operations**

- Heavy libraries (e.g., `moment`) are imported in multiple files.
- No dynamic import or tree-shaking optimization for route-level code.

**Concurrency Opportunities**

- Parallel fetching of dashboard-related info, cards, and tickets.
- Prefetching in background when user is idle.

---

**PART 3: Concurrency and Parallelism Analysis**

**React Concurrent Features**

- `startTransition` can be used for non-urgent state updates like search filtering and list refresh.
- Example candidates: beneficiary search, tickets search, card list filtering.

**Parallel API Calls**

- Use `Promise.all` for dashboard-related data (user + limits + cards) if backend supports separate endpoints.
- Parallelize admin user list + cards fetch when selecting a user.

**Web Workers**

- No heavy computation currently, but statement aggregation and large list filtering could move to worker if data size grows.

**What Should Remain Synchronous**

- Auth guard checks and route transitions should remain synchronous.
- Critical UI actions (e.g., transfer submit) should not be deferred.

---

**PART 4: Event-Driven Design Analysis**

**Current Communication Pattern**

- Parent components directly call child modals and manually reset state to re-fetch.
- No global event system; each page is isolated.

**Where Event-Driven Architecture Helps**

- Transfers → dashboard balance update.
- Ticket creation → tickets list refresh.
- Beneficiary updates → transfer list update.

**Improved Flow (Example)**

- Current: Transfer success → `setlogData(null)` → re-fetch list.
- Proposed: Transfer success → emit `transfer:success` event → dashboard, statement, and transfer list subscribers refresh selectively.

**Benefits**

- Reduces coupling between pages.
- Avoids full reloads.
- Enables background refresh instead of blocking UI.

---

**PART 5: Zero-Copy and State Optimization**

**State Duplication**

- Many views store full copies of lists and also filtered copies (`logData` + `filteredData`).

**Inefficient Data Transformations**

- Filtering lists on every keystroke without memoization.
- Reversing arrays in-place (`Tickets`) mutates source.

**Recommendations**

- Keep single source list state and derive filtered list with `useMemo`.
- Avoid in-place mutations; use immutable transforms.
- Replace repeated refetches with in-place updates for add/edit/delete operations.

---

**PART 6: Zero Trust Frontend Alignment**

**Risky Trust Assumptions**

- Role and auth inferred from `sessionStorage`.
- Admin UI unlocked by storage flags.
- Sensitive card data rendered in UI.

**Safer Frontend Patterns**

- Use verified role data returned by backend for UI decisions.
- Treat tokens as hints; validate on API response.
- Mask card numbers and never show CVC.

**Defensive UI Rendering**

- Render minimal sensitive data.
- Fail closed: if role or auth cannot be verified, show safe fallback.

---

**PART 7: Refactor Plan (Step-by-Step)**

**Step 1: Quick Wins**

- Fix cards fetch logic in `src/views/Cards.js`.
- Add dependency arrays to fetch effects in `Beneficiary`, `Transfer`, `Tickets`, `PersonalInfo`.
- Mask card numbers and remove CVC display.
- Fix admin guard redirect to `/admin-auth`.

**Step 2: Structural Improvements**

- Introduce `AuthProvider` context for token + role state.
- Add `useApi` hook to centralize request lifecycle (loading, error, success).
- Normalize API responses in `ApiManager`.

**Step 3: Architecture Upgrade**

- Add lightweight event bus (custom hook or tiny emitter) for cross-feature updates.
- Create `services/` folder for API calls, separating view logic from API calls.
- Migrate modals to controlled components rather than refs.

**Step 4: Performance Enhancements**

- Lazy-load routes and admin pages using `React.lazy` and `Suspense`.
- Use `useMemo` and `startTransition` for heavy filtering and list updates.
- Parallelize independent API calls with `Promise.all`.

**Step 5: Advanced Improvements (Optional)**

- Replace `moment` with smaller library or date-fns.
- Use web workers for large statement processing if data grows.

---

**PART 8: Target Architecture**

**High-Level Flow**

Component → Event → Service → API → State → UI

**Modules**

- `AuthProvider`: token lifecycle, role verification, logout.
- `services/`: encapsulated API logic with typed validation.
- `hooks/`: `useApi`, `useAuth`, `useEventBus`.
- `events/`: domain events (`transfer:success`, `ticket:created`).

**Data Flow**

- UI triggers service call → service emits domain event → subscribed views refresh minimal data.
- UI renders only minimal sensitive data.

**Scalability**

- Route-level code splitting reduces initial load.
- Event-driven updates avoid full page refreshes.
- Centralized auth handling avoids duplicate logic.

---

If you want, I can implement Step 1 and Step 2 changes in the codebase and then update this report with resolved items.
