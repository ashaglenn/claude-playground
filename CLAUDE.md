# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 project using the App Router with TypeScript and Tailwind CSS v4.

**Key structure:**
- `src/app/` - App Router pages and layouts (file-based routing)
- `src/app/layout.tsx` - Root layout wrapping all pages
- `src/app/page.tsx` - Home page (`/`)
- `public/` - Static assets

**Path alias:** `@/*` maps to `./src/*`

**Styling:** Tailwind CSS configured via `@tailwindcss/postcss`. Global styles in `src/app/globals.css`.

**Adding pages:** Create `src/app/[route]/page.tsx` for new routes. Use `layout.tsx` files for nested layouts.
