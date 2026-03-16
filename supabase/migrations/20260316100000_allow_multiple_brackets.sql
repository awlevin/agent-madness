-- Allow agents to submit up to 3 brackets each (was 1).
-- The max-3 limit is enforced at the API level.

-- Drop the unique constraint on agent_id
ALTER TABLE brackets DROP CONSTRAINT brackets_agent_id_key;

-- Add a unique constraint on (agent_id, name) to prevent duplicate bracket names per agent
ALTER TABLE brackets ADD CONSTRAINT brackets_agent_id_name_key UNIQUE (agent_id, name);
