# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **Yarn 4** through Corepack (`packageManager` in `package.json`), with the `node-modules` linker (`.yarnrc.yml`); `.yarn/` is git-ignored. Node >= 22.22 is required (`react-router` 8 enforces it via `engines`; CI uses Node 24). Yarn 4 is needed for `@anmitsu/ui`: it is a git dependency whose `dist/` is built by its `prepack` script, which Yarn 1 never runs.

- `yarn dev` — Vite dev server. The app is served under the base path `/tools/bill-splitter/`, so open `http://localhost:5173/tools/bill-splitter/`.
- `yarn build` — `tsc -b && vite build` (type-check is part of the build; `strict`, `noUnusedLocals`, `noUnusedParameters` are on).
- `yarn test` — Vitest, single run (`yarn vitest` to watch, `yarn vitest run src/bill/calc.test.ts` for one file). Tests sit next to the code as `*.test.ts`, run in the default Node environment (no DOM), and cover the pure modules only. CI runs them before the build, so a failing test blocks the deploy.
- `yarn lint` — ESLint (flat config, typescript-eslint recommended + react-hooks + react-refresh).
- Prettier config lives in `.prettierrc.json` (no semicolons, single quotes, JSX single quotes, `printWidth: 255`, `arrowParens: avoid`). There is no npm script for it; run `yarn prettier --write <files>` if needed.

## Architecture

Client-side-only React 19 + TypeScript + MUI app (SG-style bill splitter with service charge and GST), deployed to `https://anmitsu.dev/tools/bill-splitter` by `.github/workflows/deploy.yml` on push to `master`. All bill state is in memory. The only backend is the optional short-link store (see Short links); the app works without it.

The path the app is served under is set once, as `base` in `vite.config.ts`; `src/main.tsx` passes `import.meta.env.BASE_URL` (minus the trailing slash) to the router as `basename`. Sharing uses a query string (`?share=` or `?s=`), not extra routes, so the host needs no SPA fallback.

### Hosting

The build is static files in the S3 bucket `anmitsu-dev-frontend` under `tools/bill-splitter/`, served by the CloudFront distribution for `anmitsu.dev`. That distribution, its `/tools/bill-splitter*` behaviour (public, using the `append-index-html` CloudFront Function to map `/tools/bill-splitter` and `/tools/bill-splitter/` to `index.html`) and the deploy role are Terraform in the `anmitsu.dev` repo (`infra/apps.tf`, entry `billsplit`). The app's old path `/a/billsplit*` answers with a 301 to the same page under `/tools/bill-splitter`, keeping the query string, so old `?s=` and `?share=` links keep opening (`local.moved` there). The workflow reads the role ARN and distribution ID from the repository variables `AWS_ROLE_ARN` and `CLOUDFRONT_DISTRIBUTION_ID`, and assumes the IAM role `github-bill-splitter-deploy` through GitHub OIDC (trusted only for this repo's `master` branch; it can write under that S3 prefix and create invalidations, nothing else), uploads hashed assets as immutable and `index.html` as `no-cache`, then invalidates `/tools/bill-splitter*`. Moving the app to another path means changing `base` and the workflow's `S3_URI` and invalidation path here, and the app's `path` in `infra/apps.tf` (plus a `local.moved` entry for the old path) there; apply the Terraform before deploying, since the role can only write under the new path.

### Short links: `lambda/links/`, `src/share/short-link.ts`

A short link is `<page URL>?s=<id>`: the id points at a share token (exactly what a `?share=` link carries) kept server-side for 30 days. Everything is in `ap-southeast-1` and set up by hand, apart from the CloudFront side (in the `anmitsu.dev` Terraform):

