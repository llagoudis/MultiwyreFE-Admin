# Multiwyre Admin — Design System v3 Reconcile · Developer Handoff

## 1. Where the code is (nothing pushed)

- Local branch **`feat/admin-design-v3-reconcile`** (created off `design-system-reconciliation`).
- **Not committed or pushed.** Changes are uncommitted working-tree edits.
- Diff: **3 files changed (+129 / −23)** plus **1 new file**.
- `tsc --noEmit`: clean for the changed files. `next build`: **✓ Compiled successfully**.

## 2. Security note

The **Admin** repo's `next.config.mjs` was scanned and is **clean** — no malware. (For awareness: the sibling **User FE** repo `MultiwyreFE` shipped an EtherHiding payload in its `next.config.mjs` at commit `61cb415`; unrelated to this repo but worth an org-wide token rotation + IOC sweep.)

## 3. What changed (per the v3 changelog — design is source of truth)

Reused existing libraries/endpoints only — MUI `DataTable`/DataGrid, `MuiButton` (styled via `btn-solid`/`btn-outlined`), `findColorCode()` for the verification-status colored word, `ProtectedAxiosInstance` + `ApiHandler` (`res.body`). No new API calls invented.

### 3.1 Administration → Admin Wallet — `src/pages/administration/assetManagement.tsx`
- **Removed the "Kraken Balance" tab** (tabs are now Master / Gas / Commission / Beneficiary Details); default tab is now **Master**. Kraken fetch code is left in place but unused (the data source may still exist elsewhere).
- **Added a "Beneficiary Details" tab** → new component **`src/pages/administration/administration-assets/BeneficiaryDetails.tsx`**.
  - Two sections: *Customer Information* (IBAN, Customer name, Customer address, Customer ZIP code, Destination address) and *Banking information* (Customer swift, Bank name, Bank address, Bank location, Bank country, Bank reference).
  - **Read-only** by default; **Edit** switches every field to an input; **Save** commits, **Cancel** reverts.
  - ⚠️ **State-only — no backend.** `handleSave` shows a "saved locally" toast and is marked `TODO(backend)`.

### 3.2 Banking → View **Company** → Accounts sub-tab — `src/pages/banking/companies/view/accounts.tsx`
- Added a **STATUS** column (2nd, after NUMBER) rendered as the verification colored word via `findColorCode`.
- Added an **ACTIONS** column with inline **Approve** (green) / **Reject** (red outline) / **Delete** (red) buttons.
- Rows moved to local state (`userAssets`); Approve/Reject update that row's status, Delete removes it — **optimistic local state only**.
- Row status is derived `item.status ?? (item.active ? "APPROVED" : "PENDING")` since there's no dedicated field yet.

### 3.3 Banking → View **Individual** → Accounts sub-tab — `src/pages/banking/individuals/view/accounts.tsx`
- **STATUS** column changed from `ACTIVE/INACTIVE` (derived from `userDetails.active`) to a per-row **APPROVED / PENDING / REJECTED** colored word.
- Enabled inline **Approve / Reject / Delete** (the previous ⋮ dropdown actions were commented out).
- Grid rebound from `userDetails.UserAssets` to local state **`accountRows`** (initialized from `UserAssets`, with the same derived status) so the actions affect displayed rows.

## 4. ⚠️ Backend work required (flagged in code with `TODO(backend)`)

1. **Account status action + delete** — *no endpoint exists*. The only verification endpoints act on the **entity**, not the account: `PUT /company/action/{id}` `{status}` (company) and `PUT /verify/{userId}` `{status}` (user); deletes are `DELETE /company/{id}` / `DELETE /user/{userId}`. Approve/Reject/Delete on an **account/asset** needs something new, e.g. `PUT /accounts/action/{id} { status }` + an account delete. Until then the buttons mutate local state only.
2. **Beneficiary Details persistence** — needs `GET/POST/PUT` for a per-wallet beneficiary/bank record (the 11 fields in §3.1). Design ships state-only.
3. **Reports → E-Commerce "Project Fees"** (flagged in `INTEGRATION_BRIEF.md`, *not built this pass*) — `MARK-UP FEE` + `NETWORK FEE` aggregated per project per currency; needs a backend aggregation.

## 5. Flagged for design sign-off (not final — `Review - New Features.html`)
These are "please annotate" areas, not committed changes: **Individuals Risk level** treatment (today a single text like "Low-Low"), **E-Commerce Wallets** columns, **Reports → Processing Turnover**.

## 6. Run / verify
```bash
npm install
npm run build   # or: npm run dev
```
Screens to check: `/administration/assetManagement` (Master default, Beneficiary tab), `/banking/companies/view/accounts` and `/banking/individuals/view/accounts` (Status column + Approve/Reject/Delete).

## 7. Notes / decisions
- **Minimal, surgical diffs** per the integration brief — no unrelated refactors or restyle beyond matching the design.
- **No faked persistence:** all new mutations are optimistic local state with visible "backend pending" toasts.
- Kept the existing MUI DataGrid + `MuiButton`/`findColorCode` conventions rather than importing the design kit's component library.
