insert into storage.buckets (id, name, public)
values ('photo-previews', 'photo-previews', true)
on conflict (id) do update set public = true;

create policy "Authenticated users can upload preview photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'photo-previews');

create policy "Authenticated users can update preview photos"
on storage.objects for update
to authenticated
using (bucket_id = 'photo-previews')
with check (bucket_id = 'photo-previews');

create policy "Authenticated users can delete preview photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'photo-previews');

create policy "Anyone can view public preview photos"
on storage.objects for select
to public
using (bucket_id = 'photo-previews');
