
-- Storage bucket for raw uploaded files (PDF/DOCX/TXT), private, 50MB limit
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  false,
  52428800,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  public = excluded.public;

-- RLS: users can only touch files under their own uid prefix
create policy "Users read own uploads"
  on storage.objects for select to authenticated
  using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users insert own uploads"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own uploads"
  on storage.objects for update to authenticated
  using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own uploads"
  on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- Processing state on modules
alter table public.modules
  add column if not exists processing_state text not null default 'ready',
  add column if not exists processing_started_at timestamptz,
  add column if not exists processing_error text,
  add column if not exists storage_path text;
