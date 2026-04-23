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
