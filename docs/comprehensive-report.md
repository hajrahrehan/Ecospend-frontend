# Comprehensive Frontend Report

This single file consolidates all documentation. Sections are ordered with security first, performance next, and architecture upgrades later.

---

## Security First

# Frontend-Only Zero Trust Security Report

**Executive Summary**

This frontend relies on browser-stored tokens and UI-only guards, which are inherently bypassable in a hostile client. The most critical risks are token theft, storage-based admin access, and exposure of sensitive card data. The immediate focus should be on reducing data exposure, tightening route guards with verified role data, and implementing token lifecycle handling.

This report treats the browser as fully untrusted and evaluates only the React frontend. Backend protections are not assumed. The goal is to minimize damage even if an attacker can control the client.

**1. Frontend Security Analysis**

**Authentication Flow**

- Tokens are stored in `sessionStorage` via `src/layouts/nonauth/SignIn.js`, `src/layouts/nonauth/AdminSignIn.js`, and `src/helpers/ApiManager.tsx`.
- There is no frontend token expiry, refresh, or forced re-auth handling.

**Risks**

- Any XSS or malicious extension can read tokens from `sessionStorage`.
- Token field names are inconsistent (`logintoken` vs `token`), causing instability.

**Routing and Navigation**

- Guards are implemented in `src/layouts/AuthProtected.js` and `src/layouts/AdminAuthProtected.js`.
- Admin guard redirects to `/auth` instead of `/admin-auth`.

**Risks**

- Route guards can be bypassed by direct storage manipulation.
- Admin UI access is unlocked by setting `@admintoken` manually.

**API Communication Safety**

- All requests flow through `src/helpers/ApiManager.tsx`.
- Authorization header is appended whenever a token exists.

**Risks**

- Public routes can still send privileged tokens if present.
- No response validation; client trusts backend JSON shape.

**Input Handling and Validation**

- Formik + Yup used in many forms (`SignIn`, modals).
- No consistent sanitization step before rendering backend-provided data.

**Sensitive Data Exposure**

- Full card numbers and CVC are rendered in `src/views/Cards.js` and admin user views.

**State Management Risks**

- Multiple `useEffect` hooks lack dependency arrays, causing re-fetch loops.
- Modal ref patterns can hide state coupling and make flows brittle.

---

**2. Frontend-Centric Threat Modeling**

**Threat Actors**

- Malicious user (no auth)
- Authenticated attacker
- Token thief (via XSS or extensions)

**Attack Scenarios**

- Token theft from storage
  - Attacker injects script, reads `sessionStorage`, and replays tokens.

- Token injection
  - Attacker sets `sessionStorage.setItem("@admintoken", "fake")` to unlock admin UI.

- UI bypass of protected routes
  - Attacker navigates to `/admin/*` with injected storage token.

- Sensitive data scraping
  - Attacker reads full card details from the UI.

---

**3. Zero Trust Principles Applied to Frontend**

**Never trust**

- Tokens in storage
- Client-side role checks
- UI-based restrictions

**Always assume**

- Local storage can be modified
- UI state can be manipulated
- Requests can be replayed

**Where Current Frontend Violates Zero Trust**

- Role is inferred from storage, not from verified claims.
- Admin UI is gated only by `@admintoken`.
- Sensitive data is rendered in the client.

**How to Redesign for Zero Trust**

- Treat tokens as hints, not truth.
- Always re-validate role on API responses.
- Minimize exposure of sensitive data in UI.

---

**4. Secure Frontend Flow Design**

**Authentication Flow**

- On login, store access token in memory where possible.
- Use short-lived tokens and automatic logout on expiry.
- If storage is required, keep minimal token data and avoid admin flags.

**Route Protection**

- Route guards should rely on verified role data from API, not just token presence.
- If role cannot be verified, render a fallback and require re-auth.

**API Requests**

- Attach auth header only for protected calls.
- Reject responses with missing or malformed expected shapes.

**Error Handling**

- Add error boundaries in layouts to prevent UI from failing open.

**Safe Rendering**

- Mask card numbers and never show CVC.

---

**5. Data Security (Frontend Perspective)**

**In-Transit**

- Use HTTPS and HSTS at the backend.
- Use `Authorization` headers only on required requests.

**At-Rest (Client)**

- `sessionStorage` and `localStorage` are unsafe in a hostile browser.
- Prefer httpOnly cookies if possible; if not, use short-lived tokens.

---

**6. Frontend Security Boundaries**

**Frontend Can Secure**

- Reduce exposure of sensitive data
- Minimize token lifetime
- Provide safe UI defaults
- Detect expired sessions

**Frontend Cannot Secure**

- Prevent storage manipulation
- Prevent token replay
- Enforce real authorization

Conclusion: Frontend protections are risk-reduction only, not true enforcement.

---

