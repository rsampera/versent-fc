## Versent FC

FIFA-style squad companion app for a small work football tournament. The current build is scoped to:

- one preloaded squad
- public read-only squad and lineup pages
- token-routed player edit pages
- token-routed manager lineup board
- three saved lineup variants backed by Supabase

The visual direction follows the black, white, and neon green kit.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Public routes:

- `/`
- `/lineups`
- `/players/sampera`

Private player and manager token routes exist, but they are intentionally not listed here because those links are write-capable.

## Build Verification

Use:

```bash
npm run lint
npm run build
```

The build uses `--webpack` because Turbopack can fail inside this sandbox even when the app code is valid.

## Data Model

The schema lives in [supabase/schema.sql](/Users/rodsampera/Documents/development/versent-fc/supabase/schema.sql).

The initial roster and lineup inserts live in [supabase/seed.sql](/Users/rodsampera/Documents/development/versent-fc/supabase/seed.sql).

Shared domain types and helpers live in [src/lib/site-data.ts](/Users/rodsampera/Documents/development/versent-fc/src/lib/site-data.ts).

The live Supabase REST data access layer lives in [src/lib/supabase-data.ts](/Users/rodsampera/Documents/development/versent-fc/src/lib/supabase-data.ts).

## Environment

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

Optional for later browser-side Supabase usage:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Next Steps

- replace `card_image_url` nulls in the `players` table with your real card assets
- decide how you want to distribute the private player edit links and the private manager link
- optionally add a “set featured lineup” action so the manager can change the public default variant
