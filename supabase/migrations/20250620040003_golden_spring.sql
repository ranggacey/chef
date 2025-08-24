/*
  # Chef AI Database Schema

  1. Tables
    - ingredients: User's kitchen inventory
    - recipes: User's recipe collection 
    - meal_plans: User's meal planning

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  expiry_date DATE,
  category TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  prep_time INTEGER NOT NULL DEFAULT 0,
  cook_time INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  cuisine TEXT NOT NULL DEFAULT 'fusion',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ingredients
CREATE POLICY "Users can view their own ingredients" ON ingredients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ingredients" ON ingredients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ingredients" ON ingredients
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ingredients" ON ingredients
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for recipes
CREATE POLICY "Users can view their own recipes" ON recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meal_plans
CREATE POLICY "Users can view their own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" ON meal_plans
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for demo user (demo@chefai.com)
-- Note: This will only work after the demo user is created through auth