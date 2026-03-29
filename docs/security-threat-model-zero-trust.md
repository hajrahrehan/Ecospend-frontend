# Frontend Security + Threat Modeling + Zero Trust Report

This report is specific to the current React frontend in this repo. It references concrete modules and focuses on realistic risks and exploitability. It does not assume backend fixes are in place.

**1. Full Security Analysis (Frontend Scope Only)**

**Authentication Flows**

- User login and registration live in `src/layouts/nonauth/SignIn.js`.
- Admin login lives in `src/layouts/nonauth/AdminSignIn.js`.
- Tokens are stored in `sessionStorage` via both UI and `src/helpers/ApiManager.tsx`.

**Findings**

- Token storage in `sessionStorage` is vulnerable to XSS-based token theft. If any script injection occurs, tokens can be read and exfiltrated.
- The admin flow relies on a separate `@admintoken` but there is no claim validation on the client.
- Token naming appears inconsistent between `SignIn.js` (`res.data.logintoken`) and `ApiManager` (`res.data.token`).

**Authorization and Role Handling**

- Role determination is purely based on the presence of `@admintoken` in `sessionStorage` in `src/components/sidebar/Sidebar.js` and `src/layouts/AdminAuthProtected.js`.
- No verified role or claim validation exists in the client.

**API Communication Layer**

- All API calls are centralized in `src/helpers/ApiManager.tsx` with a generic `CreateFetch` wrapper.
- Authorization header is added whenever a token exists, even for public routes.

**Token Storage**

- `sessionStorage` is used for both user and admin tokens.
- There is no token refresh or expiry handling in the client.

**Routing and Route Protection**

- Protected routes are gated by `src/layouts/AuthProtected.js` and `src/layouts/AdminAuthProtected.js`.
- Admin guard redirects to `/auth` instead of `/admin-auth`, which is incorrect for admin flow.

**Form Handling and Validation**

- Formik + Yup validation is used in many forms.
- Some data paths still rely on raw inputs without uniform sanitization before render.

**Sensitive Data Exposure in UI**

- Card data is displayed with full card numbers and CVCs in `src/views/Cards.js` and admin views in `src/views/admin/AdminUserList.js`.

---

**2. Threat Modeling**

**Threat Actors**

- Malicious user with no auth
- Authenticated attacker
- Insider or admin abuse
- Script-based attacker (XSS, injected browser extensions)

**Attack Surfaces**

- Auth screens: `src/layouts/nonauth/SignIn.js`, `src/layouts/nonauth/AdminSignIn.js`
- API layer: `src/helpers/ApiManager.tsx`
- Browser storage: `sessionStorage`
- Routing system: `src/index.js`, `src/layouts/*Protected.js`
- UI rendering: `src/views/*`, `src/components/*`

**Threat Scenarios**

- Token theft via XSS
Attacker injects script into any render path or dependency and reads `sessionStorage` tokens, then replays them.

- Token injection via dev tools
Attacker manually sets `sessionStorage.setItem("@admintoken", "fake")` and unlocks admin UI. If backend does not enforce role checks, actions succeed.

- Privilege escalation
Attacker reuses a stolen admin token to access admin endpoints from browser or API client.

- API abuse or replay
Tokens are long-lived from the frontend perspective and can be replayed without user interaction.

- UI data leakage
Full card numbers and CVCs are visible to any user with access to card list views.

---

**3. Vulnerability Classification**

Each issue includes description, impact, severity, exploit scenario, and fix.

**Code-Level Vulnerabilities**

- `src/views/Cards.js`
Description: Fetch never runs because `logData` is initialized to `[]` but fetch triggers only on `null`.
Impact: Cards list never loads.
Severity: Critical
Exploit: Not exploitable but breaks functionality; attackers may leverage confusion to social-engineer.
Fix: Initialize `logData` to `null` or run fetch on first render.

- `src/layouts/AdminAuthProtected.js`
Description: Redirects to `/auth` instead of `/admin-auth`.
Impact: Admin login flow breaks or misroutes.
Severity: High
Exploit: Confusion can cause admins to authenticate in user login flow.
Fix: Redirect to `/admin-auth`.

