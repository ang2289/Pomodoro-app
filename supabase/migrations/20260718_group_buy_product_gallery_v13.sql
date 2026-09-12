begin;

alter table public.group_buy_product_images
  add column if not exists generation_prompt text;

do $constraints$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
      from pg_constraint con
     where con.conrelid = 'public.group_buy_product_images'::regclass
       and con.contype = 'c'
       and pg_get_constraintdef(con.oid) ilike '%image_type%'
  loop
    execute format('alter table public.group_buy_product_images drop constraint %I', constraint_name);
  end loop;

  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.group_buy_product_images'::regclass
       and conname = 'group_buy_product_images_image_type_v13_check'
  ) then
    alter table public.group_buy_product_images
      add constraint group_buy_product_images_image_type_v13_check
      check (image_type in (
        'hero', 'cutaway', 'size_diagram',
        'afternoon_tea', 'family_lakeside', 'office_sharing'
      ));
  end if;
end
$constraints$;

create index if not exists group_buy_product_images_product_idx
  on public.group_buy_product_images (product_id);

create index if not exists group_buy_product_images_product_sort_v13_idx
  on public.group_buy_product_images (product_id, sort_order);

commit;
