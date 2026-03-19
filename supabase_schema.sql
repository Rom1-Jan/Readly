-- ============================================================
-- Readly — Schema SQL
-- Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

create table books (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  google_id     text,
  title         text not null,
  author        text,
  cover_url     text,
  total_pages   int default 0,
  current_page  int default 0,
  status        text not null default 'to_read', -- to_read | reading | done
  rating        int,                              -- 1 à 5
  review        text,
  started_at    date,
  finished_at   date,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table reading_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  book_id     uuid references books(id) on delete cascade not null,
  pages_read  int not null default 0,
  duration    int not null default 0, -- en minutes
  note        text,
  session_at  timestamptz default now()
);

-- updated_at auto
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger books_updated_at
  before update on books
  for each row execute procedure update_updated_at();

-- RLS
alter table books            enable row level security;
alter table reading_sessions enable row level security;

create policy "own books"    on books            for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions" on reading_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
