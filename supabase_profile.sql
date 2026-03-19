-- ============================================================
-- Readly — Mise à jour profil
-- Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Ajouter les colonnes manquantes au profil
alter table profiles add column if not exists avatar_url  text;
alter table profiles add column if not exists bio         text;
alter table profiles add column if not exists genres      text[]; -- tableau de genres

-- ============================================================
-- Storage pour les avatars
-- Supabase Dashboard > Storage > New bucket
-- Nom : avatars
-- Public : oui (cocher "Public bucket")
-- ============================================================

-- Policy storage avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar visible par tous"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "upload son avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "modifier son avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "supprimer son avatar"
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );
