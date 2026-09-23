# BNC Security & Functionality Audit Report

**Application:** Bharat National Computers (BNC)
**Components:** NestJS + Prisma/PostgreSQL backend, React/Vite storefront (`frontend/`), React/Vite admin (`admin/`)
**Audit date:** 2026-09-23
**Testing method:** Static source review + non-destructive live probing against the running backend (`http://localhost:3000`) and a headless-Chrome render of every storefront route (`http://localhost:5173`).
**Scope note:** No writes, deletes, credential guessing or destructive tests were performed. No secrets, tokens, passwords or keys appear in this document.

---

## 1. Methodology and what "verified" means

Three evidence levels are used throughout. They are not interchangeable, and each finding says which applies.

| Level | Meaning |
|---|---|
| **LIVE** | Observed directly against the running system (HTTP status, response header, rendered DOM). |
| **CODE** | Established by reading the implementation end to end (route → guard → controller → service → Prisma → response). |
| **NOT VERIFIED** | Requires an authenticated session, a write, or third-party infrastructure that this audit deliberately did not exercise. |

No numeric security score is given. A single number would imply a calibrated scoring model that was not applied here; the severity ratings below follow CVSS-style qualitative bands (Critical / High / Medium / Low / Informational) based on impact and exploitability **in this codebase's actual configuration**.

---

## 2. Runtime error — FIXED

### The reported error

```
Uncaught SyntaxError: The requested module '/src/components/Breadcrumb.jsx'
does not provide an export named 'default' (at CategoryProductPage.jsx:9:8)
```

### Root cause

`frontend/src/components/Breadcrumb.jsx` **did** export a default, and all three importers used a correct default import. The error was **not** an import/export mismatch.

The running Vite dev server (PID 23484) was started at **13:37:44**, while the file was in a syntactically broken state — an earlier automated cleanup pass had emptied a JSX conditional, leaving:

```jsx
{bgColor && (
)}          // ERROR: Unexpected ")"
```

The file was repaired at **13:45**. When esbuild fails to transform a module, Vite caches an **error module** — a module that loads but exposes no exports. The browser therefore reported the symptom ("no default export") rather than the cause (a syntax error), and the stale server kept serving that cached error module after the source was fixed.

This is the same class of failure recorded earlier in this project, where `pkill -f vite` silently fails on Windows and leaves orphaned dev servers serving stale module graphs.

### Fix applied

1. Stopped the stale Vite processes (PIDs 23484, 21052) using PowerShell `Stop-Process` — `pkill` does not work on this platform.
2. Deleted `frontend/node_modules/.vite` (the dependency/transform cache).
3. Restarted Vite on a clean cache with `--strictPort --port 5173`.

**No source file was modified to fix this error.** `Breadcrumb.jsx` was already correct on disk.

### Verification that no similar mismatch exists anywhere

A static checker was run across all **43** frontend source files. For each file it (a) ran the same esbuild transform Vite uses, and (b) resolved every local import and checked each imported binding against the target module's actual declared exports.

```
FILES SCANNED: 43
=== TRANSFORM (SYNTAX) ERRORS ===      none
=== IMPORT/EXPORT MISMATCHES ===       none
=== UNRESOLVED LOCAL IMPORTS ===       none
```

---

## 3. Browser route verification — LIVE

Every declared route was rendered in **headless Chrome** with a 9-second virtual time budget, then the post-JavaScript DOM was dumped and Chrome's stderr scanned for uncaught errors (`Uncaught SyntaxError`, `does not provide an export named`, `Uncaught TypeError`, `Uncaught ReferenceError`, `Cannot read propert…`, `Minified React error`, and others).

A route that throws a module or render error leaves `#root` empty — which is exactly the failure mode reported. All 14 routes mounted and rendered content.

| Route | Component | Result | Rendered DOM |
|---|---|---|---|
| `/` | Homepage | **OK** | 105,459 b |
| `/products` | ProductsPage | **OK** | 34,251 b |
| `/product/:id` | ProductDetailsPage | **OK** | 32,343 b |
| `/category/:categoryId/products` | CategoryProductsPage | **OK** | 32,296 b |
| `/services` | ServicesPage | **OK** | 92,798 b |
| `/about` | AboutPage | **OK** | 65,084 b |
| `/contact` | ContactPage | **OK** | 45,056 b |
| `/cart` | CartPage | **OK** | 31,000 b |
| `/checkout` | CheckoutPage | **OK** | 35,192 b |
| `/login` | LoginPage | **OK** | 36,646 b |
| `/signup` | SignupPage | **OK** | 37,224 b |
| `/orders` | MyOrdersPage | **OK** | 33,302 b |
| `/orders/:id` | OrderDetailsPage | **OK** | 32,845 b |
| `*` | NotFoundPage | **OK** | 35,133 b |

```
Routes: 14   Clean: 14   Problem: 0
```

**Zero runtime import/export errors.** Build success was not treated as proof of browser success — the browser was tested separately, and the audit was re-run after the final build to confirm the result still held.

> Note: the database is currently empty (`GET /product` returns `[]`), so catalogue pages render their empty states. That is correct behaviour, not an error.

---

## 4. API / CRUD audit

### 4.1 Authorization model

Three global guards in `backend/src/app.module.ts`, in deliberate order:

1. `ThrottlerGuard` — rate limiting runs first, so a flood is rejected before any database work.
2. `JwtAuthGuard` — **deny by default**. Every route requires a valid JWT unless explicitly marked `@Public()`.
3. `RolesGuard` — role checks last.

Two design decisions materially strengthen this:

- **`JwtStrategy.validate()` re-reads the principal from the database on every request** and takes `role` from the DB row, never from the token claim. A leaked or tampered token cannot carry elevated authority.
- **`RolesGuard` requires `user.type === 'ADMIN'`** for any admin-tier role. A `User` row carrying `role="ADMIN"` (possible for rows predating the signup lockdown) can never satisfy an admin requirement.

