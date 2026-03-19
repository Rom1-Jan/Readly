-- ============================================================
-- Readly — Objectifs & Gamification
-- Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

create table reading_goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  year       int not null,
  target     int not null default 12, -- nombre de livres visé
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, year)
);

alter table reading_goals enable row level security;
create policy "own goals" on reading_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger goals_updated_at
  before update on reading_goals
  for each row execute procedure update_updated_at();
