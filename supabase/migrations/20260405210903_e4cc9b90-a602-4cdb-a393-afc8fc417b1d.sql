
CREATE TABLE public.broker_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metaapi_account_id TEXT NOT NULL,
  login TEXT NOT NULL,
  server_name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'mt5',
  account_name TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, metaapi_account_id)
);

ALTER TABLE public.broker_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own broker accounts" ON public.broker_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own broker accounts" ON public.broker_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own broker accounts" ON public.broker_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own broker accounts" ON public.broker_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);
