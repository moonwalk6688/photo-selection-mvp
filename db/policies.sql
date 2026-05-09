alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.photo_selections enable row level security;

create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can create own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Photographer can view own albums"
on public.albums for select
using (auth.uid() = photographer_id);

create policy "Photographer can create own albums"
on public.albums for insert
with check (auth.uid() = photographer_id);

create policy "Photographer can update own albums"
on public.albums for update
using (auth.uid() = photographer_id)
with check (auth.uid() = photographer_id);

create policy "Photographer can delete own albums"
on public.albums for delete
using (auth.uid() = photographer_id);

create policy "Photographer can view own album photos"
on public.photos for select
using (
  exists (
    select 1 from public.albums
    where albums.id = photos.album_id
    and albums.photographer_id = auth.uid()
  )
);

create policy "Photographer can create own album photos"
on public.photos for insert
with check (
  exists (
    select 1 from public.albums
    where albums.id = photos.album_id
    and albums.photographer_id = auth.uid()
  )
);

create policy "Photographer can delete own album photos"
on public.photos for delete
using (
  exists (
    select 1 from public.albums
    where albums.id = photos.album_id
    and albums.photographer_id = auth.uid()
  )
);

create policy "Photographer can view own selections"
on public.photo_selections for select
using (
  exists (
    select 1 from public.albums
    where albums.id = photo_selections.album_id
    and albums.photographer_id = auth.uid()
  )
);
