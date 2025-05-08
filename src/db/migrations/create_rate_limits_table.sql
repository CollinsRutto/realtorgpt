-- Create rate_limits table for tracking API request limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 1,
  ip_address TEXT,
  last_request TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);

-- Add expiration function to automatically clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete rate limit records older than 7 days
  DELETE FROM public.rate_limits
  WHERE last_request < NOW() - INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup function periodically
DROP TRIGGER IF EXISTS trigger_cleanup_rate_limits ON public.rate_limits;
CREATE TRIGGER trigger_cleanup_rate_limits
  AFTER INSERT ON public.rate_limits
  EXECUTE PROCEDURE cleanup_old_rate_limits();

-- Add RLS policies
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view rate limits
CREATE POLICY "Allow admins to view rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.admin_users
  ));

-- Allow the service role to manage rate limits
CREATE POLICY "Allow service role to manage rate limits"
  ON public.rate_limits
  USING (auth.jwt() ->> 'role' = 'service_role');