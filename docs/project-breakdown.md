# Ecospend Frontend Project Breakdown

This breakdown is based on the current frontend code in this repo. It focuses on what is implemented in the React UI, how it talks to the backend API, and where gaps exist. File references are included so you can jump directly to the implementation.

**Features**

**Client (User) Features**

- Account creation (register) and login are implemented in `src/layouts/nonauth/SignIn.js` and wired to API calls in `src/helpers/ApiManager.tsx`.
- Auth-protected app shell, sidebar, and navbar are implemented in `src/layouts/auth/Auth.js`, `src/layouts/AuthProtected.js`, and `src/components/sidebar/Sidebar.js`.
- Dashboard with balance + account number is implemented in `src/views/Dashboard.js` using `ApiManager.UserInfo`.
- Personal profile viewing and updating email/password are implemented in `src/views/PersonalInfo.js`.
- Beneficiary management (list, add, edit, delete) is implemented in `src/views/Beneficiary.js` and the modals in `src/components/beneficiary/*`.
- Transfers to a beneficiary are implemented in `src/views/Transfer.js` using `ApiManager.TransferToBeneficiary`.
- Account statement generation is implemented in `src/views/Statement.js` via `ApiManager.GetStatement`.
- Cards list view is implemented in `src/views/Cards.js`.
- Ticket creation and list view are implemented in `src/views/Tickets.js` and `src/components/ticket/AddNewTicket.js`.
- Discounted product purchase UI is implemented in `src/layouts/nonauth/Products.js` using `ApiManager.BuyCompanyProduct`.

**Admin Features**

- Admin login is implemented in `src/layouts/nonauth/AdminSignIn.js` and wired to `ApiManager.AdminSignIn`.
- Admin dashboard with ticket list + resolve flow is implemented in `src/views/admin/AdminDashboard.js` and `src/components/admin/ResolveTicket.js`.
- Admin user list and user account details are implemented in `src/views/admin/AdminUserList.js`.
- Issue new cards and block cards are implemented in `src/components/admin/IssueCardModal.js` and `src/components/admin/BlockCardModal.js`.
- Close account is implemented in `src/components/admin/CloseAccountModal.js`.
- Add money (admin) is implemented in `src/components/admin/AddMoneyModal.js`.

**Feature Status (Working vs Partial vs Missing)**

**Fully Working (UI + API wired, no obvious blocking issues found in code)**

- User authentication (login, register) `src/layouts/nonauth/SignIn.js`
- Auth-protected routing `src/layouts/AuthProtected.js` + `src/layouts/auth/Auth.js`
- Dashboard summary `src/views/Dashboard.js`
- Personal info viewing + update email/password `src/views/PersonalInfo.js`
- Beneficiary CRUD `src/views/Beneficiary.js` + `src/components/beneficiary/*`
- Transfers to beneficiary `src/views/Transfer.js`
- Statements with date filters `src/views/Statement.js`
- Ticket creation + list `src/views/Tickets.js` + `src/components/ticket/AddNewTicket.js`
- Admin ticket handling `src/views/admin/AdminDashboard.js` + `src/components/admin/ResolveTicket.js`
- Admin user list + account actions `src/views/admin/AdminUserList.js`
- Admin issue card, block card, close account, add money `src/components/admin/*`

**Partially Working (UI exists but has gaps or likely runtime issues)**

- User cards list `src/views/Cards.js`
The data fetch only runs if `logData === null`, but the state initializes to `[]`, so the fetch never runs. This likely prevents cards from loading at all.
- Product purchase `src/layouts/nonauth/Products.js`
The route is public (`/products` in `src/index.js`) but the API wrapper sends auth by default. If the backend requires auth, the screen is accessible without login yet calls need a token. This is likely a functional gap.
- Admin auth redirect `src/layouts/AdminAuthProtected.js`
If admin token is missing, it redirects to `/auth` (user login) instead of `/admin-auth`. This can confuse admin flow and is likely a UX bug.

**Not Yet Implemented (API stub exists but no UI wired)**

- Admin change account plan exists only in `src/helpers/ApiManager.tsx` as `AdminChangeAccountPlan` but is not used anywhere in UI.

**Level of Implementation**

- Estimated overall completion of frontend: **~70%**
Rationale: Most major UI flows (user + admin) exist and are wired to API calls, but there are still missing or broken pieces (cards list bug, plan change UI, product auth mismatch) and there is no evidence of tests or error boundary handling.

**What’s Missing or Incomplete**

- User cards list fetch logic bug in `src/views/Cards.js`.
- Admin change account plan UI not implemented despite API support in `src/helpers/ApiManager.tsx`.
- Product purchase flow likely needs auth gating or explicit public-mode handling in `src/layouts/nonauth/Products.js`.
- No automated tests visible in the repo (no `__tests__`, no test scripts referenced in `README.md` or `package.json`).
- No dedicated error boundary or global API error handling beyond toast notifications.

**Technical Implementation**

**Architecture and Frameworks**

