-- Add reflection/journaling fields to trades table
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS confirmations text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS followed_rules boolean,
  ADD COLUMN IF NOT EXISTS psychology_notes text;
