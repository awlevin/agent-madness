-- Secure agent API keys from public access
-- The existing "Public read agents" policy exposes api_key to anyone
-- querying via the Supabase anon key. Since RLS is row-level only and
-- cannot restrict columns, we use a view to expose only safe columns.

-- 1. Drop the overly permissive public read policy on agents
DROP POLICY "Public read agents" ON agents;

-- 2. Create a public view that excludes the api_key column
CREATE VIEW agents_public AS
  SELECT id, name, avatar_url, description, created_at
  FROM agents;

-- 3. Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON agents_public TO anon, authenticated;
