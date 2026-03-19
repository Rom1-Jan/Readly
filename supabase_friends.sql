-- ============================================================
-- Readly — Système d'amis
-- Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Table des profils publics
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique,
  email      text,
  created_at timestamptz default now()
);

-- Remplir automatiquement le profil à l'inscription
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, username)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Table des demandes d'amis
create table friendships (
  id          uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users(id) on delete cascade not null,
  addressee_id uuid references auth.users(id) on delete cascade not null,
  status      text not null default 'pending', -- pending | accepted | declined
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(requester_id, addressee_id)
);

create trigger friendships_updated_at
  before update on friendships
  for each row execute procedure update_updated_at();

-- RLS profiles — tout le monde peut voir les profils
alter table profiles     enable row level security;
alter table friendships  enable row level security;

create policy "profiles visible par tous"    on profiles    for select using (true);
create policy "profil modifiable par owner"  on profiles    for update using (auth.uid() = id);

create policy "voir ses friendships"         on friendships for select using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "envoyer une demande"          on friendships for insert with check (auth.uid() = requester_id);
create policy "modifier une demande"         on friendships for update using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "supprimer une amitié"         on friendships for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Les amis peuvent voir les livres et sessions des autres
create policy "amis voient livres"
  on books for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from friendships f
      where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = user_id)
        or
        (f.addressee_id = auth.uid() and f.requester_id = user_id)
      )
    )
  );

create policy "amis voient sessions"
  on reading_sessions for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from friendships f
      where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = user_id)
        or
        (f.addressee_id = auth.uid() and f.requester_id = user_id)
      )
    )
  );
