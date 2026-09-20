# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **yarn** (v1). Node >= 22.22 is required (`react-router` 8 enforces it via `engines`; CI uses Node 24). There is no test runner configured.

- `yarn dev` — Vite dev server. The app is served under the base path `/bill-splitter-v2/`, so open `http://localhost:5173/bill-splitter-v2/`.
- `yarn build` — `tsc -b && vite build` (type-check is part of the build; `strict`, `noUnusedLocals`, `noUnusedParameters` are on).
- `yarn lint` — ESLint (flat config, typescript-eslint recommended + react-hooks + react-refresh).
- Prettier config lives in `.prettierrc.json` (no semicolons, single quotes, JSX single quotes, `printWidth: 255`, `arrowParens: avoid`). There is no npm script for it; run `yarn prettier --write <files>` if needed.

## Architecture

Client-side-only React 19 + TypeScript + MUI app (SG-style bill splitter with service charge and GST), deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `master`. There is no backend or persistence; all state is in memory.

**The repo name is hardcoded in two places that must stay in sync:** `base` in `vite.config.ts` and the `PROG` constant in `src/main.tsx` (used as the route path `/bill-splitter-v2`). Sharing uses a query string (`?share=`), not extra routes, so GitHub Pages needs no SPA fallback.

### State: `src/hooks/use-bill.ts`

All bill state and business logic live in the single `useBill()` hook, called once in `App.tsx`. It returns `{ data, methods }` (`BillData` / `BillMethods` types are exported from that file), and `App` passes both props down to every section component (`Users`, `Items`, `Taxes`, `PriceSummary`, `WhoPaid`, `Report`). New features generally mean adding state + a method to this hook and extending the `BillMethods` type, not adding local state in the sections.

Key modelling details:
- `userItems` is a flat list of `{ userId, itemId }` pairs (who consumed which item). `removeUser` / `removeItem` cascade-delete matching pairs, and `removeUser` clears `payer` if needed.
- All money is `BigNumber` (bignumber.js), never JS numbers. Format with `.toFixed(2)` at display time.
- Calculation order: subtotal → service charge (on subtotal) → GST (on subtotal + service charge). Each taxed amount is rounded **up** to 2 dp (`ROUND_UP`). Defaults: service 10%, GST 9%, both enabled.
- `computeUserShare` splits each item equally among its contributors, then allocates service charge and GST proportionally to the user's share of the subtotal. Because of the per-user rounding, shares may not sum exactly to the total (the Report shows a disclaimer about 1–2 cent discrepancies).
- `compute*` methods are recomputed on every call (no memoization) and read from current render state.

### Sharing: `src/share/`, `src/Share.tsx`, `src/hooks/use-shared-bill.ts`

A bill is shared as `<page URL>?share=<token>`; opening such a link renders the bill read-only (`readOnly` prop on `Users`, `Items`, `Taxes`, `WhoPaid`; `App` shows a banner and a "New bill" button that clears the param).

- `share/format.ts` defines the **versioned** serialized shape (`v` field, `CURRENT_VERSION`), `serializeBill` (BillData → JSON, users referenced by index, BigNumbers as strings, ids dropped) and `parseBill` (untrusted JSON → validated BillData with fresh uuids). Old links must keep working: to change the format, bump `CURRENT_VERSION`, add `migrations[oldVersion]`, and update `serializeBill`/`toBillData`. Never change the meaning of an existing version.
- `share/codec.ts` is deflate-raw (`CompressionStream`, no dependency) + unpadded URL-safe base64. Decoding accepts standard base64 too and caps decompressed size at 1 MB. Both directions are async.
- Everything decoded from a link is untrusted: validate in `format.ts` and throw `ShareError` (its message is shown to the user).
- `Share.tsx` also offers WhatsApp and Telegram buttons (plain `wa.me` / `t.me/share/url` links) and a "Share" button that calls `navigator.share` only when the browser supports it (the native sheet lists every installed app). Adding another target is just another link built from `link`.
- `useBill(initial?)` accepts the decoded bill as initial state; `App` decodes before mounting `Bill`, since hook state can only be seeded on first render.

### Receipt scanning: `src/components/ReceiptScanner.tsx`, `src/ocr/parse-receipt.ts`

"Scan Receipt" (next to "Add Item" in `Items.tsx`) runs on-device OCR with `tesseract.js`, which is **lazy-loaded** via dynamic `import()` so it stays out of the main bundle. Its worker, WASM and `eng` language data are fetched from the jsDelivr CDN on first scan (needs network). `parseReceiptText` is a pure text -> items heuristic (skips total/GST/change lines, treats prices as line totals, only splits into per-unit when it divides exactly to cents, merges duplicates). Items are added immediately, with an Undo snackbar (`addItem` returns the new id). Names and item count are clamped to the share-format limits (`MAX_TEXT_LENGTH`, `MAX_ITEMS`, exported from `share/format.ts`) so the sender's own share link stays valid.

### UI

Section components in `src/*.tsx` are each wrapped in `components/Section/SectionContainer` + `Section` for consistent layout. Shared bits are in `src/components/` (`ItemForm`, `PersonChip`, `FlexBox`). MUI theme (Roboto, compact typography scale) is defined in `src/main.tsx`. `src/constants/constants.ts` holds the `randomNames` list used by `Users.tsx` to generate random unused names.
