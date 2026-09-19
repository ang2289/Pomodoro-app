-- Keep legacy product-image prices and bind each relationship plan to its server price.
BEGIN;

ALTER TABLE public.bank_transfer_reports
  DROP CONSTRAINT IF EXISTS bank_transfer_reports_amount_ntd_check;

ALTER TABLE public.bank_transfer_reports
  ADD CONSTRAINT bank_transfer_reports_amount_ntd_check
  CHECK (
    (plan_id = '99' AND amount_ntd = 99)
    OR (plan_id = '199' AND amount_ntd = 199)
    OR (plan_id = 'relationship_pro' AND amount_ntd = 99)
    OR (plan_id = 'relationship_business' AND amount_ntd = 299)
  );

COMMIT;
