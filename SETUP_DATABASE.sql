
-- ============================================
-- TABLE 1: profiles
-- ============================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  experience_years int2 CHECK (experience_years BETWEEN 1 AND 30),
  account_size numeric(12,2),
  trading_style text CHECK (trading_style IN ('scalping','day_trading','swing','position')),
  primary_instruments text[],
  goals text,
  timezone text DEFAULT 'Asia/Jerusalem',
  avatar_url text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- TABLE 2: trades
-- ============================================
CREATE TABLE public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  asset_class text CHECK (asset_class IN ('forex','indices','crypto','commodities','stocks')),
  direction text CHECK (direction IN ('long','short')),
  entry_price numeric(18,8) NOT NULL,
  exit_price numeric(18,8),
  stop_loss numeric(18,8),
  take_profit numeric(18,8),
  lot_size numeric(10,4) NOT NULL,
  pnl numeric(12,2),
  pnl_pct numeric(8,4),
  status text CHECK (status IN ('open','closed','cancelled')) DEFAULT 'open',
  entry_time timestamptz NOT NULL,
  exit_time timestamptz,
  timeframe text,
  setup_type text,
  notes text,
  screenshots text[],
  tags text[],
  rating int2 CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades" ON public.trades
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trades
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trades
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_trades_user_entry ON public.trades(user_id, entry_time DESC);
CREATE INDEX idx_trades_user_status ON public.trades(user_id, status);
CREATE INDEX idx_trades_user_symbol ON public.trades(user_id, symbol);

-- ============================================
-- TABLE 3: behavioral_sessions
-- ============================================
CREATE TABLE public.behavioral_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_start timestamptz NOT NULL DEFAULT now(),
  session_end timestamptz,
  mouse_event_count int4 DEFAULT 0,
  rapid_click_count int4 DEFAULT 0,
  avg_click_interval_ms numeric(10,2),
  screen_switches int4 DEFAULT 0,
  stress_score numeric(5,2),
  fomo_detected boolean DEFAULT false,
  peak_stress_time timestamptz,
  trades_during_session int4 DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.behavioral_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.behavioral_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.behavioral_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE 4: behavioral_events
-- ============================================
CREATE TABLE public.behavioral_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid REFERENCES public.behavioral_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text CHECK (event_type IN ('rapid_click','erratic_mouse','fast_scroll','repeated_chart_switch','prolonged_stare','tab_switch')),
  event_time timestamptz DEFAULT now(),
  metadata jsonb
);

ALTER TABLE public.behavioral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON public.behavioral_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.behavioral_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_behavioral_events_user_time ON public.behavioral_events(user_id, event_time DESC);
CREATE INDEX idx_behavioral_events_session ON public.behavioral_events(session_id);

-- ============================================
-- TABLE 5: ai_alerts
-- ============================================
CREATE TABLE public.ai_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.behavioral_sessions(id),
  alert_type text CHECK (alert_type IN ('fomo_warning','stress_high','impulse_risk','revenge_trade_risk','overtrading','take_a_break')),
  message text NOT NULL,
  stress_score_at_alert numeric(5,2),
  acknowledged boolean DEFAULT false,
  acknowledged_at timestamptz,
  action_taken text CHECK (action_taken IN ('ignored','paused','closed_platform','continued')),
  triggered_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.ai_alerts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.ai_alerts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.ai_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_alerts_user_time ON public.ai_alerts(user_id, triggered_at DESC);

