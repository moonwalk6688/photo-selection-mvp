create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  studio_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles(id) on delete cascade,
  client_name text not null,
  shoot_type text not null,
  shoot_date date,
  title text not null,
  description text,
  max_select_count integer not null default 30 check (max_select_count > 0),
  access_password_hash text,
  share_token text not null unique,
  allow_resubmit boolean not null default false,
  is_submitted boolean not null default false,
  submitted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  display_filename text not null,
  original_basename text not null,
  camera_sequence text,
  preview_url text not null,
  storage_path text not null,
  sort_order integer not null default 0,
  uploaded_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.photo_selections (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  is_selected boolean not null default true,
  client_note text,
  selected_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(album_id, photo_id)
);

create index if not exists albums_photographer_id_idx on public.albums(photographer_id);
create index if not exists albums_share_token_idx on public.albums(share_token);
create index if not exists photos_album_id_idx on public.photos(album_id);
create index if not exists photo_selections_album_id_idx on public.photo_selections(album_id);
create index if not exists photo_selections_photo_id_idx on public.photo_selections(photo_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
