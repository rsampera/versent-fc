create table if not exists public.players (
  id text primary key,
  name text not null,
  shirt_number integer not null,
  card_image_url text,
  player_edit_token text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.player_preferences (
  player_id text primary key references public.players (id) on delete cascade,
  primary_position text not null,
  secondary_position text not null,
  pace integer not null check (pace between 1 and 99),
  shooting integer not null check (shooting between 1 and 99),
  passing integer not null check (passing between 1 and 99),
  dribbling integer not null check (dribbling between 1 and 99),
  defending integer not null check (defending between 1 and 99),
  physical integer not null check (physical between 1 and 99),
  preferred_x integer not null check (preferred_x between 0 and 100),
  preferred_y integer not null check (preferred_y between 0 and 100),
  coverage_width integer not null check (coverage_width between 0 and 100),
  coverage_depth integer not null check (coverage_depth between 0 and 100),
  coverage_bias text not null check (coverage_bias in ('left', 'center', 'right')),
  updated_at timestamptz not null default now()
);

create table if not exists public.lineup_variants (
  id text primary key,
  name text not null,
  label text not null,
  description text not null,
  sort_order integer not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lineup_slots (
  id bigint generated always as identity primary key,
  lineup_variant_id text not null references public.lineup_variants (id) on delete cascade,
  player_id text not null references public.players (id) on delete cascade,
  slot_x integer not null check (slot_x between 0 and 100),
  slot_y integer not null check (slot_y between 0 and 100),
  unique (lineup_variant_id, player_id)
);

create table if not exists public.app_settings (
  id integer primary key default 1,
  manager_token text not null unique,
  check (id = 1)
);

-- Public reads are fine for this one-team companion app.
alter table public.players enable row level security;
alter table public.player_preferences enable row level security;
alter table public.lineup_variants enable row level security;
alter table public.lineup_slots enable row level security;
alter table public.app_settings enable row level security;

create policy "public read players"
on public.players for select
to anon
using (true);

create policy "public read preferences"
on public.player_preferences for select
to anon
using (true);

create policy "public read variants"
on public.lineup_variants for select
to anon
using (true);

create policy "public read slots"
on public.lineup_slots for select
to anon
using (true);

-- Writes should go through Next.js server handlers that validate tokens first.
