# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **yarn** (v1). Node >= 22.22 is required (`react-router` 8 enforces it via `engines`; CI uses Node 24).

- `yarn dev` — Vite dev server. The app is served under the base path `/a/billsplit/`, so open `http://localhost:5173/a/billsplit/`.
- `yarn build` — `tsc -b && vite build` (type-check is part of the build; `strict`, `noUnusedLocals`, `noUnusedParameters` are on).
- `yarn test` — Vitest, single run (`yarn vitest` to watch, `yarn vitest run src/bill/calc.test.ts` for one file). Tests sit next to the code as `*.test.ts`, run in the default Node environment (no DOM), and cover the pure modules only. CI runs them before the build, so a failing test blocks the deploy.
- `yarn lint` — ESLint (flat config, typescript-eslint recommended + react-hooks + react-refresh).
- Prettier config lives in `.prettierrc.json` (no semicolons, single quotes, JSX single quotes, `printWidth: 255`, `arrowParens: avoid`). There is no npm script for it; run `yarn prettier --write <files>` if needed.

## Architecture

Client-side-only React 19 + TypeScript + MUI app (SG-style bill splitter with service charge and GST), deployed to `https://anmitsu.dev/a/billsplit` by `.github/workflows/deploy.yml` on push to `master`. There is no backend or persistence; all state is in memory.

The path the app is served under is set once, as `base` in `vite.config.ts`; `src/main.tsx` passes `import.meta.env.BASE_URL` (minus the trailing slash) to the router as `basename`. Sharing uses a query string (`?share=`), not extra routes, so the host needs no SPA fallback.

### Hosting

The build is static files in the S3 bucket `anmitsu-dev-frontend` under `a/billsplit/`, served by the CloudFront distribution for `anmitsu.dev` (`E1YMFP7OO0CUWS`, set up by hand, not IaC). That distribution's default behaviour is another app behind basic auth; the `/a/billsplit*` behaviour is public and uses the `append-index-html` CloudFront Function (shared with another distribution) to map `/a/billsplit` and `/a/billsplit/` to `index.html`. The workflow assumes the IAM role `github-bill-splitter-deploy` through GitHub OIDC (trusted only for this repo's `master` branch; it can write under that S3 prefix and create invalidations, nothing else), uploads hashed assets as immutable and `index.html` as `no-cache`, then invalidates `/a/billsplit*`. Moving the app to another path means changing `base`, the workflow's `S3_URI` and invalidation path, the role's policy, and the CloudFront behaviour together.

### State: `src/hooks/use-bill.ts`

All bill state lives in the single `useBill()` hook, called once in `App.tsx`. It returns `{ data, methods }` (`BillMethods` is defined there; `BillData` and the other domain types live in `src/bill/types.ts` and are re-exported from the hook file), and `App` passes both props down to every section component (`Users`, `Items`, `Taxes`, `PriceSummary`, `WhoPaid`, `Report`). New features generally mean adding state + a method to this hook and extending the `BillMethods` type, not adding local state in the sections.

Key modelling details:
- `userItems` is a flat list of `{ userId, itemId }` pairs (who consumed which item). `removeUser` / `removeItem` cascade-delete matching pairs, and `removeUser` clears `payer` if needed.
- All money is `BigNumber` (bignumber.js), never JS numbers. Format with `formatMoney` (`src/bill/money.ts`, e.g. `$1,234.50`) at display time.
- Both taxes are changed through `setTax(kind, patch)` (`kind` is `'serviceTax'` or `'gstTax'`), which clamps the percentage to 0-100.
- Calculation order: subtotal → service charge (on subtotal) → GST (on subtotal + service charge). Each taxed amount is rounded **up** to 2 dp (`ROUND_UP`). Defaults: service 10%, GST 9%, both enabled.
- Per-user shares: `computeBill` splits each item equally among its contributors, then allocates service charge and GST proportionally to the user's share of the subtotal. Because of the per-user rounding, shares may not sum exactly to the total (the Report shows a disclaimer about 1–2 cent discrepancies).
- The maths is the pure `computeBill(data)` in `src/bill/calc.ts`, which returns every total plus a per-user share map in one pass. The hook memoizes it on `data`, and the `compute*` methods are thin accessors over that result. Change calculation rules there (and in `calc.test.ts`), not in the hook.