**7. Vulnerabilities and Weak Patterns**

- Trusting `sessionStorage` for roles (`Sidebar`, `AdminAuthProtected`).
- Displaying full card data in the UI (`Cards.js`, admin user list).
- No token lifecycle handling.
- Missing dependency arrays causing unpredictable fetch loops.

---

**8. Zero Trust Frontend Architecture (Practical)**

- Centralized `AuthProvider` context for token + role state.
- Token expiry detection and automatic logout.
- Role-based UI driven by verified API responses, not stored flags.
- Defensive UI rendering: never show full sensitive data.
- Strict API response validation in the client.

---

**9. Risk Summary**

**Top Frontend Risks**

1. Storage-based admin access
2. Token theft from `sessionStorage`
3. Full card data exposure in UI
4. No token lifecycle handling
5. Unvalidated API responses

**Likelihood vs Impact**

- Token theft: medium likelihood, high impact
- Card data exposure: high likelihood, high impact
- UI-only access control: high likelihood, medium impact

---

**10. Actionable Fix Plan**

**Immediate Fixes**

1. Mask card numbers and remove CVC display.
2. Fix admin guard redirect.
3. Fix cards list fetch bug.

**Medium Improvements**

1. Standardize token field naming.
2. Add token expiry handling and auto logout.
3. Add response validation for API data.

**Structural Improvements**

1. Introduce `AuthProvider` context.
2. Replace storage-based role checks with verified role data.
3. Add layout-level error boundaries.

---

**Bypass Examples and Mitigations**

- Bypass: Attacker injects `@admintoken` in storage to see admin UI.
Mitigation: Require verified role claim from backend response before showing admin routes.

- Bypass: Attacker steals token via XSS.
Mitigation: Use short-lived tokens, minimize storage, add CSP.


---

## Performance and Architecture Analysis

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

---

## Architecture Upgrade Vision

# Frontend Architecture Documentation (Refactor Vision)

This document defines the target, production-grade frontend architecture for the banking UI. It replaces the legacy model of direct API calls, storage-based trust, and tightly coupled component logic. The new system is event-driven, Zero Trust aligned, and performance-optimized.

**1. Updated Architecture Overview**

**Layered Structure**

UI → Hooks → Services → API → Event Bus → State

**Description**

- UI components render state and dispatch intent.
- Hooks encapsulate view logic and subscribe to domain events.
- Services isolate business operations and API orchestration.
- API layer handles HTTP, validation, and error normalization.
- Event bus provides cross-feature synchronization without coupling.
- State is minimal, derived where possible, and scoped to domains.

---

**2. Authentication and Zero Trust Model**

**AuthProvider-Based System**

- A centralized `AuthProvider` owns token lifecycle, role metadata, and session state.
- Components never read auth tokens directly from storage.
- All role and identity decisions are derived from verified data returned by the API.

**Token Lifecycle**

- Short-lived access tokens are used in memory.
- If persistence is required, tokens are stored with expiry metadata and validated on every route change.
- Expired tokens trigger immediate logout and UI reset.

**Fail-Closed Behavior**

- If role or token validity cannot be verified, the UI falls back to the least-privileged state.
- Admin screens and privileged actions are hidden until verified.

---

**3. Event-Driven System Design**

**Event Bus Concept**

- The event bus is a lightweight pub/sub layer that decouples features.
- Domain events trigger targeted refreshes rather than full page reloads.

**Domain Events**

- `auth:login`, `auth:logout`, `auth:expired`
- `transfer:success`, `transfer:failed`
- `beneficiary:created`, `beneficiary:updated`, `beneficiary:deleted`
- `ticket:created`, `ticket:resolved`
- `card:issued`, `card:blocked`, `card:updated`
- `profile:updated`

**Communication Model**

- Services emit events after successful operations.
- Views and hooks subscribe to relevant events and refresh minimal data.
- Cross-page updates (dashboard balance, statements) are automatic and scoped.

---

**4. API Layer Redesign**

**Service-Based API Layer**

- All API calls move into `services/` modules.
- UI never calls `ApiManager` directly.

**Request/Response Validation**

- Responses are validated against expected shapes (zod or equivalent).
- Invalid responses are rejected and surfaced via standardized errors.

**Error Normalization**

- A single error shape is returned to UI: `{ code, message, details }`.
- UI displays safe, non-sensitive error messages.

**Token Injection Rules**

- Auth headers are attached only for protected endpoints.
- Unauthorized responses trigger `auth:expired` and logout.

---

**5. State Management Strategy**

- State is minimal and domain-scoped.
- Lists are stored once; filtered views are derived with `useMemo`.
- Event-driven updates replace manual refresh and refetch loops.

---

**6. Performance Optimization Strategy**

**Code Splitting and Lazy Loading**

- Route-level lazy loading for admin and low-frequency views.
- Shared UI bundles are split from feature bundles.