### 4.2 Live authorization probes

39 non-destructive probes, **all passed**:

- 8 public endpoints returned `200`.
- 26 protected endpoints returned `401` without a token — including every write (`POST`/`PATCH`/`DELETE`) on orders, products, categories, brands, uploads and both payment routes.
- 4 malformed-ID probes returned `400` (`ParseIntPipe` rejects non-numeric IDs).
- 1 unknown route returned `404`.

### 4.3 CRUD verification matrix

| Module | GET | POST | UPDATE | DELETE | Auth | Role | Validation | DB | Status |
|---|---|---|---|---|---|---|---|---|---|
| **Product** | Public (`/`, `/active`, `/limit`, `/:id`, `/category/:id`) | Admin | Admin `PATCH` | Admin `DELETE` | Global JWT | `ADMIN`,`SUPER_ADMIN` | DTO + `ParseIntPipe` | Prisma | **VERIFIED** (reads LIVE; writes CODE) |
| **Category** | Public (`/`, `/active`, `/:id`) | Admin | Admin `PATCH` | Admin `DELETE` | Global JWT | `ADMIN`,`SUPER_ADMIN` | DTO + `ParseIntPipe` | Prisma | **VERIFIED** (reads LIVE; writes CODE) |
| **Brand** | Public (`/`, `/active`, `/:id`) | Admin | Admin `PATCH` | Admin `DELETE` | Global JWT | `ADMIN`,`SUPER_ADMIN` | DTO + `ParseIntPipe` | Prisma | **VERIFIED** (reads LIVE; writes CODE) |
| **Order** | Owner-scoped `/`, `/:id`, `/last`; admin `/active`,`/valid`,`/stats`,`/status-stats`,`/users/all`,`/all/with-users` | Authenticated | Admin `PATCH` | Admin `DELETE` (soft) | Global JWT | Mixed | `CreateOrderDto`, `ParseIntPipe` | Prisma | **VERIFIED** (rejection LIVE; ownership CODE) |
| **OrderItem** | Admin | Admin | Admin | Admin | Global JWT | Class-level `ADMIN`,`SUPER_ADMIN` | DTO + `ParseIntPipe` | Prisma | **VERIFIED** (CODE; 401 LIVE) |
| **Contact** | Admin `GET` | **Public** `POST` | N/A | N/A | Global JWT / `@Public` on POST | `ADMIN`,`SUPER_ADMIN` on GET | `CreateContactDto` (all fields bounded) | Prisma | **VERIFIED** (both LIVE) |
| **User** | Admin `/stats` only | N/A (via `/auth/signup`) | N/A | N/A | Global JWT | `ADMIN`,`SUPER_ADMIN` | — | Prisma | **PARTIAL** — no user self-service read/update/delete exists |
| **Admin** | N/A | `POST /admin/register` (admin-only) | N/A | N/A | Global JWT | `ADMIN`,`SUPER_ADMIN` | `CreateAdminDto` | Prisma | **PARTIAL** — see **F-04** (`role` accepted then discarded) |
| **Auth** | `GET /auth/me` | `signup`,`login`,`refresh`,`logout`,`logout-all` | N/A | N/A | `@Public` on signup/login/refresh/logout | — | `SignupDto`,`LoginDto` | Prisma | **VERIFIED** (401 LIVE; flows CODE) |
| **Dashboard** | 5 admin GETs | N/A | N/A | N/A | Global JWT | Class-level `ADMIN`,`SUPER_ADMIN` | — | Prisma | **VERIFIED** (CODE; 401 LIVE) |
| **Overview** | 6 admin GETs | N/A | N/A | N/A | Global JWT | Class-level `ADMIN`,`SUPER_ADMIN` | — | Prisma | **VERIFIED** (CODE; 401 LIVE) |
| **Upload** | N/A | `POST /upload/image` | N/A | N/A | Global JWT | `ADMIN`,`SUPER_ADMIN` | MIME + ext allow-list, 5 MB, 1 file | Filesystem | **PARTIAL** — see **F-08** (no magic-byte check) |
| **Payment (Razorpay)** | N/A | `create-order`, `verify` | N/A | N/A | Global JWT + explicit `type==='USER'` | User-only | `CreatePaymentOrderDto`, `VerifyPaymentDto` | Prisma (serializable txn) | **PARTIAL** — logic VERIFIED (CODE); **NOT VERIFIED** live, keys absent (**F-02**) |
| **Webhook** | — | — | — | — | — | — | — | — | **BROKEN / ABSENT** — see **F-01** |
| **Cart** | N/A (client-side `localStorage`) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **N/A** — no server-side cart exists |

### 4.4 Frontend ↔ backend contract

Every path called by the storefront and the admin panel resolves to a real backend route. No call targets a non-existent endpoint.

**Dead / misleading client code (no security impact — the server enforces correctly):**

| Function | File | Issue |
|---|---|---|
| `getContacts()` | `frontend/src/api/Contact.js` | Calls `GET /contact` **with no `Authorization` header** while the route is admin-only. Would always fail. Never called. |
| `getActiveOrders()` | `frontend/src/api/Order.js` | Admin-only endpoint exposed in the storefront bundle. Never called. |
| `updateOrder()`, `deleteOrder()` | `frontend/src/api/Order.js` | Admin-only endpoints exposed in the storefront bundle. Never called. |
| `getOrders()`, `getCategoryById()` | `frontend/src/api/Order.js`, `Category.js` | Unused. |

---

## 5. Security findings

### Severity summary

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 6 |
| Low | 5 |
| Informational | 4 |

---

### F-01 — No Razorpay webhook handler; payment confirmation depends entirely on the browser

