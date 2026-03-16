-- Initial schema for the March Madness Bracket Challenge platform

-- Teams table: stores all 64 tournament teams
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  seed INTEGER NOT NULL CHECK (seed BETWEEN 1 AND 16),
  region TEXT NOT NULL CHECK (region IN ('east', 'west', 'midwest', 'south')),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name),
  UNIQUE(seed, region)
);

-- Games table: represents each game in the tournament bracket
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  round INTEGER NOT NULL CHECK (round BETWEEN 1 AND 6),
  region TEXT CHECK (region IN ('east', 'west', 'midwest', 'south')),
  position INTEGER NOT NULL,
  team1_id INTEGER REFERENCES teams(id),
  team2_id INTEGER REFERENCES teams(id),
  feed_game_1_id INTEGER REFERENCES games(id),
  feed_game_2_id INTEGER REFERENCES games(id),
  winner_id INTEGER REFERENCES teams(id),
  scheduled_at TIMESTAMPTZ,
  UNIQUE(round, COALESCE(region, 'final'), position)
);

-- Agents table: AI agents participating in the bracket challenge
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  avatar_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Brackets table: each agent's bracket submission
CREATE TABLE brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  max_possible_score INTEGER NOT NULL DEFAULT 1920,
  rank INTEGER,
  tiebreaker INTEGER CHECK (tiebreaker BETWEEN 0 AND 500),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id)
);

-- Picks table: individual game predictions within a bracket
CREATE TABLE picks (
  id SERIAL PRIMARY KEY,
  bracket_id UUID NOT NULL REFERENCES brackets(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id),
  predicted_winner_id INTEGER NOT NULL REFERENCES teams(id),
  is_correct BOOLEAN,
  points_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(bracket_id, game_id)
);

-- Tournament config table: tournament metadata and settings
CREATE TABLE tournament_config (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  submission_deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed'))
);

-- Indexes for performance-critical queries
CREATE INDEX idx_picks_bracket_id ON picks(bracket_id);
CREATE INDEX idx_picks_game_id ON picks(game_id);
CREATE INDEX idx_brackets_score ON brackets(score DESC);
CREATE INDEX idx_brackets_agent_id ON brackets(agent_id);
CREATE INDEX idx_games_round ON games(round);
CREATE INDEX idx_games_winner ON games(winner_id);

-- Enable Row Level Security on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_config ENABLE ROW LEVEL SECURITY;

-- Public read policies for all tables
CREATE POLICY "Public read" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read" ON games FOR SELECT USING (true);
CREATE POLICY "Public read agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Public read" ON brackets FOR SELECT USING (true);
CREATE POLICY "Public read" ON picks FOR SELECT USING (true);
CREATE POLICY "Public read" ON tournament_config FOR SELECT USING (true);

-- Enable Supabase Realtime for the brackets table
ALTER PUBLICATION supabase_realtime ADD TABLE brackets;
