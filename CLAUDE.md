# genz-web — GEN Z Foods Public Website

The customer-facing ordering website (genzfoods.pk). Talks to
[`genz-web-apis`](../genz-web-apis) for all data.

- **Stack:** Angular 21 (standalone components, signals) + **SSR** (Angular SSR + Express 5), TypeScript 5.9, SCSS.
- **Runs on:** `http://localhost:4200` (`npm start`). API base from `src/environments/environment.ts` → `http://localhost:8000/api/v1` (prod swap via `environment.prod.ts`).
- **Brand:** name is **"GEN Z Foods"** (GEN all caps). Design = "Bold & Youthful": near-black bg, logo **red `--red:#ff1f2d`** + **lemon-yellow `--yellow:#ffe000`** accents, `Anton` display font + `Outfit` body. Single yellow token site-wide (tuned to the logo). Tokens + shared components in `src/styles.scss`.

## Run / build
```bash
npm install
npm start                    # ng serve → localhost:4200
npx ng build --configuration development   # fast build to typecheck (no budgets)
```
Component SCSS budget: 12kB max each — keep shared styles in global `styles.scss`.

## Structure that matters
- `services/`: `api.service` (env base URL + Bearer token `genz_api_token`), `catalog.service` (/site, /menu, /deals), `cart.service` (**local, signal + localStorage** cart; supports sized items & deals), `order.service` (POSTs /checkout), `auth.service` (token auth, stores user under `genz_current_user`).
- `models/catalog.model.ts` — Category/MenuItem/Variant/Deal/CartLine/PlacedOrder.
- `components/`: home, menu, cart, checkout, order-confirmation, header, footer, login/signup/forgot/reset (auth). **No admin** (removed — menu is managed in the RMS).
- **Menu page** = continuous scroll-spy (all categories stacked, sticky tabs highlight current section via IntersectionObserver), size selectors, deal-builder modal, sticky cart bar.

## Flows
- Browse → add (size/deal) → local cart → checkout. Checkout **requires login** (redirects to `/login?redirect=/checkout`, param preserved across login↔signup). Logged-in checkout pre-fills name/phone from the account.
- Checkout posts to `/checkout`; backend re-prices and creates the order; confirmation shows the real order number.

## Menu images (from Gen Z Admin)
Menu/deal **images** originate in [`genz-admin`](../genz-admin) (source of truth), flow through
`genz-web-apis` (which syncs from `genz-admin-apis`) as `image_url`, and render on the menu/deal
cards (`components/menu/menu.html` → `.media-img`, falling back to the emoji placeholder when an
item has no image). Re-uploads refresh automatically via the `?v=` cache-buster on the URL.
(Today the menu is still fetched via `genz-web-apis` rather than directly from `genz-admin-apis`
because checkout is keyed to web-apis `variant_id`/`deal_id` — see the root `CLAUDE.md` note.)

## Build status
- ✅ Built: public site, menu (scroll-spy + sizes + deals + **item/deal images**), cart/checkout/orders, auth.
- ⏳ Pending: online-payment UI once the backend gateway stub lands (checkout already has COD/online radio).
- Possible add: "My Orders" page (backend `/orders` exists).

## Conventions
- Signals + standalone components. SSR-aware: guard `window`/`localStorage` (cart/auth/order services already do).
- Add pipes (`DecimalPipe` etc.) to each component's `imports`. Prettier: 100 col, single quotes.