| | |
|---|---|
| **Severity** | **High** |
| **Category** | Payment integrity / business logic (OWASP API6:2023 — Unrestricted Access to Sensitive Business Flows) |
| **Affected** | `backend/src/payment/` (no webhook controller), `backend/prisma/schema.prisma:166` (`WebhookEvent` model) |
| **Evidence** | `grep -rn "webhook" backend/src/` → **no route found**. The `WebhookEvent` table (with `@@unique([provider, eventId])` for idempotency) exists but nothing writes to it. The only path that sets `paymentStatus = 'PAID'` is `PaymentService.verifyPayment()`, reached solely from the browser callback in `CheckoutPage.jsx:295`. |
| **Impact** | A customer whose payment succeeds at Razorpay but whose browser closes, crashes or loses connectivity before the verify call completes leaves the order permanently `UNPAID` while the money has been taken. There is no server-to-server reconciliation. This is a revenue-integrity and customer-trust problem, and it also means no out-of-band record exists to reconcile disputes against. |
| **Attack scenario** | Not primarily an attacker scenario — it is a reliability gap. An attacker *can* exploit it for denial of confirmation: complete payment, then block the `/payment/verify` request from their own browser. The money is captured but the order never shows as paid, forcing manual support intervention. Repeated at scale this is a support-desk DoS. |
| **Existing protection** | Verification itself is strong: HMAC-SHA256 signature checked with `timingSafeEqual`, amount re-derived server-side, ownership enforced, idempotent via a conditional `updateMany` guarded on `status IN ('CREATED','PENDING')`. The `WebhookEvent` schema is already in place. |
| **Recommended fix** | Add `POST /payment/webhook` as a `@Public()` route that (1) verifies the `X-Razorpay-Signature` header against `RAZORPAY_WEBHOOK_SECRET` over the **raw request body** (requires `rawBody` — the current global `ValidationPipe`/JSON parse would otherwise invalidate the HMAC), (2) records `eventId` in `WebhookEvent` and drops duplicates via the existing unique constraint, (3) reconciles `payment.captured` / `order.paid` into the same status transition `verifyPayment` performs. `RAZORPAY_WEBHOOK_SECRET` is already declared in `.env.example`. |
| **Status** | **OPEN — findings only.** This was explicitly out of scope in payment integration Phase 1 and is a deliberate known gap, not a regression. Not fixed here: it adds a new public route and new payment logic, which the audit brief excludes. |

---

### F-02 — Razorpay credentials absent; the entire online payment flow is non-functional

| | |
|---|---|
| **Severity** | **High** (functionality); Informational as a vulnerability |
| **Category** | Production configuration / secrets management |
| **Affected** | `backend/.env`, `backend/src/payment/razorpay.client.ts:18-22` |
| **Evidence** | `backend/.env` defines only `DATABASE_URL`, `UPLOAD_URL`, `PORT`, `JWT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. **`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are not set.** (Values were never read or printed — only key presence and length were inspected.) |
| **Impact** | `RazorpayClient.getClient()` lazily calls `requireEnv('RAZORPAY_KEY_ID')`, which throws. `validateRazorpayKeySafety()` returns early when *both* are absent, so **the server starts cleanly and the failure only surfaces at checkout**, where it becomes a generic `500 — Unable to create payment order`. Any customer selecting online payment cannot pay. COD is unaffected. |
| **Attack scenario** | No direct attack. The risk is operational: the failure is silent at boot and only visible to a paying customer at the last step of the funnel. |
| **Existing protection** | `validateRazorpayKeySafety()` enforces that a `rzp_live_` key is used when `NODE_ENV=production` and `rzp_test_` otherwise, and that ID and secret are always set together — so a half-configured or wrong-environment key is rejected at startup. `requireEnv` prevents silent fallback to a hardcoded default. |
| **Recommended fix** | Populate all three Razorpay variables in `backend/.env` (test keys for development). Separately, consider making the Razorpay check fail **at startup** rather than lazily, so a misconfigured deployment is caught at boot instead of at checkout. `frontend/.env` also lacks `VITE_RAZORPAY_KEY_ID`, but this is **harmless** — the client takes `keyId` from the `create-order` response (`CheckoutPage.jsx:273`), which is the correct design. |
| **Status** | **OPEN — findings only.** Not fixed: writing live payment credentials is the owner's action, and the brief forbids changing payment configuration. |

---

### F-03 — User login discloses whether a mobile number is registered

| | |
|---|---|
| **Severity** | Medium |
| **Category** | OWASP A07:2021 — Identification and Authentication Failures / user enumeration |
| **Affected** | `backend/src/auth/auth.service.ts:80-95` |
| **Evidence** | Three distinct failure messages: `'User not found with this mobile number'` (no such user), `'Password not set for this user'`, `'Invalid password'` (user exists, wrong password). Additionally `bcrypt.compare()` runs **only when the user exists**, producing a measurable timing difference (~50–100 ms) even if the messages were unified. |
| **Impact** | An attacker can determine which mobile numbers hold BNC accounts. Indian mobile numbers are a small, densely-populated, enumerable keyspace. A confirmed list supports targeted phishing, credential stuffing against reused passwords, and SIM-swap target selection. |
| **Attack scenario** | Attacker iterates candidate 10-digit numbers against `POST /auth/login` with an arbitrary password. `'User not found…'` means unregistered; `'Invalid password'` means a real customer. At the long-window limit of 20 attempts / 15 min per IP, that is ~1,920 numbers/day from one IP — trivially parallelised across a proxy pool. |
| **Existing protection** | `LOGIN_THROTTLE` (5/min, 20/15min per IP). Deliberately lenient because CGNAT is widespread on Indian mobile networks — a documented, reasonable trade-off, but it does not stop distributed enumeration. |
| **Recommended fix** | Return one generic message — `'Invalid mobile number or password'` — for all three branches. To close the timing channel, always execute a bcrypt comparison: when no user is found, compare against a fixed dummy hash. **`AdminService.login()` already does the message part correctly** (`'Invalid email or password'` for both branches) and is the pattern to copy. |
| **Status** | **OPEN — findings only.** Not fixed: the brief prohibits changing authentication logic without a confirmed runtime error. |

