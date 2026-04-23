-- Trigger: send welcome email via Edge Function on new user signup
-- This fires when a new row is inserted into auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user_welcome()
RETURNS trigger AS $$
BEGIN
  -- Fire-and-forget: call the welcome-email Edge Function
  -- Uses pg_net extension (available on Supabase)
  PERFORM net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'name', COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never fail the signup because of email
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_welcome();
