-- Adds service-role-only transactional primitives used by the Phase 2 Preview.
-- This migration changes function definitions/permissions only. It does not rewrite existing rows.

begin;

create or replace function public.consume_credits(
  p_user_id uuid,
  p_chars integer
)
returns table(remaining_chars integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_before integer;
  v_after integer;
begin
  if p_user_id is null then
    raise exception using errcode = '22023', message = 'INVALID_USER_ID';
  end if;
  if p_chars is null or p_chars <= 0 then
    raise exception using errcode = '22023', message = 'INVALID_CREDIT_AMOUNT';
  end if;

  select uc.remaining_chars into v_before
    from public.user_credits as uc
   where uc.user_id = p_user_id
   for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'USER_CREDITS_NOT_FOUND';
  end if;
  if v_before < p_chars then
    raise exception using errcode = 'P0001', message = 'INSUFFICIENT_CREDITS';
  end if;

  update public.user_credits as uc
     set remaining_chars = uc.remaining_chars - p_chars,
         updated_at = statement_timestamp()
   where uc.user_id = p_user_id
  returning uc.remaining_chars into v_after;

  insert into public.usage_logs (
    user_id, feature, total_chars, input_chars, output_chars,
    before_remaining, after_remaining, meta
  ) values (
    p_user_id, 'legacy', p_chars, p_chars, 0, v_before, v_after,
    jsonb_build_object('source', 'consume_credits_legacy')
  );

  return query select v_after;
end;
$function$;

create or replace function public.consume_credits(
  p_user_id uuid,
  p_input_chars integer,
  p_output_chars integer,
  p_feature text
)
returns table(remaining_chars integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_total integer;
  v_before integer;
  v_after integer;
begin
  if p_user_id is null then
    raise exception using errcode = '22023', message = 'INVALID_USER_ID';
  end if;
  if coalesce(p_input_chars, -1) < 0 or coalesce(p_output_chars, -1) < 0 then
    raise exception using errcode = '22023', message = 'INVALID_CHAR_COUNT';
  end if;
  v_total := p_input_chars + p_output_chars;
  if v_total <= 0 then
    raise exception using errcode = '22023', message = 'INVALID_CREDIT_AMOUNT';
  end if;
  if p_feature is null or btrim(p_feature) = '' or length(p_feature) > 100 then
    raise exception using errcode = '22023', message = 'INVALID_FEATURE';
  end if;

  select uc.remaining_chars into v_before
    from public.user_credits as uc
   where uc.user_id = p_user_id
   for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'USER_CREDITS_NOT_FOUND';
  end if;
  if v_before < v_total then
    raise exception using errcode = 'P0001', message = 'INSUFFICIENT_CREDITS';
  end if;

  update public.user_credits as uc
     set remaining_chars = uc.remaining_chars - v_total,
         updated_at = statement_timestamp()
   where uc.user_id = p_user_id
  returning uc.remaining_chars into v_after;

  insert into public.usage_logs (
    user_id, feature, total_chars, input_chars, output_chars,
    before_remaining, after_remaining, meta
  ) values (
    p_user_id, btrim(p_feature), v_total, p_input_chars, p_output_chars,
    v_before, v_after, '{}'::jsonb
  );

  return query select v_after;
end;
$function$;

create or replace function public.consume_credits_with_meta(
  p_user_id uuid,
  p_amount integer,
  p_feature text,
  p_input_chars integer default 0,
  p_output_chars integer default 0,
  p_meta jsonb default '{}'::jsonb
)
returns table(before_remaining integer, after_remaining integer, remaining_chars integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_before integer;
  v_after integer;
begin
  if p_user_id is null then
    raise exception using errcode = '22023', message = 'INVALID_USER_ID';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception using errcode = '22023', message = 'INVALID_CREDIT_AMOUNT';
  end if;
  if p_feature is null or btrim(p_feature) = '' or length(p_feature) > 100 then
    raise exception using errcode = '22023', message = 'INVALID_FEATURE';
  end if;
  if coalesce(p_input_chars, 0) < 0 or coalesce(p_output_chars, 0) < 0 then
    raise exception using errcode = '22023', message = 'INVALID_CHAR_COUNT';
  end if;
  if p_meta is null or jsonb_typeof(p_meta) <> 'object' then
    raise exception using errcode = '22023', message = 'INVALID_METADATA';
  end if;

  select uc.remaining_chars
    into v_before
    from public.user_credits as uc
   where uc.user_id = p_user_id
   for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'USER_CREDITS_NOT_FOUND';
  end if;
  if v_before < p_amount then
    raise exception using errcode = 'P0001', message = 'INSUFFICIENT_CREDITS';
  end if;

  update public.user_credits as uc
     set remaining_chars = uc.remaining_chars - p_amount,
         updated_at = statement_timestamp()
   where uc.user_id = p_user_id
  returning uc.remaining_chars into v_after;

  insert into public.usage_logs (
    user_id, feature, total_chars, input_chars, output_chars,
    before_remaining, after_remaining, meta
  ) values (
    p_user_id, btrim(p_feature), p_amount, coalesce(p_input_chars, 0),
    coalesce(p_output_chars, 0), v_before, v_after, p_meta
  );

  return query select v_before, v_after, v_after;
end;
$function$;

revoke all on function public.consume_credits_with_meta(uuid, integer, text, integer, integer, jsonb)
  from public, anon, authenticated;
grant execute on function public.consume_credits_with_meta(uuid, integer, text, integer, integer, jsonb)
  to service_role;

create or replace function public.complete_ecpay_purchase(
  p_order_no text,
  p_reported_amount integer
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_order public.purchase_logs%rowtype;
  v_before integer;
  v_after integer;
begin
  if p_order_no is null or btrim(p_order_no) = '' or length(p_order_no) > 100 then
    raise exception using errcode = '22023', message = 'INVALID_ORDER_NO';
  end if;
  if p_reported_amount is null or p_reported_amount <= 0 then
    raise exception using errcode = '22023', message = 'INVALID_REPORTED_AMOUNT';
  end if;

  select pl.*
    into v_order
    from public.purchase_logs as pl
   where pl.order_no = btrim(p_order_no)
   for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'ORDER_NOT_FOUND';
  end if;
  if v_order.status in ('success', 'paid') then
    return jsonb_build_object(
      'applied', false,
      'reason', 'already_completed',
      'order_no', v_order.order_no
    );
  end if;
  if v_order.status is distinct from 'pending' then
    raise exception using errcode = 'P0001', message = 'ORDER_NOT_PENDING';
  end if;
  if v_order.amount is null or v_order.amount <= 0 or v_order.amount <> p_reported_amount then
    raise exception using errcode = 'P0001', message = 'ORDER_AMOUNT_MISMATCH';
  end if;
  if v_order.points is null or v_order.points <= 0 or v_order.user_id is null then
    raise exception using errcode = 'P0001', message = 'INVALID_STORED_ORDER';
  end if;

  select uc.remaining_chars
    into v_before
    from public.user_credits as uc
   where uc.user_id = v_order.user_id
   for update;

  if found then
    update public.user_credits as uc
       set remaining_chars = uc.remaining_chars + v_order.points,
           updated_at = statement_timestamp()
     where uc.user_id = v_order.user_id
    returning uc.remaining_chars into v_after;
  else
    insert into public.user_credits (user_id, remaining_chars, created_at, updated_at)
    values (v_order.user_id, v_order.points, statement_timestamp(), statement_timestamp())
    returning remaining_chars into v_after;
    v_before := 0;
  end if;

  update public.purchase_logs as pl
     set status = 'success'
   where pl.id = v_order.id;

  return jsonb_build_object(
    'applied', true,
    'order_no', v_order.order_no,
    'amount', v_order.amount,
    'points', v_order.points,
    'before_remaining', v_before,
    'after_remaining', v_after
  );
end;
$function$;

revoke all on function public.complete_ecpay_purchase(text, integer)
  from public, anon, authenticated;
grant execute on function public.complete_ecpay_purchase(text, integer)
  to service_role;

commit;
