-- trade-screenshots SELECT
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
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);