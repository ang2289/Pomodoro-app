select
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'group_buy_workspaces',
    'group_buy_campaigns',
    'group_buy_products',
    'group_buy_product_images',
    'group_buy_orders',
    'group_buy_order_events',
    'group_buy_campaign_events',
    'group_buy_notifications',
    'group_buy_payment_reports',
    'group_buy_shipping_methods',
    'group_buy_order_items'
  )
order by table_name, ordinal_position;

select
  cls.relname as table_name,
  c.conname as constraint_name,
  c.contype as constraint_type,
  pg_get_constraintdef(c.oid, true) as definition
from pg_constraint c
join pg_class cls on cls.oid = c.conrelid
join pg_namespace ns on ns.oid = cls.relnamespace
where ns.nspname = 'public'
  and cls.relname like 'group_buy_%'
order by table_name, constraint_name;

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename like 'group_buy_%'
order by tablename, indexname;
