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
