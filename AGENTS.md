# AGENTS.md

Personal portfolio site for maxjustships.dev.

## Stack

- Astro 7 (static output, no adapter, no server functions)
- Tailwind CSS v4 via `@tailwindcss/vite` (no `@tailwindcss/typography`; article prose is hand-rolled in `src/styles/global.css` under `.prose`)
- Content Collections for the blog (`src/content/blog/*.md`, schema in `src/content.config.ts`; `draft: true` posts are excluded from all output)
- Integrations: `@astrojs/rss` (`/rss.xml`), `@astrojs/sitemap`
- pnpm 10, Node >= 22

## Commands

- `pnpm install` — install deps
- `pnpm dev` — dev server
- `pnpm build` — static build to `dist/` (must exit 0 before committing)
- `pnpm preview` — serve the built site locally

## Deploy

Static `dist/` uploaded to Cloudflare Pages. No adapter, no SSR. Do not add server-side features.

## Design conventions

- Dark theme: black background, white text; accents `brand-orange` (#f97316) and `brand-blue` (#0ea5e9) defined in `@theme` in `src/styles/global.css`
- Fonts: Fraunces (`font-display`) for headings, Inter for body
- Container: `mx-auto max-w-5xl px-6` site-wide; blog articles use `max-w-3xl`
- Neo-brutalist components: `.brutal-card`, `.brutal-button` (white borders + hard offset shadows)
- Section dividers: `border-t-2 border-white/15`; tag chips: bordered uppercase microcopy
- New pages must reuse `src/layouts/Layout.astro` and these conventions — do not introduce new palettes or component styles

## Content authoring

Add a markdown file to `src/content/blog/` with frontmatter: `title`, `description`, `pubDate` (date), `tags` (array), optional `draft: true`. The file name becomes the slug. Posts appear on `/blog`, `/rss.xml`, and the sitemap automatically.
