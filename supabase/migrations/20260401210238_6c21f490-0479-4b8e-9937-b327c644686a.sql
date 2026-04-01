
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
