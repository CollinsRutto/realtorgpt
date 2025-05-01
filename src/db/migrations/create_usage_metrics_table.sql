-- Create usage metrics table
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS usage_metrics_user_id_idx ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS usage_metrics_timestamp_idx ON usage_metrics(timestamp);

-- Create usage summary view
CREATE OR REPLACE VIEW user_usage_summary AS
SELECT 
  user_id,
  DATE_TRUNC('day', timestamp) AS day,
  SUM(input_tokens) AS daily_input_tokens,
  SUM(output_tokens) AS daily_output_tokens,
  SUM(total_tokens) AS daily_total_tokens,
  COUNT(*) AS request_count
FROM usage_metrics
GROUP BY user_id, DATE_TRUNC('day', timestamp);

-- Create function to get user's current month usage
CREATE OR REPLACE FUNCTION get_current_month_usage(user_uuid UUID)
RETURNS TABLE (
  total_tokens BIGINT,
  input_tokens BIGINT,
  output_tokens BIGINT,
  request_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(um.total_tokens)::BIGINT,
    SUM(um.input_tokens)::BIGINT,
    SUM(um.output_tokens)::BIGINT,
    COUNT(*)::BIGINT
  FROM usage_metrics um
  WHERE 
    um.user_id = user_uuid AND
    um.timestamp >= DATE_TRUNC('month', CURRENT_DATE) AND
    um.timestamp < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;