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
