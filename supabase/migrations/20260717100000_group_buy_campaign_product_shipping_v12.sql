begin;

alter table public.group_buy_campaigns
  add column if not exists organizer_disclaimer text,
  add column if not exists estimated_earliest_ship_at timestamptz,
  add column if not exists shipping_notice_updated_at timestamptz;

alter table public.group_buy_products
  add column if not exists short_description text,
  add column if not exists long_description text,
  add column if not exists original_price_ntd integer,
  add column if not exists weight_text text,
  add column if not exists dimensions_text text,
  add column if not exists storage_text text,
  add column if not exists vegetarian_text text,
  add column if not exists allergen_text text,
  add column if not exists ingredients_summary text,
  add column if not exists serving_suggestion text,
  add column if not exists product_notice text,
  add column if not exists content_source_checked_at timestamptz,
  add column if not exists content_review_status text not null default 'needs_review',
  add column if not exists image_prompt_json jsonb not null default '{}'::jsonb,
  add column if not exists detail_slug text;

do $constraints$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.group_buy_products'::regclass
       and conname = 'group_buy_products_original_price_ntd_check'
  ) then
    alter table public.group_buy_products
      add constraint group_buy_products_original_price_ntd_check
      check (original_price_ntd is null or original_price_ntd >= 0);
  end if;
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.group_buy_products'::regclass
       and conname = 'group_buy_products_content_review_status_check'
  ) then
    alter table public.group_buy_products
      add constraint group_buy_products_content_review_status_check
      check (content_review_status in ('draft', 'needs_review', 'published', 'rejected'));
  end if;
end
$constraints$;

create unique index if not exists group_buy_products_campaign_detail_slug_uidx
  on public.group_buy_products (campaign_id, detail_slug)
  where detail_slug is not null;

create table if not exists public.group_buy_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.group_buy_products(id) on delete cascade,
  image_type text not null check (image_type in ('hero', 'cutaway', 'lifestyle', 'size_diagram', 'storage_guide', 'package_reference')),
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_active boolean not null default false,
  is_ai_generated boolean not null default false,
  review_status text not null default 'draft' check (review_status in ('draft', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_active or review_status = 'approved')
);

create index if not exists group_buy_product_images_product_sort_idx
  on public.group_buy_product_images (product_id, sort_order, created_at);
create index if not exists group_buy_product_images_public_idx
  on public.group_buy_product_images (product_id, is_active, review_status)
  where is_active = true and review_status = 'approved';

alter table public.group_buy_product_images enable row level security;
revoke all on public.group_buy_product_images from anon, authenticated;

commit;