- `src/helpers/ApiManager.tsx` + `src/layouts/nonauth/SignIn.js`
Description: Token field mismatch (`token` vs `logintoken`).
Impact: Inconsistent token storage.
Severity: Medium
Exploit: User sessions can become unstable or fail silently.
Fix: Normalize token field name in API manager.

**Feature-Level Vulnerabilities**

- Cards display in `src/views/Cards.js` and `src/views/admin/AdminUserList.js`
Description: Full card numbers and CVCs rendered in UI.
Impact: Sensitive PCI data exposure.
Severity: High
Exploit: Any account user can exfiltrate card data via screenshots or browser extraction.
Fix: Mask card numbers, remove CVC from UI.

- Products page in `src/layouts/nonauth/Products.js`
Description: Public route but API requires auth header by default.
Impact: Flow fails for unauthenticated users.
Severity: High
Exploit: Not direct security exploit but breaks purchasing flow; attackers can abuse error paths.
Fix: Protect `/products` or explicitly set `istoken = false` for product purchase.

**Security Misconfigurations**

- Client-side trust in storage-only role checks.
Impact: Admin UI access by token injection.
Severity: High
Exploit: Dev tools injection of `@admintoken`.
Fix: Use verified role claims and backend authorization checks.

**Business Logic Flaws**

- Admin vs user separation is UI-only.
Impact: If backend is lax, users can trigger admin actions.
Severity: High
Exploit: Token reuse or tampering allows admin actions.
Fix: Enforce backend authorization and verify roles before enabling admin UI.

---

**4. OWASP Top 10 Mapping**

- Broken Access Control: Role determined by presence of `@admintoken` only and admin routes protected only by client storage.
- Sensitive Data Exposure: Full card numbers and CVC shown in UI.
- Identification and Authentication Failures: Token mismatch between UI and API manager, no refresh or expiry handling.
- Security Misconfiguration: Public products route with auth-only API behavior.
- Injection (XSS risk): Any injected script can exfiltrate `sessionStorage` tokens.

---

**5. Data Security (In-Transit and At-Rest)**

**In-Transit**

- API URL uses HTTPS in `docker-compose.yml`.
- Tokens are transmitted via `Authorization: Bearer` headers.
- No request signing or replay protection on the frontend.

**Recommendations**

- Ensure HTTPS everywhere, enforce HSTS at the backend.
- If feasible, use short-lived access tokens with refresh rotation.
- Consider signed requests if high-value transactions are exposed.

**At-Rest (Frontend Context)**

- Tokens stored in `sessionStorage` are vulnerable to XSS.

**Recommendations**

- Prefer httpOnly secure cookies where possible.
- Avoid persisting any sensitive data beyond session scope.
- Add CSP and sanitize all backend-rendered content.

---

**6. Security Responsibility Split**

**Frontend-Limited Security (Weak by Design)**

These controls can be bypassed:

- Route guards (`AuthProtected`, `AdminAuthProtected`)
- Token presence checks in `sessionStorage`
- UI-based role enforcement (admin vs user)
- Hidden UI elements (buttons, menus)

Conclusion: These are UX protections, not security controls.

**Backend-Enforced Security (Required for Real Protection)**

Must be enforced server-side:

- Role validation (admin/user)
- Token verification and signature validation
- Access control on every API endpoint
- Data exposure filtering (e.g., card masking)

Conclusion: Frontend must assume the backend is the only trusted authority.

---

**7. Business Logic Attack Scenarios**

**Transfer Abuse**

- No visible frontend restriction on negative or extreme values.
- Attacker can manipulate request payload directly.

Risk: Financial manipulation if backend validation is weak.

**Beneficiary Abuse**

- No visible rate limiting or strict validation in frontend.
- Attacker could add thousands of beneficiaries or attempt injection via names.

Risk: Abuse of storage, operational overhead, or downstream injection if backend is weak.

**Ticket Spam / DoS**

- No throttling visible in frontend.
- Attacker can flood ticket creation.

Risk: Support workflow disruption and service degradation.

**Product Purchase Replay**

- If backend lacks idempotency keys, the same request can be replayed.

Risk: Duplicate charges or inventory issues.

---

**8. Token Lifecycle Risks**

- No expiration handling in the frontend.
- No refresh token mechanism.
- No logout invalidation strategy is visible.

