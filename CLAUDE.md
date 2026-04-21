# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`21.com` is a minimal React 19 + TypeScript + Vite 8 component showcase. It demonstrates a small UI library (`Button`, `Separator`) built on Radix UI primitives, `class-variance-authority` (CVA) variants, and Tailwind CSS v4. The app is purely presentational — there is no routing, state management, backend, or test framework wired up yet.

## Commands

All scripts are defined in `package.json`. The package manager is npm (`package-lock.json` is the only lockfile).

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Vite dev server with HMR (defaults to http://localhost:5173) |
| `npm run build` | Type-check with `tsc -b`, then produce a production bundle via `vite build` into `dist/` |
| `npm run lint` | Run ESLint (flat config) over the repo |
| `npm run preview` | Serve the built `dist/` locally for smoke-testing production output |

There is **no `test` script** — no test runner is installed. Do not assume one exists.

## Directory layout

```
/
├── index.html                    # Vite entry; mounts React to #root and loads /src/main.tsx
├── package.json                  # Scripts + deps
├── vite.config.ts                # React + Tailwind plugins, @ → ./src alias
├── tsconfig.json                 # Root: references the two configs below
├── tsconfig.app.json             # App code (strict, ES2023, react-jsx, @/* path)
├── tsconfig.node.json            # Build-tooling TS config
├── eslint.config.js              # Flat config, ignores dist/
├── public/                       # Static files copied verbatim to build root
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.tsx                  # createRoot + <StrictMode>, imports index.css
    ├── App.tsx                   # Showcase page rendering Button/Separator variants
    ├── index.css                 # Tailwind v4 + tw-animate-css + theme tokens
    ├── assets/                   # Imported images (hero.png, react.svg, vite.svg)
    ├── components/
    │   └── ui/                   # Reusable UI primitives
    │       ├── button.tsx
    │       └── separator.tsx
    └── lib/
        └── utils.ts              # cn() class-merging helper
```

## Key files

- `src/main.tsx` — React root, wraps `<App />` in `<StrictMode>`, imports `./index.css`.
- `src/App.tsx` — The showcase. Uses Tailwind utilities for layout and renders every `Button` variant/size plus horizontal and vertical `Separator`s with icons from `lucide-react`.
- `src/index.css` — Loads Tailwind v4 (`@import "tailwindcss"`), `tw-animate-css`, declares the dark mode rule `@custom-variant dark (&:is(.dark *))`, and defines the design-token palette in OKLCH under `@theme inline` (`--color-background`, `--color-primary`, `--color-destructive`, `--radius`, chart + sidebar colors, etc.).
- `src/components/ui/button.tsx` — CVA-based `Button`. Variants: `default | destructive | outline | secondary | ghost | link`. Sizes: `sm | default | lg | icon`. Accepts `asChild` to render through `@radix-ui/react-slot`. Adds `data-slot="button"`. Exports both `Button` and `buttonVariants`.
- `src/components/ui/separator.tsx` — Thin wrapper over `@radix-ui/react-separator`’s `Root`. Supports `horizontal` / `vertical` orientations and sets `data-slot="separator-root"`.
- `src/lib/utils.ts` — Exports `cn(...inputs: ClassValue[])` that composes `clsx` with `tailwind-merge`. Use this for every conditional class.
- `index.html` — Mounts to `<div id="root">`, loads `/src/main.tsx`.

## Conventions

Follow these patterns when adding or modifying code so new work stays consistent with what is already here.

- **Path alias `@/`.** Always import from `@/...` — the alias is configured in both `tsconfig.app.json` (`paths: { "@/*": ["./src/*"] }`) and `vite.config.ts`. Avoid `../../` style relative imports across directories.
- **Class composition with `cn()`.** Always combine Tailwind classes through `cn()` from `@/lib/utils`. Don’t call `clsx` or `twMerge` directly in components.
- **UI components mirror `button.tsx`.** When adding a new primitive under `src/components/ui/`:
  - Define a CVA `*Variants` configuration with `defaultVariants`.
  - Spread `className` through `cn(xxxVariants({ ..., className }))`.
  - Add a `data-slot="..."` attribute for identification.
  - Support polymorphism with `asChild` + Radix `Slot` when it makes sense.
  - Export both the component and its `*Variants` object.
- **File naming.** UI components and utility modules use lowercase filenames (`button.tsx`, `separator.tsx`, `utils.ts`); the React component symbols inside are PascalCase. Feature/page components (like `App.tsx`) use PascalCase filenames.
- **React 19 JSX transform.** Don’t add `import React from 'react'` purely to enable JSX. Use `import * as React from 'react'` only when you need `React.*` types (e.g., `React.ComponentProps<'button'>`) or use named imports like `import { useState } from 'react'`.
- **Strict TypeScript.** `tsconfig.app.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, `verbatimModuleSyntax`, and `erasableSyntaxOnly`. Use `import type` for type-only imports and remove unused bindings rather than silencing them.
- **Design tokens over raw colors.** Colors, radii, and chart/sidebar tokens are declared in `src/index.css` via `@theme inline`. Reference them through Tailwind utilities (`bg-primary`, `text-foreground`, `border-input`, `rounded-md`, etc.) instead of hard-coding hex or OKLCH values. Dark mode is activated by adding the `dark` class on an ancestor, as defined by the `@custom-variant dark` rule.
- **Icons.** Use `lucide-react`. Buttons auto-size icons to 4×4 via the CVA base classes — don’t override sizes unless you need to.

## Tooling details

- **Vite** (`vite.config.ts`): `@vitejs/plugin-react` (Oxc-based Fast Refresh) and `@tailwindcss/vite`. The only alias is `@` → `./src`.
- **TypeScript**: Root `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`. App code targets `ES2023`, uses `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `noEmit: true` (Vite owns emission). Build info lives under `node_modules/.tmp/`.
- **ESLint** (`eslint.config.js`, flat config): extends `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-react-hooks` flat recommended, and `eslint-plugin-react-refresh` Vite preset. Matches `**/*.{ts,tsx}`, uses browser globals, and globally ignores `dist/`.
- **Tailwind CSS v4**: No `tailwind.config.js` — configuration lives inside `src/index.css` through `@theme inline` and `@custom-variant`.

## What is intentionally absent

Do not invent infrastructure that does not exist. The following are **not** set up, and should be treated as green-field decisions requiring explicit direction before adding:

- No test framework (no Vitest, Jest, Playwright, Testing Library).
- No router (no React Router, TanStack Router, etc.).
- No global state library (no Redux, Zustand, Jotai, Context providers beyond StrictMode).
- No data-fetching layer (no TanStack Query, SWR, Apollo).
- No environment variables — there is no `.env*` file and no usage of `import.meta.env` beyond Vite defaults.
- No CI configuration checked in (no `.github/workflows`).
- No formatter config (no Prettier). Follow the style already present in the files you edit.

## Git workflow

- Default branch appears to be `main` (see `git log`).
- `.gitignore` covers `node_modules/`, `dist/`, `dist-ssr/`, logs, `*.local`, and common IDE files (`.vscode/*`, `.idea/`, `.DS_Store`, vim swap files).
- Before making a commit, run `npm run lint` and `npm run build` and fix any errors the compiler or linter reports — CI is not present to catch them for you.