-- ============================================
-- TABLE 6: ai_insights
-- ============================================
CREATE TABLE public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insight_type text CHECK (insight_type IN ('daily_summary','trade_review','weekly_pattern','behavioral_correlation','improvement_tip')),
  related_trade_id uuid REFERENCES public.trades(id) ON DELETE SET NULL,
  related_session_id uuid REFERENCES public.behavioral_sessions(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  metrics jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON public.ai_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.ai_insights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_ai_insights_user_time ON public.ai_insights(user_id, created_at DESC);

-- ============================================
-- TABLE 7: mental_journal
-- ============================================
CREATE TABLE public.mental_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trade_id uuid REFERENCES public.trades(id) ON DELETE SET NULL,
  mood_before int2 CHECK (mood_before BETWEEN 1 AND 10),
  mood_after int2 CHECK (mood_after BETWEEN 1 AND 10),
  emotional_state text CHECK (emotional_state IN ('calm','focused','anxious','fearful','greedy','confident','frustrated','overconfident','bored')),
  note text,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE public.mental_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal" ON public.mental_journal
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" ON public.mental_journal
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON public.mental_journal
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON public.mental_journal
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TABLE 8: economic_events
-- ============================================
CREATE TABLE public.economic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  country text NOT NULL,
  currency text,
  impact_level text CHECK (impact_level IN ('high','medium','low')),
  event_time timestamptz NOT NULL,
  actual_value text,
  forecast_value text,
  previous_value text,
  source_api text,
  raw_payload jsonb,
  fetched_at timestamptz DEFAULT now()
);

ALTER TABLE public.economic_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view events" ON public.economic_events
  FOR SELECT TO authenticated USING (true);

CREATE INDEX idx_economic_events_time ON public.economic_events(event_time DESC);
CREATE INDEX idx_economic_events_currency_time ON public.economic_events(currency, event_time);

-- ============================================
-- TABLE 9: watchlist
-- ============================================
CREATE TABLE public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  asset_class text,
  display_order int2,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlist" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlist" ON public.watchlist
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlist" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- 1. handle_new_user: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. update_updated_at: generic trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. calculate_pnl: auto-compute PnL when exit_price is set
CREATE OR REPLACE FUNCTION public.calculate_pnl()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  direction_multiplier numeric;
  user_account_size numeric;
BEGIN
  -- Only calculate when exit_price is newly set
  IF NEW.exit_price IS NOT NULL AND (OLD.exit_price IS NULL OR OLD.exit_price IS DISTINCT FROM NEW.exit_price) THEN
    -- Direction multiplier
    IF NEW.direction = 'long' THEN
      direction_multiplier := 1;
    ELSIF NEW.direction = 'short' THEN
      direction_multiplier := -1;
    ELSE
      direction_multiplier := 1;
    END IF;

    -- Calculate PnL
    NEW.pnl := (NEW.exit_price - NEW.entry_price) * NEW.lot_size * direction_multiplier;

    -- Get account size for pnl_pct
    SELECT account_size INTO user_account_size
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF user_account_size IS NOT NULL AND user_account_size > 0 THEN
      NEW.pnl_pct := (NEW.pnl / user_account_size) * 100;
    END IF;

    -- Auto-close trade
    IF NEW.status = 'open' THEN
      NEW.status := 'closed';
    END IF;

    IF NEW.exit_time IS NULL THEN
      NEW.exit_time := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_trade_pnl
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.calculate_pnl();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('trade-screenshots', 'trade-screenshots', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- trade-screenshots policies (private, user-scoped)
CREATE POLICY "Users can view own screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own screenshots" ON storage.objects
  FOR DELETE USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- avatars policies (public read, user-scoped write)
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);-- Remove the fully public SELECT policy
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Add authenticated-only read policy
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- ===================== TRADES =====================
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;

CREATE POLICY "Users can view own trades" ON public.trades FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trades FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trades FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===================== PROFILES =====================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ===================== BEHAVIORAL_SESSIONS =====================
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.behavioral_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.behavioral_sessions;

CREATE POLICY "Users can view own sessions" ON public.behavioral_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.behavioral_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.behavioral_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.behavioral_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===================== BEHAVIORAL_EVENTS =====================
DROP POLICY IF EXISTS "Users can insert own events" ON public.behavioral_events;
DROP POLICY IF EXISTS "Users can view own events" ON public.behavioral_events;

CREATE POLICY "Users can view own events" ON public.behavioral_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.behavioral_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===================== AI_ALERTS =====================
DROP POLICY IF EXISTS "Users can view own alerts" ON public.ai_alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON public.ai_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON public.ai_alerts;

