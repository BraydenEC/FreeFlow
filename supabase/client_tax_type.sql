-- FreeFlow — who is paying, so withholding can be computed
--
-- HOW TO RUN
--   Supabase → SQL Editor → New query → paste this file → Run
--
-- Safe to re-run.
--
-- WHY
-- A persona física billing a persona moral does not receive what they
-- invoiced. The payer withholds two thirds of the IVA and 10% of the subtotal
-- and remits both to the SAT directly, so a 10,000 MXN invoice arrives as
-- 9,533.33. Persona física to persona física carries no withholding at all.
--
-- Which of those applies depends entirely on who the client is, so it cannot
-- be inferred from the project — it has to be recorded against it.
--
-- NULL is meaningful here and is the default. It means "not recorded", and
-- the calculation treats it as no withholding. Guessing "probably a company"
-- would quietly tell a freelancer they earned less than they did, which is a
-- worse failure than saying nothing.

alter table public.projects
  add column if not exists client_tax_type text;

alter table public.projects
  drop constraint if exists projects_client_tax_type_check;

alter table public.projects
  add constraint projects_client_tax_type_check
  check (client_tax_type is null
         or client_tax_type in ('persona_fisica', 'persona_moral'));

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect the column listed, the constraint shown, and every existing row null.

select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'projects'
      and column_name = 'client_tax_type') as column_present,
  (select pg_get_constraintdef(oid) from pg_constraint
    where conrelid = 'public.projects'::regclass
      and conname = 'projects_client_tax_type_check') as constraint_def,
  (select count(*) from public.projects where client_tax_type is null) as rows_not_recorded;
