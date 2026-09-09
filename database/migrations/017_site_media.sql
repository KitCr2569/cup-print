CREATE TABLE IF NOT EXISTS site_media (
  media_key text PRIMARY KEY,
  storage_path text NOT NULL,
  content_type text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
