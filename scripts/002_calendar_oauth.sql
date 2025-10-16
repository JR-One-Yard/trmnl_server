-- OAuth tokens table for Google Calendar integration (future use)
CREATE TABLE IF NOT EXISTS oauth_google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_label TEXT NOT NULL DEFAULT 'default',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT NOT NULL,
  token_type TEXT NOT NULL,
  expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Selected calendars table (future use)
CREATE TABLE IF NOT EXISTS gcal_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_calendar_id TEXT NOT NULL,
  summary TEXT,
  selected BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick token lookup
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user ON oauth_google_tokens(user_label);
CREATE INDEX IF NOT EXISTS idx_gcal_selected ON gcal_calendars(selected) WHERE selected = TRUE;