**Concurrency and Scheduling**

- Use `startTransition` for non-urgent state updates (search filtering, list refresh).
- Parallelize independent API requests with `Promise.all`.

**Render Optimization**

- Use `useMemo` and `useCallback` for heavy filtering and derived data.
- Avoid redundant state copies.

**Optional Workers**

- Move large statement aggregation to a web worker if datasets grow.

---

**7. Folder and Module Structure**

```
/src
  /components    # UI building blocks
  /views         # Page-level views
  /services      # Domain service layer (API orchestration)
  /hooks         # useApi, useAuth, useEventBus, domain hooks
  /context       # AuthProvider, ThemeProvider
  /events        # Event bus + domain event constants
  /utils         # formatters, validators, helpers
  /routes        # route metadata and lazy loaders
```

**Layer Responsibilities**

- `components`: reusable UI only.
- `views`: composition and layout, no API calls.
- `services`: API orchestration and domain workflows.
- `hooks`: state and domain logic, event subscription.
- `context`: cross-app session and theme state.
- `events`: domain events and event bus.

---

**8. Security Improvements Summary**

- Zero Trust enforced at UI layer: never trust storage or UI checks.
- Sensitive data is masked (no full card numbers or CVC).
- All privileged UI is gated by verified role data.
- Auth failures fail closed and reset state.

---

**9. Migration Guide**

**Phase 1: Auth + API Centralization**

- Add `AuthProvider`.
- Move API calls into `services/`.
- Replace storage-based checks with verified role data.

**Phase 2: Event System Introduction**

- Add event bus and domain event constants.
- Emit events from services.
- Subscribe in hooks/views for targeted refresh.

**Phase 3: Performance Optimization**

- Lazy-load routes and admin pages.
- Add `useMemo` for derived list state.
- Parallelize API calls.

**Phase 4: Cleanup Legacy Patterns**

- Remove direct `ApiManager` imports from views.
- Replace modal refs with controlled components.
- Eliminate repeated fetch loops.

---

This document should be treated as the source of truth for the refactor. All new work should align with these layers and event-driven patterns.

---

## Implementation Plan

# Implementations Plan

This document describes concrete implementation steps for the frontend security and stability improvements identified in the reports.

**Scope**

- Frontend-only changes in this repository.
- No assumptions about backend enforcement beyond existing APIs.

---

**1. Immediate Fixes (High Impact, Low Effort)**

1. Mask card numbers and remove CVC display
- Update `src/views/Cards.js` and `src/views/admin/AdminUserList.js`.
- Show only last 4 digits of card numbers and never display CVC.

2. Fix cards list fetch bug
- Update `src/views/Cards.js` to initialize `logData` as `null` or trigger fetch unconditionally on mount.

3. Fix admin redirect target
- Update `src/layouts/AdminAuthProtected.js` to redirect to `/admin-auth` when no admin token is present.

---

**2. Medium Improvements (Security + Reliability)**

1. Standardize token field name
- Normalize token assignment in `src/helpers/ApiManager.tsx` and `src/layouts/nonauth/SignIn.js`.
- Choose one field name, e.g. `token`, and map any backend alternative to it.

2. Add token expiry handling
- Store token issue time in memory and compare on each route change.
- Force logout if token is expired or missing.

3. Add API response validation
- Add a small validation layer in `src/helpers/ApiManager.tsx` (zod or lightweight checks).
- If response shape is invalid, show a toast and refuse to render.

---

**3. Structural Improvements (Zero Trust Alignment)**

1. Add `AuthProvider` context
- Centralize auth state, token storage, and role metadata.
- Expose `login`, `logout`, `isAuthenticated`, `role`, and `isExpired`.

2. Verified role-based UI
- Stop reading `@admintoken` from `sessionStorage` in `src/components/sidebar/Sidebar.js`.
- Read role from `AuthProvider` and only after a successful verification call.

3. API call hardening
- Only attach tokens to requests that require auth.
- Add a single place to handle 401/403 and force logout.

4. Error boundaries
- Add layout-level error boundaries for `/main/*` and `/admin/*`.

---

**4. Suggested Implementation Order**

1. Mask card numbers and remove CVC display.
2. Fix cards fetch bug.
3. Fix admin redirect.
4. Standardize token field naming.
5. Add token expiry handling.
6. Add response validation.
7. Add `AuthProvider` and migrate role checks.
8. Add error boundaries.

---

**5. Completion Criteria**

- No CVC displayed anywhere in UI.
- Cards list loads correctly on first render.
- Admin login flow always routes to `/admin-auth`.
- Token handling is consistent across all auth flows.
- Expired tokens force logout.
- UI shows safe fallback on invalid API responses.
- Sidebar and routes rely on verified role from context, not storage.

---

If you want, I can implement these changes in the codebase next.
