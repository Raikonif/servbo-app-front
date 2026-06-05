# servbo-app-front

A Next.js frontend application with TypeScript and Tailwind CSS.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16.2.6 (App Router)
- **UI**: [React](https://react.dev) 19.2.6
- **Styling**: [Tailwind CSS](https://tailwindcss.com) 4.3.0
- **Language**: [TypeScript](https://www.typescriptlang.org) 6.0.3
- **Formatting/Linting**: [Biome](https://biomejs.dev) 2.4.16

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Code Quality

```bash
# Lint and type-check
npm run lint

# Format code
npm run format
```

## Project Structure

- `src/app/` — Next.js App Router pages and layouts
- `src/app/page.tsx` — Main page component
- `src/app/layout.tsx` — Root layout
- `src/app/globals.css` — Global styles (Tailwind CSS)
- `biome.json` — Biome configuration (linting, formatting, import organization)
- `next.config.ts` — Next.js configuration
- `tsconfig.json` — TypeScript configuration with `@/*` path alias → `./src/*`