Exploit: A stolen token remains valid indefinitely from the frontend perspective.

Fix: Implement short-lived access tokens, rotating refresh tokens, and auto-logout on expiry.

---

**9. Browser and Environment Threats**

- Malicious browser extensions can read `sessionStorage` and intercept API calls.
- DevTools manipulation can modify React state and inject tokens.
- CSP is not enforced, increasing XSS risk.

---

**10. Zero Trust Architecture Conversion**

**Current Issues**

- Client assumes storage-based role trust.
- Admin access relies on presence of `@admintoken`.
- API wrapper trusts all responses without validation.

**Zero Trust Principles to Apply**

- Never trust the client
- Always verify identity and role on every sensitive request
- Enforce least privilege at the API
- Continuously validate session and token age

**Implementation Plan**

- Replace client-side role checks with verified claims from backend.
- Use short-lived tokens with refresh flows.
- Add backend-driven authorization checks and return scoped permissions.
- Remove any sensitive logic or display that is not required in frontend.

**Frontend Changes Needed**

- Centralized auth context to manage token lifecycle.
- Route guards that check both presence and role claims.
- Add token expiry detection and forced re-login.
- Add API response validation layer (zod or similar).

---

**11. Zero Trust Implementation (Concrete Plan)**

**Step 1: Eliminate Implicit Trust**

- Remove logic like `sessionStorage.getItem("@admintoken")` for role decisions.
- Replace with verified role claims from backend responses.

**Step 2: Introduce Auth Context Layer**

- Create an `AuthProvider` that handles token storage, role decoding (JWT), expiry tracking, and auto logout.

**Step 3: Enforce “Always Verify” API Calls**

- Every request assumes the token may be invalid and the role may be insufficient.
- Backend must reject unauthorized calls and return scoped permissions.

**Step 4: Remove Sensitive Data From Frontend**

- Never expose full card numbers or CVC.
- Only show last 4 digits at most.

**Step 5: Add Continuous Validation**

- Validate session on route change.
- Check auth validity on API responses.
- Expire sessions on inactivity.

---

**12. Architecture Weaknesses**

- `ApiManager` is a single trust boundary, but lacks schema validation and error classification.
- Modal ref patterns can create hidden state transitions that are hard to reason about.
- Over-reliance on `sessionStorage` for both auth and role handling.

---

**13. Risk Summary**

**Top 10 Critical Risks**

1. Admin access based purely on storage token presence.
2. Card numbers and CVCs exposed in UI.
3. Token theft via XSS or injected scripts.
4. Products route misaligned with auth requirement.
5. Token naming inconsistencies.
6. Missing token lifecycle management.
7. Missing error boundaries for critical flows.
8. No schema validation for API responses.
9. Sensitive data rendered in admin views.
10. Excessive reliance on client-side checks for access control.

**Security Posture Summary**

- High risk due to client-side trust assumptions, weak role verification, and sensitive data exposure.

**Likelihood vs Impact**

- Token theft or injection is medium likelihood but high impact.
- Card data exposure is high likelihood and high impact.
- Misrouting and auth mismatches are high likelihood and medium impact.

---

**14. Recommendations and Fix Roadmap**

**Prioritized Fixes**

1. Mask card numbers and remove CVC display in UI.
2. Fix admin guard redirect and require verified role claims for admin UI.
3. Fix cards fetch logic in `src/views/Cards.js`.
4. Normalize token field naming across auth flows.
5. Decide on `/products` auth and align API call behavior.

**Security Hardening Steps**

- Add CSP and avoid unsafe HTML rendering.
- Move tokens to secure cookies if backend supports it.
- Add token refresh and expiration handling.

**Refactoring Suggestions**

- Introduce a centralized auth context for token and role state.
- Add API response validation with zod or io-ts.
- Add error boundaries at layout level.

---

**15. Exploit Chain Example**

1. Attacker injects a script (XSS or malicious extension).
2. Script reads `sessionStorage.getItem("@admintoken")`.
3. Token is exfiltrated to attacker server.
4. Attacker reuses token via API client.
5. Calls admin APIs (issue card, close account).
6. Extracts card data (full number + CVC) from UI.

Result: Account takeover and financial compromise.

---

If you want, I can implement the highest priority fixes and then update this report to reflect resolved items.