- React (functional components + hooks) is used across the app (`src/index.js`, `src/views/*`, `src/components/*`).
- React Router v6 handles routing (`src/index.js`, `src/layouts/auth/Auth.js`, `src/layouts/auth/AdminAuth.js`).
- Reactstrap provides UI components (`Card`, `Table`, `Row`, `Col`, etc.) across all views.
- Black Dashboard React theme drives global styling (`src/assets/scss/black-dashboard-react.scss`).
- Formik + Yup provide form state management and validation in modals and auth screens.
- React Toastify shows success/error toasts in most API flows.
- Context API is used for theme and background color handling (`src/contexts/ThemeContext.js`, `src/contexts/BackgroundColorContext.js`).

**API Layer**

- All API calls go through a single helper `CreateFetch` in `src/helpers/ApiManager.tsx`.
- `CreateFetch` builds request headers, injects `Authorization: Bearer <token>` when `@token` exists in `sessionStorage`, and handles error toasts.
- The base API URL is read from `process.env.REACT_APP_BACKEND`, configured in `docker-compose.yml`.

**Design Patterns Used**

- Centralized API helper pattern (`ApiManager`), with small per-feature functions that return JSON.
- “Layout shells” separate auth-protected and unauthenticated pages (`src/layouts/auth/*`, `src/layouts/nonauth/*`).
- Modal-driven CRUD interactions for beneficiaries and admin actions.
- Context wrappers for UI theming and background colors.

**How Components Interact**

- Routes define which view loads under `/main/*` or `/admin/*` (`src/routes.js`).
- `AuthProtected` and `AdminAuthProtected` gate access using tokens stored in `sessionStorage`.
- Views call `ApiManager` functions and update local component state.
- Modals expose open/close functions using `ModalRef.current = (open, data) => { ... }`, so a parent view can trigger them without global state.
- Sidebar uses `sessionStorage` to switch between admin and user menu items (`src/components/sidebar/Sidebar.js`).

**Code-Level Explanation**

**Key Modules and Functions**

- `src/helpers/ApiManager.tsx`
Central API wrapper and feature-specific API functions.
- `src/layouts/auth/Auth.js` and `src/layouts/auth/AdminAuth.js`
Authenticated shells for user and admin.
- `src/layouts/nonauth/SignIn.js`
Combined login/register view with Formik/Yup validation.
- `src/views/Dashboard.js`
Loads user info and renders balance and quick links.
- `src/views/Beneficiary.js` + `src/components/beneficiary/*`
Full beneficiary CRUD.
- `src/views/Transfer.js`
Select beneficiary + submit transfer amount.
- `src/views/Statement.js`
Date filter + statement list + totals.
- `src/views/Tickets.js` + `src/components/ticket/AddNewTicket.js`
User ticket list + create ticket.
- `src/views/admin/AdminDashboard.js` + `src/components/admin/ResolveTicket.js`
Admin ticket list + resolve.
- `src/views/admin/AdminUserList.js` + `src/components/admin/*`
Admin user account management and card actions.

**Data Flow (Example: Beneficiary CRUD)**

1. `src/views/Beneficiary.js` loads beneficiary list via `ApiManager.BeneficiaryList` on mount.
2. User opens a modal (add/edit/delete) through a ref stored in the parent.
3. Modal calls `ApiManager.AddBeneficiary`, `EditBeneficiary`, or `DeleteBeneficiary`.
4. On success, the modal triggers `Reset()` which sets parent state to `null`, causing a refetch.

**Data Flow (Example: Transfer)**

1. `src/views/Transfer.js` loads beneficiaries list.
2. User selects a beneficiary and enters amount.
3. `ApiManager.TransferToBeneficiary` posts transfer.
4. On success, UI resets to list view and refetches data.

**Data Flow (Example: Admin Resolve Ticket)**

1. `src/views/admin/AdminDashboard.js` loads open tickets via `ApiManager.AdminTicketList`.
2. Admin opens modal from a ticket row.
3. Modal submits reply via `ApiManager.AdminResolveTicket`.
4. On success, parent resets and refetches list.

**Summary**

- This is a React frontend for a digital banking app, using React Router for navigation, Reactstrap for UI, and a centralized API manager for all backend calls.
- User flows (auth, dashboard, beneficiaries, transfers, statements, tickets) are mostly built and wired to backend endpoints.
- Admin flows (ticket handling, user management, card issuance, account actions) are also implemented.
- The main gaps are a cards list fetch bug, a missing UI for account plan changes, and potential auth mismatch on the products route.

**Current Status and Next Steps**

1. Fix the cards list fetch condition in `src/views/Cards.js` so the API call runs.
2. Decide whether `/products` should be public or authenticated, and align UI + API behavior in `src/layouts/nonauth/Products.js`.
3. Implement “Change Account Plan” UI wired to `ApiManager.AdminChangeAccountPlan` in `src/views/admin/AdminUserList.js` (or a new admin view).
4. Add basic frontend tests for key flows (auth, beneficiary CRUD, transfer). If tests are out of scope, document expected manual test steps.

