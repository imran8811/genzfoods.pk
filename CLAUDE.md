# genz-web — Gen Z Foods Public Website

The main public website, **genzfoods.pk**. Talks to
[`genz-web-apis`](../genz-web-apis) for backend data.

- **Stack:** Angular 21 with **SSR** (server-side rendering via Angular SSR +
  Express 5). TypeScript 5.9. Styling in SCSS.
- **Testing:** Vitest (+ jsdom).
- **API access:** via `src/app/services/api.service.ts`.

## Layout

- `src/app/` — application root: `app.ts`, `app.routes.ts`,
  `app.routes.server.ts`, `app.config.ts` / `app.config.server.ts`.
- `src/app/components/`, `services/`, `guards/`, `models/` — feature code.
- `src/main.ts` (browser), `src/main.server.ts` + `src/server.ts` (SSR/Express).
- `src/styles.scss`, `public/` — global styles and static assets.

## Common commands

```bash
npm install
npm start                    # ng serve (dev server)
npm run build                # npx ng build
npm run watch                # ng build --watch (development config)
npm test                     # ng test (Vitest)
npm run serve:ssr:genz-web   # run the built SSR server (node dist/.../server.mjs)
```

## Conventions

- Standalone Angular components + Angular Router; route guards in `guards/`.
- Code is SSR-aware — guard browser-only APIs (`window`, `localStorage`) for the
  server render path.
- Prettier config lives in `package.json`: 100 col, single quotes, Angular HTML
  parser. Format before committing.