---

### F-04 — `CreateAdminDto.role` is validated then silently discarded

| | |
|---|---|
| **Severity** | Medium |
| **Category** | OWASP A04:2021 — Insecure Design / API contract mismatch |
| **Affected** | `backend/src/admin/dto/create-admin.dto.ts:36-43`, `backend/src/admin/admin.service.ts:32-54` |
| **Evidence** | The DTO declares `role?: string` with `@IsIn(['ADMIN','SUPER_ADMIN'])`. `register()` destructures `const { email, password, isActive } = createAdminDto;` — **`role` is never read** and never written to `prisma.admin.create()`. `schema.prisma:14` sets `role String @default("ADMIN")`. |
| **Impact** | **Fails safe** — this is *not* a privilege-escalation path; a caller cannot obtain `SUPER_ADMIN` by supplying it. The real consequences are: (a) a `SUPER_ADMIN` account can never be created through the API, so any authorization logic depending on that tier is unreachable, and (b) the API and its Swagger documentation advertise a role parameter that silently does nothing, which is exactly the kind of mismatch that produces a genuine escalation bug the next time someone "fixes" it by wiring the field straight through. |
| **Attack scenario** | No direct exploit today. The latent risk: a developer notices the parameter is ignored and connects it to `prisma.admin.create()` without adding a `SUPER_ADMIN`-only check — at which point any `ADMIN` can self-promote to `SUPER_ADMIN`, since `POST /admin/register` permits both roles. |
| **Existing protection** | `@Roles('ADMIN','SUPER_ADMIN')` on the route, `ADMIN_REGISTER_THROTTLE` (3/min, 5/hour), and the hard `@default("ADMIN")` in the schema. |
| **Recommended fix** | Decide the intent explicitly. Either remove `role` from `CreateAdminDto` (documents the real behaviour), or honour it **only when the requester is `SUPER_ADMIN`** — never allowing an `ADMIN` to mint a `SUPER_ADMIN`. Do not wire it through unconditionally. |
| **Status** | **OPEN — findings only.** Not fixed: touching admin role assignment is authorization logic, which the brief excludes. |

---

### F-05 — Access token stored in `localStorage` (XSS-exfiltratable)

| | |
|---|---|
| **Severity** | Medium |
| **Category** | OWASP A07:2021 — session management |
| **Affected** | `frontend/src/api/http.js:5-30`, `admin/src/api/http.js` |
| **Evidence** | `localStorage.setItem("authToken", accessToken)` and `localStorage.getItem(ACCESS_TOKEN_KEY)`. Any script running on the origin can read it. |
| **Impact** | A single XSS anywhere on the storefront or admin origin yields the bearer token. In the admin panel that is a full back-office takeover. |
| **Attack scenario** | Attacker achieves script execution on the origin (via a vulnerable dependency, a compromised CDN asset, or a future `dangerouslySetInnerHTML`), reads `localStorage.authToken`, and exfiltrates it. The token is valid for 15 minutes and carries the victim's full authority. |
| **Existing protection** | Substantial, and this is why the rating is Medium rather than High: the **refresh** token is in an `HttpOnly`, `SameSite`-scoped, path-scoped cookie and is *not* reachable from JavaScript — so a stolen access token expires in 15 minutes and cannot be renewed by the attacker. **No XSS sink exists today**: `grep` for `dangerouslySetInnerHTML`, `innerHTML =` and `eval(` across `frontend/src` and `admin/src` returns nothing, and every `target="_blank"` carries `rel="noopener noreferrer"`. Refresh tokens are SHA-256 hashed at rest with single-use rotation and family revocation on reuse. |
| **Recommended fix** | Accept as a documented trade-off, or move the access token to memory only (a module-scope variable), relying on the existing HttpOnly refresh cookie to restore the session on reload. The single-flight refresh in `http.js` already makes this practical. Pair with **F-06** (add a CSP to the SPA origins) to reduce the chance of the XSS precondition. |
| **Status** | **OPEN — findings only.** |

---

### F-06 — No Content-Security-Policy on either SPA origin

| | |
|---|---|
| **Severity** | Medium |
| **Category** | OWASP A05:2021 — Security Misconfiguration |
| **Affected** | `frontend/index.html`, `admin/index.html` |
| **Evidence** | Neither file contains a CSP `<meta>` tag. Helmet sets a strong CSP (`default-src 'self'; object-src 'none'; script-src 'self'; frame-ancestors 'self'; …`) **on API responses from :3000 only** — that policy governs the API origin and does not protect the pages served from :5173 / the static host. |
| **Impact** | The origin holding the `localStorage` access token (**F-05**) has no script-source restriction. Any injected script runs unimpeded, and exfiltration to an arbitrary host is unrestricted. |
| **Attack scenario** | An attacker who achieves injection on the SPA origin faces no CSP: they can load remote script, read `localStorage`, and POST the token anywhere. A `connect-src`/`script-src` policy would block most of that chain. |
| **Existing protection** | React escapes interpolated values by default and no `dangerouslySetInnerHTML` exists anywhere, so there is no known injection point today. API responses carry full Helmet headers including `nosniff`. |
| **Recommended fix** | Add a CSP at the static host or reverse proxy serving the built SPAs. It must permit `https://checkout.razorpay.com` in `script-src` and `frame-src` (Razorpay Checkout is loaded at `CheckoutPage.jsx:35`), the API origin in `connect-src`, and `https://fonts.googleapis.com` / `https://fonts.gstatic.com` if webfonts are used. A `<meta http-equiv>` tag is a workable fallback but cannot express `frame-ancestors`. |
| **Status** | **OPEN — findings only.** |

