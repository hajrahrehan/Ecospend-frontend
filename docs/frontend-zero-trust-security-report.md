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