### Limits and validation: `src/bill/limits.ts`, `src/bill/validate.ts`

`limits.ts` is the only place size limits are defined. The share-format ceilings (`MAX_USERS`, `MAX_ITEMS`, `MAX_TEXT_LENGTH`, `MAX_PRICE`, `MAX_QUANTITY`) are what `share/format.ts` enforces on untrusted links; do not tighten them, or existing links stop opening. The entry limits (`MAX_USER_NAME_LENGTH`, `MAX_ENTRY_QUANTITY`) are stricter and apply to what the app lets a user add. `validate.ts` holds the input checks (`validateUserName`, `validateNewItem`, `validateItemFields`, `parsePercentage`), each returning a user-facing message or `undefined`. Every place that adds to the bill (`ItemForm`, `Users`, `ReceiptScanner`, `Taxes`) goes through them so a bill built in the app always produces a share link that `parseBill` accepts. Note that bignumber.js 11 **throws** on non-numeric strings (`''`, `'.'`, `'abc'`) rather than returning NaN, so never pass raw input text to `new BigNumber` without a guard.

### Sharing: `src/share/`, `src/Share.tsx`, `src/hooks/use-shared-bill.ts`

A bill is shared as `<page URL>?share=<token>`; opening such a link renders the bill read-only (`readOnly` prop on `Users`, `Items`, `Taxes`, `WhoPaid`; `App` shows a banner and a "New bill" button that clears the param).

- `share/format.ts` defines the **versioned** serialized shape (`v` field, `CURRENT_VERSION`), `serializeBill` (BillData → JSON, users referenced by index, BigNumbers as strings, ids dropped) and `parseBill` (untrusted JSON → validated BillData with fresh uuids). Old links must keep working: to change the format, bump `CURRENT_VERSION`, add `migrations[oldVersion]`, and update `serializeBill`/`toBillData`. Never change the meaning of an existing version.
- `share/codec.ts` is deflate-raw (`CompressionStream`, no dependency) + unpadded URL-safe base64. Decoding accepts standard base64 too and caps decompressed size at 1 MB. Both directions are async.
- Everything decoded from a link is untrusted: validate in `format.ts` and throw `ShareError` (its message is shown to the user).
- `Share.tsx` also offers WhatsApp and Telegram buttons (plain `wa.me` / `t.me/share/url` links) and a "Share" button that calls `navigator.share` only when the browser supports it (the native sheet lists every installed app). Adding another target is just another link built from `link`.
- `useBill(initial?)` accepts the decoded bill as initial state; `App` decodes before mounting `Bill`, since hook state can only be seeded on first render.

### Receipt scanning: `src/components/ReceiptScanner.tsx`, `src/ocr/parse-receipt.ts`

"Scan Receipt" (next to "Add Item" in `Items.tsx`) runs on-device OCR with `tesseract.js`, which is **lazy-loaded** via dynamic `import()` so it stays out of the main bundle. Its worker, WASM and `eng` language data are fetched from the jsDelivr CDN on first scan (needs network). `parseReceiptText` is a pure text -> items heuristic (skips total/GST/change lines, treats prices as line totals, only splits into per-unit when it divides exactly to cents, merges duplicates). Items are added immediately, with an Undo snackbar (`addItem` returns the new id). Names and item count are clamped to the share-format limits (`MAX_TEXT_LENGTH`, `MAX_ITEMS` from `bill/limits.ts`) and each parsed item must pass `validateItemFields`, so the sender's own share link stays valid.

### UI

Section components in `src/*.tsx` are each wrapped in `components/Section/SectionContainer` + `Section` for consistent layout. Shared bits are in `src/components/`: `ItemForm`, `PersonChip`, `FlexBox`, `ItemSummary` (an item's name, unit price and quantity), `SectionDialog` (the standard dialog shell), `Toast` (every snackbar goes through it; it moves toasts to the top on mobile, where the keyboard covers the bottom edge) and `total-rows.ts` (the price breakdown rows shared by `PriceSummary` and `Report`; disabled taxes are omitted). MUI theme (Roboto, compact typography scale) is defined in `src/main.tsx`. `src/constants/constants.ts` holds the `randomNames` list used by `Users.tsx` to generate random unused names.