---

### F-07 — Weak password policy (6-character minimum, no complexity requirement)

| | |
|---|---|
| **Severity** | Medium |
| **Category** | OWASP A07:2021 / ASVS V2.1 |
| **Affected** | `backend/src/auth/dto/signup.dto.ts:18`, `backend/src/admin/dto/create-admin.dto.ts:30` |
| **Evidence** | Users: `@Length(6, 20)`. Admins: `@MinLength(6)`. No complexity, no breached-password check. ASVS L1 (V2.1.1) requires a **12-character minimum** for user-chosen passwords; 6 is well below it. |
| **Impact** | `123456`, `qwerty` and `abc123` are all accepted — including for **admin** accounts, which hold full back-office authority. |
| **Attack scenario** | Credential stuffing or targeted guessing against `POST /auth/login` or `POST /admin/login`. F-03's enumeration weakness lets an attacker first confirm which numbers are real, then concentrate guesses on them. |
| **Existing protection** | bcrypt with cost factor 10 at rest. `ADMIN_LOGIN_THROTTLE` is genuinely tight (5/min **and** 5/15min per IP), which meaningfully constrains online guessing against the admin surface. `LOGIN_THROTTLE` is looser by design (CGNAT). |
| **Recommended fix** | Raise the minimum to 12 for users and higher for admins, and **remove the 20-character maximum** (bcrypt accepts 72 bytes; capping at 20 blocks passphrases and password managers for no security benefit). Optionally screen against a breached-password list. |
| **Status** | **OPEN — findings only.** Not fixed: changing the minimum would invalidate existing accounts and requires a migration plan. |

---

### F-08 — Image upload trusts the client-declared MIME type; no magic-byte validation

| | |
|---|---|
| **Severity** | Medium |
| **Category** | OWASP A04:2021 / unrestricted file upload |
| **Affected** | `backend/src/upload/upload.controller.ts:59-73` |
| **Evidence** | `fileFilter` checks `file.mimetype` — supplied by the client in the multipart `Content-Type` header and trivially forged — plus the filename extension. File **content** is never inspected. |
| **Impact** | An attacker with admin credentials can store a polyglot file (valid JPEG magic bytes followed by arbitrary payload) under an `.jpg` name. |
| **Attack scenario** | Requires an already-compromised admin account, which bounds the severity. The stored file is served from `/uploads` as a static asset. Practical exploitation would need a downstream consumer that parses the file unsafely, or a future change that serves the directory with content sniffing or script execution enabled. |
| **Existing protection** | Genuinely strong defence-in-depth, which is why this is Medium and not High: **admin-only** (`@Roles`); **SVG deliberately excluded** with a comment explaining the stored-XSS reasoning; filenames are **cryptographically random** (`randomBytes(16).toString('hex')`) with the extension taken from the allow-list, eliminating path traversal and extension smuggling; 5 MB / 1 file limits; static serving uses `index: false`, `dotfiles: 'deny'`, `redirect: false`; and `X-Content-Type-Options: nosniff` is present on responses (confirmed LIVE). |
| **Recommended fix** | Validate the magic bytes of the received file against the declared type before accepting it, and reject on mismatch. Re-encoding uploads through an image processor would also strip any appended payload — but that adds a dependency, which the brief excludes. |
| **Status** | **OPEN — findings only.** |

---

### F-09 — Known vulnerabilities in production dependencies

| | |
|---|---|
| **Severity** | Medium |
| **Category** | OWASP A06:2021 — Vulnerable and Outdated Components |
| **Affected** | `backend/package.json`, `frontend/package.json`, `admin/package.json` |
| **Evidence** | `npm audit --omit=dev`: **backend — 13 (8 high, 4 moderate, 1 low)**; **frontend — 4 (2 high, 2 moderate)**; **admin — 4 (2 high, 2 moderate)**. Backend high-severity packages: `@nestjs/core` (injection), `@nestjs/platform-express`, `@nestjs/swagger`, `js-yaml` (quadratic DoS), `lodash` (`_.template` code injection), `multer` (DoS via incomplete cleanup), `nodemailer` (SMTP command injection via `envelope.size`), `path-to-regexp` (ReDoS). Frontend/admin: all 4 are `react-router` / `react-router-dom` ≤ 7.11.0. |
| **Impact** | Varies. `multer` and `path-to-regexp` are reachable — the app accepts uploads and uses parameterised routes — so DoS is plausible. `nodemailer` SMTP injection is **not** reachable: `MailService` never sets `envelope.size`. Most `react-router` advisories (SSR hydration, single-fetch, `__manifest`, `ScrollRestoration` SSR XSS, Server Action CSRF) apply to **framework/SSR mode**; this app uses `BrowserRouter` client-side only with no loaders, actions or SSR, so real exposure is limited to the open-redirect items. |
| **Attack scenario** | Most credible: unauthenticated ReDoS against `path-to-regexp` via crafted paths, or resource exhaustion via `multer`'s incomplete cleanup on aborted uploads — though the latter is admin-gated. |
| **Existing protection** | Rate limiting on every route (100/min short, 1000/15min long) blunts DoS. Upload is admin-only. No SSR in either SPA. |
| **Recommended fix** | Run `npm audit fix` in all three packages and re-test — `npm audit` reports non-breaking fixes are available for the frontend and admin React Router issues and for the backend `path-to-regexp`/`qs` items. Review the `@nestjs/*` majors separately, as those may be breaking. |
| **Status** | **OPEN — findings only.** Not fixed: the brief prohibits adding or changing packages without cause, and upgrades need a full regression test. |

---

### F-10 — Public contact form triggers outbound email to an attacker-chosen address

