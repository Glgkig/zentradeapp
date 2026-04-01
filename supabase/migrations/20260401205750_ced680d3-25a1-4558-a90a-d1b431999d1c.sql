-- Remove the fully public SELECT policy
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Add authenticated-only read policy
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
