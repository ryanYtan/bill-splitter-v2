# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **yarn** (v1). There is no test runner configured.

- `yarn dev` — Vite dev server. The app is served under the base path `/bill-splitter-v2/`, so open `http://localhost:5173/bill-splitter-v2/`.
- `yarn build` — `tsc -b && vite build` (type-check is part of the build; `strict`, `noUnusedLocals`, `noUnusedParameters` are on).
- `yarn lint` — ESLint (flat config, typescript-eslint recommended + react-hooks + react-refresh).
- Prettier config lives in `.prettierrc.json` (no semicolons, single quotes, JSX single quotes, `printWidth: 255`, `arrowParens: avoid`). There is no npm script for it; run `yarn prettier --write <files>` if needed.

## Architecture

Client-side-only React 19 + TypeScript + MUI app (SG-style bill splitter with service charge and GST), deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `master`. There is no backend or persistence; all state is in memory.

**The repo name is hardcoded in two places that must stay in sync:** `base` in `vite.config.ts` and the `PROG` constant in `src/main.tsx` (used as the route prefix: `/bill-splitter-v2` and `/bill-splitter-v2/s/:slug`). `App` reads `slug` from `useParams()` but does not use it yet.

### State: `src/hooks/use-bill.ts`

All bill state and business logic live in the single `useBill()` hook, called once in `App.tsx`. It returns `{ data, methods }` (`BillData` / `BillMethods` types are exported from that file), and `App` passes both props down to every section component (`Users`, `Items`, `Taxes`, `PriceSummary`, `WhoPaid`, `Report`). New features generally mean adding state + a method to this hook and extending the `BillMethods` type, not adding local state in the sections.

Key modelling details:
- `userItems` is a flat list of `{ userId, itemId }` pairs (who consumed which item). `removeUser` / `removeItem` cascade-delete matching pairs, and `removeUser` clears `payer` if needed.
- All money is `BigNumber` (bignumber.js), never JS numbers. Format with `.toFixed(2)` at display time.
- Calculation order: subtotal → service charge (on subtotal) → GST (on subtotal + service charge). Each taxed amount is rounded **up** to 2 dp (`ROUND_UP`). Defaults: service 10%, GST 9%, both enabled.
- `computeUserShare` splits each item equally among its contributors, then allocates service charge and GST proportionally to the user's share of the subtotal. Because of the per-user rounding, shares may not sum exactly to the total (the Report shows a disclaimer about 1–2 cent discrepancies).
- `compute*` methods are recomputed on every call (no memoization) and read from current render state.

### UI

Section components in `src/*.tsx` are each wrapped in `components/Section/SectionContainer` + `Section` for consistent layout. Shared bits are in `src/components/` (`ItemForm`, `PersonChip`, `FlexBox`, `ClickAwayTooltipIcon`). MUI theme (Roboto, compact typography scale) is defined in `src/main.tsx`. `src/constants/constants.ts` holds the `randomNames` list used by `Users.tsx` to generate random unused names.