| | |
|---|---|
| **Severity** | Low |
| **Category** | OWASP API4:2023 — Unrestricted Resource Consumption / mail abuse |
| **Affected** | `backend/src/contact/contact.service.ts:34-41`, `backend/src/contact/contact.controller.ts:16-19` |
| **Evidence** | `POST /contact` is `@Public()`. `ContactService.create()` calls `mailService.sendContactAckToUser({ to: dto.email, … })` — the recipient is taken straight from the unauthenticated request body. |
| **Impact** | The business's SMTP account can be induced to send mail to arbitrary addresses. At volume this risks sender-reputation damage and SMTP-provider rate limiting or suspension. |
| **Attack scenario** | Attacker submits the form repeatedly with victim addresses, using BNC's domain as an unwitting relay for nuisance mail. Content is a fixed branded acknowledgement, so this is low-value for phishing. |
| **Existing protection** | Strong for the severity: `CONTACT_THROTTLE` is the tightest limit in the app (**2/min and 3/hour per IP**). All interpolated values pass through `MailService.esc()`, so no HTML injection into the template (verified at `mail.service.ts:178-182`). The DTO bounds every field (`name` ≤120, `phone` ≤20, `email` ≤150 + `@IsEmail`, `interestedIn` ≤80, `message` ≤1000). Mail failure is caught and never turns a saved enquiry into a 500. |
| **Recommended fix** | Acceptable as-is given the 3/hour cap. If abuse appears, send the acknowledgement only after a verification step, or send the notification to the business inbox only. |
| **Status** | **OPEN — findings only.** |

---

### F-11 — `SignupDto` permits a non-numeric "mobile number" and an unbounded name

| | |
|---|---|
| **Severity** | Low |
| **Category** | OWASP A03:2021 — Injection (input validation) |
| **Affected** | `backend/src/auth/dto/signup.dto.ts:9-20` |
| **Evidence** | `mobilenumber` is `@IsString() @Length(10, 10)` — length only, no digit check, so `"abcdefghij"` is accepted. `name` is `@IsString()` with **no `@IsNotEmpty()` and no `@MaxLength()`**. |
| **Impact** | Junk identifiers enter the `User` table on a `@unique` column, and an unbounded `name` allows large values to be persisted, wasting storage and potentially breaking downstream display and email templates. |
| **Attack scenario** | Automated signup with non-numeric identifiers pollutes the user table and consumes the unique keyspace; oversized names bloat rows. `SIGNUP_THROTTLE` (3/min, 5/hour per IP) limits the rate substantially. |
| **Existing protection** | `whitelist: true` on the global `ValidationPipe` strips undeclared properties (prevents mass assignment). `role` is deliberately absent from the DTO and hardcoded to `'USER'` server-side. `SIGNUP_THROTTLE`. Prisma parameterises all values. |
| **Recommended fix** | Add `@Matches(/^[0-9]{10}$/)` to `mobilenumber`, and `@IsNotEmpty() @MaxLength(120)` to `name` — matching the discipline already applied in `CreateContactDto`. |
| **Status** | **OPEN — findings only.** |

---

### F-12 — No client-side route guards on authenticated pages

| | |
|---|---|
| **Severity** | Low |
| **Category** | Access control (UX layer) |
| **Affected** | `frontend/src/App.jsx:100-115` |
| **Evidence** | `/orders`, `/orders/:id` and `/checkout` are plain `<Route>` entries with no auth wrapper. `isAuthenticated()` is checked only in `ProductCard.jsx:51` and `ProductDetailsPage.jsx:85,124` (add-to-cart paths). |
| **Impact** | **No data exposure.** An unauthenticated visitor reaching `/orders` renders the page shell; the API call returns `401`, `handleUnauthorized()` clears the session and dispatches `auth:logout`. The server is the enforcement point and it holds (confirmed LIVE: `GET /order` → `401`). The issue is purely that users see an empty/erroring page instead of a redirect to login. |
| **Attack scenario** | None. Listed for completeness because client-side guards are commonly mistaken for a control — here the real control is correctly server-side. |
| **Existing protection** | Global `JwtAuthGuard`; `apiFetch` refresh-and-replay; `handleUnauthorized` session teardown. |
| **Recommended fix** | Wrap the three routes in a `<RequireAuth>` that redirects to `/login` with a return path. This is a UX improvement, not a security fix. |
| **Status** | **OPEN — findings only.** Not fixed: adding route guards changes routing behaviour, which the brief excludes. |

---

### F-13 — Orders can be placed for inactive products

| | |
|---|---|
| **Severity** | Low |
| **Category** | Business logic |
| **Affected** | `backend/src/order/order.service.ts:69-75` |
| **Evidence** | `create()` fetches products with `where: { id: { in: productIds } }` and never filters on `isActive`. The `Product` model has an `isActive` flag used by `GET /product/active`. |
| **Impact** | A product withdrawn from sale can still be ordered by anyone who knows or retains its ID — for example from a stale cart in `localStorage`, or by posting the ID directly. |
| **Attack scenario** | Not adversarial in most cases: a customer with an old cart orders a discontinued item, creating a fulfilment problem. A deliberate actor could order withdrawn stock at its last-known price. |
| **Existing protection** | **Pricing is safe** — `unitPrice` and `totalAmount` are always recomputed from the database `product.price`, never taken from the request (`order.service.ts:79-90`). This is the important control and it is correct. Product existence is verified (`products.length !== productIds.length` → 400). |
| **Recommended fix** | Add `isActive: true` to the `findMany` filter so inactive products fail the existing count check. **Deliberately not applied** — this changes order-creation business logic, which the brief excludes. |
| **Status** | **OPEN — findings only.** |

---

### F-14 — Swagger UI exposes the full route surface

