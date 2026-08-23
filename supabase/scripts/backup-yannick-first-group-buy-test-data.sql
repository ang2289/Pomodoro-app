-- READ ONLY JSON backup query for the Yannick first group-buy test transactions.
-- Run this BEFORE the reset. Download the single JSON result locally to:
-- backups/group-buy/yannick-first-group-buy-test-data-YYYYMMDD-HHMMSS.json
-- That directory is ignored by Git. Do not paste the result into source control.
--
-- Security:
-- - service-role keys and passwords are never selected.
-- - order access_token_hash and recovery token_hash are deliberately omitted.
-- - customer/order data remains personal data; store the downloaded file securely.
-- - after restoration, issue new order-access credentials instead of restoring old hashes.

with target_campaign as (
  select c.id, c.slug, c.title, c.workspace_id
  from public.group_buy_campaigns c
  where c.slug = 'yannick-first-group-buy'
    and c.id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
    and c.workspace_id = 'd5c44874-8a20-44a3-8505-20bcd39441a3'::uuid
), target_orders as (
  select o.*
  from public.group_buy_orders o
  join target_campaign c on c.id = o.campaign_id
)
select jsonb_pretty(jsonb_build_object(
  'backup_version', 1,
  'created_at', now(),
  'campaign', (select to_jsonb(c) from target_campaign c),
  'security_notes', jsonb_build_array(
    'access_token_hash omitted',
    'recovery token_hash omitted',
    'download only to backups/group-buy/ (Git ignored)'
  ),
  'orders', coalesce((
    select jsonb_agg(to_jsonb(o) - 'access_token_hash' order by o.created_at)
    from target_orders o
  ), '[]'::jsonb),
  'order_items', coalesce((
    select jsonb_agg(to_jsonb(i) order by i.created_at)
    from public.group_buy_order_items i
    join target_orders o on o.id = i.order_id
  ), '[]'::jsonb),
  'payment_reports', coalesce((
    select jsonb_agg(to_jsonb(p) order by p.created_at)
    from public.group_buy_payment_reports p
    join target_orders o on o.id = p.order_id
  ), '[]'::jsonb),
  'order_events', coalesce((
    select jsonb_agg(to_jsonb(e) order by e.created_at)
    from public.group_buy_order_events e
    join target_orders o on o.id = e.order_id
  ), '[]'::jsonb),
  'order_recovery_tokens_without_hash', coalesce((
    select jsonb_agg(to_jsonb(t) - 'token_hash' order by t.created_at)
    from public.group_buy_order_recovery_tokens t
    join target_orders o on o.id = t.order_id
  ), '[]'::jsonb),
  'notifications', coalesce((
    select jsonb_agg(to_jsonb(n) order by n.created_at)
    from public.group_buy_notifications n
    join target_orders o on o.id = n.order_id
    join target_campaign c on c.id = n.campaign_id
  ), '[]'::jsonb)
)) as backup_json;
