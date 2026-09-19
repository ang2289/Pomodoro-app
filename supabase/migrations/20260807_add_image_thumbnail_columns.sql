alter table public.images
add column if not exists thumbnail_url text;

alter table public.images
add column if not exists thumbnail_path text;