| | |
|---|---|
| **Severity** | Informational |
| **Category** | Information disclosure |
| **Affected** | `backend/src/main.ts:160-176` |
| **Evidence** | `GET /api-docs` → `200` (LIVE). `NODE_ENV` is not set in `backend/.env`, so `isProduction()` is `false` and Swagger is enabled. |
| **Impact** | None in development. In production it would publish every route, DTO shape and auth requirement. |
| **Existing protection** | **Correctly handled by design** — `swaggerEnabled = !isProduction() \|\| SWAGGER_ENABLED === 'true'`, so Swagger switches off automatically under `NODE_ENV=production` unless explicitly re-enabled. Swagger's relaxed CSP is also scoped to the `/api-docs` path only, not applied globally. |
| **Recommended fix** | None. Ensure `NODE_ENV=production` is set in the production environment and `SWAGGER_ENABLED` is left unset. |
| **Status** | **ACCEPTED — working as designed.** |

---

### F-15 — Production environment variables unset (defaults in force)

| | |
|---|---|
| **Severity** | Informational (would be **High** if deployed as-is) |
| **Category** | Production configuration |
| **Affected** | `backend/.env` |
| **Evidence** | Unset: `NODE_ENV`, `CORS_ORIGINS`, `COOKIE_SAMESITE`, `TRUST_PROXY`, `SWAGGER_ENABLED`, `REFRESH_TOKEN_TTL_DAYS`, `REFRESH_ABSOLUTE_TTL_DAYS`. Consequences today: `secure: false` on refresh cookies (`isProduction()` false), CORS falls back to the localhost dev allow-list, `trust proxy` off, Swagger on, refresh TTLs at their 7-day defaults. |
| **Impact** | All correct for local development. If this `.env` reached production, refresh cookies would be sent over plain HTTP and CORS would allow localhost origins. |
| **Attack scenario** | Only on a misconfigured deployment. |
| **Existing protection** | The design is deliberately fail-safe and well documented in `config/env.ts` and `main.ts`: `CORS_ORIGINS` unset in production returns **`[]` and logs an error** (fail closed, not fail open); `TRUST_PROXY` is **opt-in** with an explicit comment on both failure modes (shared rate-limit bucket vs. spoofable `X-Forwarded-For`); `COOKIE_SAMESITE` defaults to `'strict'`; `JWT_SECRET` is `requireEnv`-gated at startup and is 64 characters. |
| **Recommended fix** | Maintain a separate production `.env` setting `NODE_ENV=production`, explicit `CORS_ORIGINS`, and `TRUST_PROXY` matched to the actual proxy hop count. Confirm the production topology before choosing `COOKIE_SAMESITE` — if the API lands on a different registrable domain than the SPAs, it must become `'none'` (requiring HTTPS) **and CSRF protection must be added first**, as `config/env.ts:60-70` already warns. |
| **Status** | **OPEN — deployment checklist item.** |

---

### F-16 — Two different bcrypt libraries in use

| | |
|---|---|
| **Severity** | Informational |
| **Category** | Maintainability |
| **Affected** | `backend/src/auth/auth.service.ts:10` (`bcrypt`), `backend/src/admin/admin.service.ts:9` (`bcryptjs`) |
| **Evidence** | User auth imports `bcrypt` (native); admin auth imports `bcryptjs` (pure JS). Both use cost factor 10 and produce compatible hashes. |
| **Impact** | None cryptographically. Two dependencies for one job, doubling the surface to patch and inviting drift in cost factor. |
| **Recommended fix** | Standardise on one (`bcrypt` is faster; `bcryptjs` avoids native build steps) and drop the other. |
| **Status** | **OPEN — findings only.** |

---

### F-17 — Dead OTP columns in the `User` schema

| | |
|---|---|
| **Severity** | Informational |
| **Category** | Attack surface hygiene |
| **Affected** | `backend/prisma/schema.prisma:58-59` |
| **Evidence** | `User.otp String?` and `User.otpExpiredAt DateTime?` exist. No route, service or DTO reads or writes either field. |
| **Impact** | None today. An unused credential-adjacent column risks being wired up later without rate limiting, expiry enforcement or constant-time comparison. |
| **Existing protection** | `SAFE_USER_SELECT` in `order.service.ts:18-30` explicitly excludes `password`, `otp` and `otpExpiredAt` from every order response — a deliberate, correct precaution. |
| **Recommended fix** | Remove the columns if OTP login is not planned. **Not applied** — the brief prohibits schema changes unless required to fix the confirmed runtime error. |
| **Status** | **OPEN — findings only.** |

---

## 6. Controls verified as CORRECT

These were tested and found sound. They are recorded so a future reviewer does not re-flag them.