- Lambda `billsplit-links` (`lambda/links/index.mjs`, Node.js 22, no dependencies beyond the runtime's AWS SDK, reserved concurrency 5 to bound abuse). `POST …/api/links` with the token as the body returns `{ id }`; `GET …/api/links/<id>` returns `{ token }` or 404. The id is the first 10 base64url characters of the token's SHA-256, so re-sharing the same bill returns the same link and renews its 30 days.
- DynamoDB table `billsplit-links` (on-demand, key `id`, TTL on `expiresAt`). The function's role `billsplit-links-lambda` can only get/put items in it and write its own logs.
- CloudFront behaviour `/tools/bill-splitter/api/*` (ahead of `/tools/bill-splitter*`, caching disabled, all methods) forwards to the function URL, which requires IAM auth and only accepts this distribution (origin access control). Because CloudFront signs the request, a `POST` must carry the body's SHA-256 in `x-amz-content-sha256`; `createShortLink` does that.
- The deploy workflow does **not** deploy the Lambda. After changing `lambda/links/index.mjs`, zip it and update the function code by hand.

`vite.config.ts` proxies `/tools/bill-splitter/api` to the deployed site, so `yarn dev` uses the real store.

### State: `src/hooks/use-bill.ts`

All bill state lives in the single `useBill()` hook, called once in `App.tsx`. It returns `{ data, methods }` (`BillMethods` is defined there; `BillData` and the other domain types live in `src/bill/types.ts` and are re-exported from the hook file), and `App` passes both props down to every section component (`Users`, `Items`, `Taxes`, `PriceSummary`, `WhoPaid`, `Report`). New features generally mean adding state + a method to this hook and extending the `BillMethods` type, not adding local state in the sections.

Key modelling details:
- `userItems` is a flat list of `{ userId, itemId }` pairs (who consumed which item). `removeUser` / `removeItem` cascade-delete matching pairs, and `removeUser` clears `payer` if needed.
- All money is `BigNumber` (bignumber.js), never JS numbers. Format with `formatMoney` (`src/bill/money.ts`, e.g. `$1,234.50`) at display time.
- Both taxes are changed through `setTax(kind, patch)` (`kind` is `'serviceTax'` or `'gstTax'`), which clamps the percentage to 0-100.
- `discount` is a fixed `BigNumber` amount (zero means none), changed through `setDiscount`, which clamps it to 0-`MAX_PRICE`. `computeBill` additionally caps it at the subtotal.
- Calculation order: subtotal → discount → service charge (on the discounted subtotal) → GST (on discounted subtotal + service charge). Each taxed amount is rounded **up** to 2 dp (`ROUND_UP`). Defaults: service 10%, GST 9%, both enabled.
- Per-user shares: `computeBill` splits each item equally among its contributors, then allocates the discount, service charge and GST proportionally to the user's share of the subtotal. Because of the per-user rounding, shares may not sum exactly to the total (the Report shows a disclaimer about 1–2 cent discrepancies).
- The maths is the pure `computeBill(data)` in `src/bill/calc.ts`, which returns every total plus a per-user share map in one pass. The hook memoizes it on `data`, and the `compute*` methods are thin accessors over that result. Change calculation rules there (and in `calc.test.ts`), not in the hook.

### Limits and validation: `src/bill/limits.ts`, `src/bill/validate.ts`

`limits.ts` is the only place size limits are defined. The share-format ceilings (`MAX_USERS`, `MAX_ITEMS`, `MAX_TEXT_LENGTH`, `MAX_PRICE`, `MAX_QUANTITY`) are what `share/format.ts` enforces on untrusted links; do not tighten them, or existing links stop opening. The entry limits (`MAX_USER_NAME_LENGTH`, `MAX_ENTRY_QUANTITY`) are stricter and apply to what the app lets a user add. `validate.ts` holds the input checks (`validateUserName`, `validateNewItem`, `validateItemFields`, `parsePercentage`, `parseDiscount`), each returning a user-facing message or `undefined`. Every place that adds to the bill (`ItemForm`, `Users`, `ReceiptScanner`, `Taxes`) goes through them so a bill built in the app always produces a share link that `parseBill` accepts. Note that bignumber.js 11 **throws** on non-numeric strings (`''`, `'.'`, `'abc'`) rather than returning NaN, so never pass raw input text to `new BigNumber` without a guard.

### Sharing: `src/share/`, `src/Share.tsx`, `src/hooks/use-shared-bill.ts`

A bill is shared as `<page URL>?s=<id>` (short link, see above) or `<page URL>?share=<token>` (the whole bill in the link; still produced as the fallback when the short-link store can't be used, and old ones must keep opening). Opening either renders the bill read-only (`readOnly` prop on `Users`, `Items`, `Taxes`, `WhoPaid`; `App` shows a banner and a "New bill" button that clears the param).

- `share/format.ts` defines the **versioned** serialized shape (`v` field, `CURRENT_VERSION`), `serializeBill` (BillData → JSON, users referenced by index, BigNumbers as strings, ids dropped) and `parseBill` (untrusted JSON → validated BillData with fresh uuids). Old links must keep working: to change the format, bump `CURRENT_VERSION`, add `migrations[oldVersion]`, and update `serializeBill`/`toBillData`. Never change the meaning of an existing version. Version 2 added `discount`; `migrations[1]` fills it in as `'0'` for version 1 links.
- `share/codec.ts` is deflate-raw (`CompressionStream`, no dependency) + unpadded URL-safe base64. Decoding accepts standard base64 too and caps decompressed size at 1 MB. Both directions are async.
- Everything decoded from a link is untrusted: validate in `format.ts` and throw `ShareError` (its message is shown to the user).
- `Share.tsx` only creates a link when "Create link" is pressed, because a short link stores the bill on the server; editing the bill discards the link. `use-shared-bill.ts` resolves `?s=` to a token with `fetchShareToken` and then treats it like any other untrusted token.
- `Share.tsx` also offers WhatsApp and Telegram buttons (plain `wa.me` / `t.me/share/url` links) and a "Share" button that calls `navigator.share` only when the browser supports it (the native sheet lists every installed app). Adding another target is just another link built from `link`.
- `useBill(initial?)` accepts the decoded bill as initial state; `App` decodes before mounting `Bill`, since hook state can only be seeded on first render.

### Receipt scanning: `src/components/ReceiptScanner.tsx`, `src/ocr/parse-receipt.ts`

"Scan Receipt" (next to "Add Item" in `Items.tsx`) runs on-device OCR with `tesseract.js`, which is **lazy-loaded** via dynamic `import()` so it stays out of the main bundle. Its worker, WASM and `eng` language data are fetched from the jsDelivr CDN on first scan (needs network). `parseReceiptText` is a pure text -> items heuristic (skips total/GST/change lines, treats prices as line totals, only splits into per-unit when it divides exactly to cents, merges duplicates). Items are added immediately, with an Undo snackbar (`addItem` returns the new id). Names and item count are clamped to the share-format limits (`MAX_TEXT_LENGTH`, `MAX_ITEMS` from `bill/limits.ts`) and each parsed item must pass `validateItemFields`, so the sender's own share link stays valid.

### UI

The look is the shared anmitsu.dev one from `@anmitsu/ui` (`../anmitsu-ui`; its README lists the theme's shades and components). It is installed from the public GitHub repo over HTTPS at a tag (`git+https://github.com/ryanYtan/anmitsu-ui.git#v…`, so CI needs no SSH key); take a new version by changing that tag and running `yarn install`. `src/main.tsx` wraps the app in `AnmitsuProvider` with the **coral** accent (the other apps: debts lavender, dashboard teal) and loads its Inter font; the theme follows the device's light or dark setting, so check changes in both. `App` is an `AppHeader` and a `Page` (both `maxWidth='sm'`) with a `PageHeader`. Each section component in `src/*.tsx` is an `@anmitsu/ui` `Section` (heading, optional action and description) around a `Panel`; lists are `<Panel flush>` with `Rows` / `ListRow`, and `Report` uses `Stats`. Use the theme's palette names (`primary.tint`, `text.secondary`) and its defaults (fields are small, full width and labelled above) rather than fixed colours or sizes. Shared bits are in `src/components/`: `ItemForm` (the "Add an item" `FormDialog`, and "Edit item" when given an `item`: the pencil on each item row; saving goes through `updateItem`, which keeps the item's id and so who had it, and `validateEditedItem`, which lets it keep its own name; it throws the validation message for the dialog to show), `PersonChip` (a name tag; `color='primary'` marks a chosen person), `ItemSummary` (an item's name, with unit price × quantity), `DecimalField` (every number field with decimals goes through it: it keeps the text as typed, since feeding the parsed number back as the value drops a trailing point, turning 8.5 into 85, and breaks typing on phone keyboards; don't use `fixedDecimalScale` while typing either. `initialText` sets its starting text, such as `6.50` for an edited price), `SectionDialog` (the dialog shell for anything that is not a form: title, close button, optional `actions`), `BillSkeleton` (the placeholder `App` shows while a shared bill loads; keep its sections in step with the read-only bill layout), `Toast` (every snackbar goes through it; it moves toasts to the top on mobile, where the keyboard covers the bottom edge) and `total-rows.ts` (the price breakdown rows of `PriceSummary`; disabled taxes and a zero discount are omitted). A read-only bill hides `WhoPaid` (the summary names the payer) and the discount row when there is none. `src/constants/constants.ts` holds the `randomNames` list used by `Users.tsx` to generate random unused names.

## Open items

- **Link previews (proposed, not started; ask before starting).** Show the gist of a shared bill when its link is pasted into Telegram or WhatsApp. Plan: a CloudFront Function on `/tools/bill-splitter*` sends link-preview bots (WhatsApp, TelegramBot, facebookexternalhit, Slackbot, Discordbot, Twitterbot) asking for a `?s=` or `?share=` page to the `billsplit-links` Lambda, which decodes the bill with the app's own `codec` / `parseBill` / `computeBill` (bundled with esbuild) and answers with `og:title` ("🧾 $184.30 bill split 4 ways") and `og:description` ("Paid by Alice · Bob owes $46.10 · …"). Not yet checked: whether a CloudFront Function can pick the Lambda origin and keep its origin access control signing. Fallback: redirect only the bots to a separate preview address.
- The hand-made `billsplit-links` function and table have no `app` tag, so the cost dashboard counts them as untagged.
- The build from before the move to `/tools/bill-splitter` is still in the bucket under `a/billsplit/`, unused.
