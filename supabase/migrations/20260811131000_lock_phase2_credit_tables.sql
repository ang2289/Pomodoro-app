-- Apply only after the Phase 2 API/Edge frontend cutover has passed Preview testing.
-- ACL/RLS only: no row data is deleted or rewritten.

begin;

alter table if exists public.user_credits enable row level security;
alter table if exists public.usage_logs enable row level security;
alter table if exists public.purchase_logs enable row level security;

revoke all privileges on table public.user_credits from anon, authenticated;
revoke all privileges on table public.usage_logs from anon, authenticated;
revoke all privileges on table public.purchase_logs from anon, authenticated;

revoke execute on function public.consume_credits(uuid, integer) from public, anon, authenticated;
revoke execute on function public.consume_credits(uuid, integer, integer, text) from public, anon, authenticated;
revoke execute on function public.get_user_credits_info(uuid) from public, anon, authenticated;
revoke execute on function public.check_and_deduct_credits(uuid, integer, text) from public, anon, authenticated;
revoke execute on function public.init_user_credits_if_missing(uuid) from public, anon, authenticated;
revoke execute on function public.init_user_credits_if_not_exists(uuid, integer) from public, anon, authenticated;
revoke execute on function public.process_payment_and_add_credits(uuid) from public, anon, authenticated;
revoke execute on function public.grant_storefront_for_purchase_log(text, uuid) from public, anon, authenticated;
revoke execute on function public.sync_product_image_generation_from_usage_log() from public, anon, authenticated;

-- Trigger execution does not use caller EXECUTE privileges. The trigger-only sync function
-- remains attached to its trigger, while direct API execution is removed.
alter function public.consume_credits(uuid, integer) set search_path = pg_catalog, public;
alter function public.consume_credits(uuid, integer, integer, text) set search_path = pg_catalog, public;
alter function public.get_user_credits_info(uuid) set search_path = pg_catalog, public;
alter function public.check_and_deduct_credits(uuid, integer, text) set search_path = pg_catalog, public;
alter function public.init_user_credits_if_missing(uuid) set search_path = pg_catalog, public;
alter function public.init_user_credits_if_not_exists(uuid, integer) set search_path = pg_catalog, public;
alter function public.process_payment_and_add_credits(uuid) set search_path = pg_catalog, public;
alter function public.grant_storefront_for_purchase_log(text, uuid) set search_path = pg_catalog, public;
alter function public.sync_product_image_generation_from_usage_log() set search_path = pg_catalog, public;

grant execute on function public.consume_credits(uuid, integer) to service_role;
grant execute on function public.consume_credits(uuid, integer, integer, text) to service_role;
grant execute on function public.get_user_credits_info(uuid) to service_role;
grant execute on function public.check_and_deduct_credits(uuid, integer, text) to service_role;
grant execute on function public.init_user_credits_if_missing(uuid) to service_role;
grant execute on function public.init_user_credits_if_not_exists(uuid, integer) to service_role;
grant execute on function public.process_payment_and_add_credits(uuid) to service_role;
grant execute on function public.grant_storefront_for_purchase_log(text, uuid) to service_role;
grant execute on function public.sync_product_image_generation_from_usage_log() to service_role;
grant execute on function public.consume_credits_with_meta(uuid, integer, text, integer, integer, jsonb) to service_role;
grant execute on function public.complete_ecpay_purchase(text, integer) to service_role;

commit;
