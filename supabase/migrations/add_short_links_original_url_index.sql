-- 加速依 original_url 查詢既有短網址（去重）
create index if not exists idx_short_links_original_url on public.short_links (original_url);