| Control | Evidence |
|---|---|
| **Deny-by-default authorization** | Global `JwtAuthGuard`; 26/26 protected endpoints returned `401` without a token (LIVE). |
| **Privilege separation** | `RolesGuard` requires `user.type === 'ADMIN'` for admin roles — a `User` row with `role="ADMIN"` can never pass. |
| **Authority from DB, not token** | `JwtStrategy.validate()` re-reads the principal and its `role` from the database every request; inactive admins are rejected. |
| **Order IDOR protection** | `findAll` and `findLastByUser` ignore any client `userId` for non-admins; `findOneForRequester` throws `ForbiddenException` on a foreign order. |
| **Server-side pricing** | `unitPrice` and `totalAmount` always recomputed from `product.price`; client-supplied amounts are never trusted. |
| **Payment signature verification** | HMAC-SHA256 over `orderId\|paymentId`, compared with `timingSafeEqual` after a length check. |
| **Payment idempotency & race safety** | `SELECT … FOR UPDATE` row lock inside a **Serializable** transaction; verification uses a conditional `updateMany` guarded on `status IN ('CREATED','PENDING')` with `count !== 1` treated as a replay. |
| **Payment ownership** | `payment.order.userId !== requester.userId` → `NotFoundException` (not `Forbidden` — deliberately avoids confirming the order exists). |
| **Refresh token handling** | Opaque 256-bit tokens, SHA-256 hashed at rest, single-use rotation, reuse detection revoking the whole family, absolute TTL ceiling that rotation cannot extend, atomic compare-and-set against concurrent rotation. |
| **Refresh cookie scoping** | `HttpOnly`; `secure` in production; `SameSite` configurable defaulting to `strict`; **separate names and paths** for storefront (`bnc_user_rt` @ `/auth`) and admin (`bnc_admin_rt` @ `/admin`) so a shopper login cannot clobber an admin session on a shared site. |
| **Cross-surface token confusion** | `rotate()` checks `principal.type !== expectedType` — a storefront refresh token cannot be redeemed on the admin endpoint. |
| **SQL injection** | Exactly one raw query in production code (`payment.service.ts:61`), written with a `Prisma.sql` tagged template (parameterised). Everything else uses the Prisma query builder. |
| **Mass assignment** | Global `ValidationPipe({ whitelist: true, transform: true })` strips undeclared properties before they reach Prisma. |
| **XSS sinks** | No `dangerouslySetInnerHTML`, no `innerHTML =`, no `eval()` anywhere in `frontend/src` or `admin/src`. |
| **Reverse-tabnabbing** | All 5 `target="_blank"` links carry `rel="noopener noreferrer"`. |
| **Security headers (LIVE)** | CSP, HSTS (`max-age=31536000; includeSubDomains`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: SAMEORIGIN`, COOP, `X-Permitted-Cross-Domain-Policies: none`. |
| **CORS (LIVE)** | `Origin: http://localhost:5173` → echoed with `Allow-Credentials: true`. `Origin: https://evil.example` → **no CORS headers returned**. Denial is by header omission rather than a 500. |
| **Rate limiting (LIVE)** | `X-RateLimit-*` present on responses; two named throttlers (100/min, 1000/15min) with per-route tightening on login, admin login, signup, contact, refresh, admin register and both payment routes. |
| **Error handling (LIVE)** | `400`/`401`/`404` responses carry structured messages with **no stack traces, file paths or `node_modules` references**. |
| **Path traversal** | Upload filenames are `randomBytes(16)` hex with an allow-listed extension; static serving uses `index: false`, `dotfiles: 'deny'`, `redirect: false`. |
| **SSRF** | No server-side outbound HTTP driven by user input. The only external call is the Razorpay SDK to a fixed endpoint. |
| **Email injection** | All user values pass through `MailService.esc()` before template interpolation. |
| **Secrets in git** | Only `.env.example` files are tracked. No real `.env` appears in the commit history (`git log --all --diff-filter=A`). Root `.gitignore` covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.pfx`. |
| **Startup secret validation** | `requireEnv('JWT_SECRET')` fails fast at boot; `validateRazorpayKeySafety()` enforces live-vs-test key prefix against `NODE_ENV` and rejects a half-configured pair. |

---

## 7. Summary

### Fixed in this session

| # | Issue | Resolution |
|---|---|---|
| 1 | `Uncaught SyntaxError: … does not provide an export named 'default'` on `Breadcrumb.jsx` | Stale Vite dev server (started before the file was repaired) was serving a cached esbuild **error module**. Killed the orphaned processes via PowerShell `Stop-Process`, cleared `node_modules/.vite`, restarted on a clean cache. **No source file changed** — the module's export was already correct. |

### Requiring remediation

| ID | Severity | Finding |
|---|---|---|
| F-01 | **High** | No Razorpay webhook handler; payment confirmation depends entirely on the browser |
| F-02 | **High** | Razorpay credentials absent; online payment flow non-functional |
| F-03 | Medium | User login discloses whether a mobile number is registered |
| F-04 | Medium | `CreateAdminDto.role` validated then silently discarded |
| F-05 | Medium | Access token in `localStorage` (XSS-exfiltratable) |
| F-06 | Medium | No CSP on either SPA origin |
| F-07 | Medium | Weak password policy (6-char minimum) |
| F-08 | Medium | Upload trusts client MIME type; no magic-byte validation |
| F-09 | Medium | Known vulnerabilities in production dependencies |
| F-10 | Low | Public contact form triggers mail to attacker-chosen address |
| F-11 | Low | `SignupDto` permits non-numeric mobile number and unbounded name |
| F-12 | Low | No client-side route guards (server-side enforcement is correct) |
| F-13 | Low | Orders can be placed for inactive products |
| F-16 | Info | Two different bcrypt libraries |
| F-17 | Info | Dead OTP columns in `User` schema |
| F-14 | Info | Swagger exposure — **accepted, working as designed** |
| F-15 | Info | Production env vars unset — deployment checklist item |

### Suggested remediation order

1. **F-02** — populate Razorpay credentials; online checkout is currently broken.
2. **F-01** — implement the signature-verified, idempotent webhook; the `WebhookEvent` table is already waiting for it.
3. **F-09** — run `npm audit fix` on all three packages and regression-test.
4. **F-03**, **F-07** — unify the login failure message (copy the pattern `AdminService.login()` already uses) and raise the password minimum.
5. **F-06**, **F-05** — add a CSP at the static host, then consider moving the access token out of `localStorage`.
6. **F-04**, **F-08**, **F-11**, **F-13** — correctness and hardening.
7. **F-15** — confirm production topology before choosing `COOKIE_SAMESITE`; if cross-site, CSRF protection must be added first.

### Assurance limits

Authenticated and write-path behaviour — order creation, product/category/brand mutation, upload, admin CRUD, the live Razorpay round trip and webhook processing — is marked **CODE** or **NOT VERIFIED**, not **LIVE**. Establishing those would require creating accounts, writing records and exercising third-party payment infrastructure, all of which fall outside "safe, non-destructive testing only". The authorization *rejection* path for every one of those endpoints **was** confirmed live.
