# maxjustships.dev

Personal portfolio site — [maxjustships.dev](https://maxjustships.dev)

Built with Astro + Tailwind CSS v4, deployed on Cloudflare Pages.

## Develop

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build    # outputs static site to dist/
pnpm preview  # serve the production build locally
```

## Structure

- `src/pages/index.astro` — single-page layout (hero, projects, small tools, about, contact)
- `src/data/projects.ts` — all project content in one typed data file
- `src/styles/global.css` — design system (neo-brutalism cards, Fraunces display + Inter body)
- `public/assets/` — images and screenshots

## Adding a project

Edit `src/data/projects.ts` — add an entry to `PROJECTS` (flagship cards) or
`SMALL_TOOLS` (compact list). No markup changes needed.

## License

[MIT](LICENSE)
