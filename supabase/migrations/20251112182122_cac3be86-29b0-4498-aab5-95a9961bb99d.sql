-- Create leaderboard table for aim trainer scores
CREATE TABLE public.aim_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  scenario TEXT NOT NULL,
  score INTEGER NOT NULL,
  sensitivity DECIMAL(5, 3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.aim_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view leaderboard" 
ON public.aim_leaderboard 
FOR SELECT 
USING (true);

-- Create policy for inserting scores
CREATE POLICY "Anyone can insert scores" 
ON public.aim_leaderboard 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_aim_leaderboard_scenario_score ON public.aim_leaderboard(scenario, score DESC);
CREATE INDEX idx_aim_leaderboard_created_at ON public.aim_leaderboard(created_at DESC);