CREATE POLICY "Users can view own alerts" ON public.ai_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.ai_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.ai_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===================== AI_INSIGHTS =====================
DROP POLICY IF EXISTS "Users can view own insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Users can update own insights" ON public.ai_insights;

CREATE POLICY "Users can view own insights" ON public.ai_insights FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.ai_insights FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===================== MENTAL_JOURNAL =====================
DROP POLICY IF EXISTS "Users can view own journal" ON public.mental_journal;
DROP POLICY IF EXISTS "Users can insert own journal" ON public.mental_journal;
DROP POLICY IF EXISTS "Users can update own journal" ON public.mental_journal;
DROP POLICY IF EXISTS "Users can delete own journal" ON public.mental_journal;

CREATE POLICY "Users can view own journal" ON public.mental_journal FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" ON public.mental_journal FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON public.mental_journal FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON public.mental_journal FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===================== WATCHLIST =====================
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can insert own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can update own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can delete own watchlist" ON public.watchlist;

CREATE POLICY "Users can view own watchlist" ON public.watchlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlist" ON public.watchlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlist" ON public.watchlist FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlist" ON public.watchlist FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- Remove old public policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;

-- Only authenticated owner can read their avatar
CREATE POLICY "authenticated_avatar_read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Only owner can upload avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "owner_avatar_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);UPDATE storage.buckets SET public = false WHERE id = 'avatars';-- trade-screenshots SELECT
DROP POLICY IF EXISTS "Users can view own screenshots" ON storage.objects;
CREATE POLICY "Users can view own screenshots" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- trade-screenshots INSERT
DROP POLICY IF EXISTS "Users can upload own screenshots" ON storage.objects;
CREATE POLICY "Users can upload own screenshots" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- trade-screenshots DELETE
DROP POLICY IF EXISTS "Users can delete own screenshots" ON storage.objects;
CREATE POLICY "Users can delete own screenshots" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- avatars UPDATE
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);CREATE POLICY "Users can update own events" ON behavioral_events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON behavioral_events FOR DELETE TO authenticated USING (auth.uid() = user_id);ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS polar_customer_id text DEFAULT NULL;ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
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
-- Chat history table for AI mentor memory
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_created
  ON chat_history(user_id, created_at DESC);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chat history"
  ON chat_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to chat_history"
  ON chat_history FOR ALL USING (true);
-- Add reflection/journaling fields to trades table
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS confirmations text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS followed_rules boolean,
  ADD COLUMN IF NOT EXISTS psychology_notes text;
-- Economic events cache — stores events fetched from Forex Factory
-- Accumulates over time so we can return a full 30-day window
CREATE TABLE IF NOT EXISTS public.economic_events_cache (
  id           text PRIMARY KEY,          -- sha: title|date|country
  title        text NOT NULL,
  title_he     text,
  country      text,
  flag         text,
  region       text,
  event_date   timestamptz NOT NULL,
  impact       text,
  forecast     text,
  previous     text,
  actual       text,
  fetched_at   timestamptz DEFAULT now()
);

ALTER TABLE public.economic_events_cache ENABLE ROW LEVEL SECURITY;

-- Anyone (authenticated or anon) may read
CREATE POLICY "public_read_economic_events"
  ON public.economic_events_cache FOR SELECT USING (true);

-- Only service role may write (edge function uses service key)
CREATE POLICY "service_write_economic_events"
  ON public.economic_events_cache FOR ALL USING (true) WITH CHECK (true);

-- Index for fast date range queries
CREATE INDEX IF NOT EXISTS idx_eec_event_date ON public.economic_events_cache (event_date);
-- Extended onboarding profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type      text,
  ADD COLUMN IF NOT EXISTS trading_methods   text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trading_sessions  text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS min_confirmations integer,
  ADD COLUMN IF NOT EXISTS weaknesses        text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS risk_per_trade    text;
