-- =============================================
-- CHEF AI - COMPLETE DATABASE SCHEMA
-- =============================================
-- Comprehensive schema for Chef AI hackathon project
-- Features: Ingredients, Recipes, Meal Planning, AI Chat History, User Preferences

-- Drop existing tables if any (be careful in production!)
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS recipe_ratings CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- =============================================
-- 1. USER PREFERENCES TABLE
-- =============================================
CREATE TABLE user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    dietary_restrictions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    favorite_cuisines TEXT[] DEFAULT '{}',
    cooking_skill_level TEXT DEFAULT 'beginner' CHECK (cooking_skill_level IN ('beginner', 'intermediate', 'advanced')),
    preferred_meal_times JSONB DEFAULT '{"breakfast": "07:00", "lunch": "12:00", "dinner": "19:00"}',
    default_servings INTEGER DEFAULT 4,
    metric_system BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- 2. INGREDIENTS TABLE (Kitchen Inventory)
-- =============================================
CREATE TABLE ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    original_quantity DECIMAL(10,2) DEFAULT 0,
    expiry_date DATE,
    purchase_date DATE DEFAULT CURRENT_DATE,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
        'vegetables', 'fruits', 'meat', 'seafood', 'dairy', 'grains', 
        'spices', 'herbs', 'pantry', 'frozen', 'beverages', 'other'
    )),
    storage_location TEXT DEFAULT 'pantry' CHECK (storage_location IN (
        'pantry', 'refrigerator', 'freezer', 'countertop'
    )),
    brand TEXT,
    price DECIMAL(10,2),
    notes TEXT,
    barcode TEXT,
    is_staple BOOLEAN DEFAULT false,
    low_stock_threshold DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- 3. RECIPES TABLE
-- =============================================
CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    instructions TEXT[] NOT NULL DEFAULT '{}',
    prep_time INTEGER NOT NULL DEFAULT 0, -- in minutes
    cook_time INTEGER NOT NULL DEFAULT 0, -- in minutes
    total_time INTEGER GENERATED ALWAYS AS (prep_time + cook_time) STORED,
    servings INTEGER NOT NULL DEFAULT 4,
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    cuisine TEXT NOT NULL DEFAULT 'fusion',
    tags TEXT[] NOT NULL DEFAULT '{}',
    nutritional_info JSONB DEFAULT '{}', -- calories, protein, carbs, fat, etc.
    image_url TEXT,
    source TEXT DEFAULT 'ai_generated',
    is_favorite BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    times_cooked INTEGER DEFAULT 0,
    cost_estimate DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- 4. RECIPE RATINGS TABLE
-- =============================================
CREATE TABLE recipe_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    would_cook_again BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(recipe_id, user_id)
);

-- =============================================
-- 5. MEAL PLANS TABLE
-- =============================================
CREATE TABLE meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    custom_meal_name TEXT,
    notes TEXT,
    planned_servings INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    grocery_list_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, date, meal_type)
);

-- =============================================
-- 6. CHAT HISTORY TABLE (AI Conversations)
-- =============================================
CREATE TABLE chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID DEFAULT gen_random_uuid(),
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- For storing recipe data, ingredients used, etc.
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Ingredients indexes
CREATE INDEX idx_ingredients_user_id ON ingredients(user_id);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_expiry ON ingredients(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_ingredients_name ON ingredients(name);

-- Recipes indexes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX idx_recipes_rating ON recipes(rating);
CREATE INDEX idx_recipes_is_favorite ON recipes(is_favorite) WHERE is_favorite = true;

-- Meal plans indexes
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX idx_meal_plans_recipe ON meal_plans(recipe_id) WHERE recipe_id IS NOT NULL;

-- Chat history indexes
CREATE INDEX idx_chat_history_user_session ON chat_history(user_id, session_id);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- User Preferences Policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Ingredients Policies
CREATE POLICY "Users can manage their own ingredients" ON ingredients
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recipes Policies
CREATE POLICY "Users can manage their own recipes" ON recipes
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public recipes" ON recipes
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Recipe Ratings Policies
CREATE POLICY "Users can manage their own ratings" ON recipe_ratings
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Meal Plans Policies
CREATE POLICY "Users can manage their own meal plans" ON meal_plans
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Chat History Policies
CREATE POLICY "Users can manage their own chat history" ON chat_history
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update recipe rating when new rating is added
CREATE OR REPLACE FUNCTION update_recipe_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recipes 
    SET rating = (
        SELECT AVG(rating)::DECIMAL(2,1) 
        FROM recipe_ratings 
        WHERE recipe_id = NEW.recipe_id
    )
    WHERE id = NEW.recipe_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipe_rating_trigger
    AFTER INSERT OR UPDATE ON recipe_ratings
    FOR EACH ROW EXECUTE FUNCTION update_recipe_rating();

-- Function to auto-create user preferences on user signup
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-creating user preferences (this goes on auth.users)
-- Note: You might need to create this trigger in Supabase Dashboard if auth.users is not accessible

-- =============================================
-- USEFUL VIEWS
-- =============================================

-- View for ingredients expiring soon
CREATE VIEW expiring_ingredients AS
SELECT 
    i.*,
    (expiry_date - CURRENT_DATE) as days_until_expiry
FROM ingredients i
WHERE expiry_date IS NOT NULL
    AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'
    AND quantity > 0;

-- View for recipe statistics
CREATE VIEW recipe_stats AS
SELECT 
    r.id,
    r.title,
    r.user_id,
    r.rating,
    r.times_cooked,
    COUNT(rr.id) as total_ratings,
    AVG(rr.rating) as avg_user_rating
FROM recipes r
LEFT JOIN recipe_ratings rr ON r.id = rr.recipe_id
GROUP BY r.id, r.title, r.user_id, r.rating, r.times_cooked;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Note: Sample data will be inserted after a user signs up
-- You can run this separately for your demo user

-- Sample ingredient categories for reference
/*
INSERT INTO ingredients (user_id, name, quantity, unit, category, expiry_date) VALUES 
-- This would be populated with actual user_id after signup
*/

-- Sample recipe data structure for reference
/*
INSERT INTO recipes (user_id, title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, cuisine, tags) VALUES
-- This would be populated with actual user_id after signup
*/

-- =============================================
-- USEFUL FUNCTIONS FOR THE APP
-- =============================================

-- Function to get grocery list for meal plan
CREATE OR REPLACE FUNCTION get_grocery_list_for_week(
    p_user_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    ingredient_name TEXT,
    total_needed DECIMAL,
    unit TEXT,
    current_stock DECIMAL,
    need_to_buy DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH meal_ingredients AS (
        SELECT 
            unnest(r.ingredients) as ingredient_line
        FROM meal_plans mp
        JOIN recipes r ON mp.recipe_id = r.id
        WHERE mp.user_id = p_user_id
            AND mp.date >= p_start_date
            AND mp.date < p_start_date + INTERVAL '7 days'
    ),
    parsed_ingredients AS (
        SELECT 
            -- This is a simplified version - you might want more sophisticated parsing
            regexp_replace(ingredient_line, '^[0-9./\s]+', '') as ingredient_name,
            1.0 as quantity -- Simplified - would need better parsing
        FROM meal_ingredients
    )
    SELECT 
        pi.ingredient_name::TEXT,
        SUM(pi.quantity)::DECIMAL as total_needed,
        COALESCE(i.unit, 'unit')::TEXT as unit,
        COALESCE(i.quantity, 0)::DECIMAL as current_stock,
        GREATEST(0, SUM(pi.quantity) - COALESCE(i.quantity, 0))::DECIMAL as need_to_buy
    FROM parsed_ingredients pi
    LEFT JOIN ingredients i ON LOWER(i.name) = LOWER(pi.ingredient_name) AND i.user_id = p_user_id
    GROUP BY pi.ingredient_name, i.unit, i.quantity
    HAVING GREATEST(0, SUM(pi.quantity) - COALESCE(i.quantity, 0)) > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to suggest recipes based on available ingredients
CREATE OR REPLACE FUNCTION suggest_recipes_by_ingredients(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    recipe_id UUID,
    title TEXT,
    match_percentage DECIMAL,
    missing_ingredients TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH user_ingredients AS (
        SELECT LOWER(name) as ingredient_name
        FROM ingredients
        WHERE user_id = p_user_id AND quantity > 0
    ),
    recipe_analysis AS (
        SELECT 
            r.id,
            r.title,
            r.ingredients,
            array_length(r.ingredients, 1) as total_ingredients,
            (
                SELECT COUNT(*)
                FROM unnest(r.ingredients) as recipe_ingredient
                WHERE EXISTS (
                    SELECT 1 FROM user_ingredients ui
                    WHERE ui.ingredient_name = ANY(string_to_array(LOWER(recipe_ingredient), ' '))
                )
            ) as matched_ingredients
        FROM recipes r
        WHERE r.user_id = p_user_id OR r.is_public = true
    )
    SELECT 
        ra.id::UUID,
        ra.title::TEXT,
        ROUND((ra.matched_ingredients::DECIMAL / ra.total_ingredients * 100), 2)::DECIMAL as match_percentage,
        ARRAY[]::TEXT[] as missing_ingredients -- Simplified for now
    FROM recipe_analysis ra
    WHERE ra.total_ingredients > 0
    ORDER BY match_percentage DESC, ra.title
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Database schema creation completed successfully!
-- 
-- Features included:
-- ✅ User preferences and profiles
-- ✅ Complete ingredient inventory management
-- ✅ Advanced recipe system with ratings
-- ✅ Comprehensive meal planning
-- ✅ AI chat history tracking
-- ✅ Performance indexes
-- ✅ Row Level Security
-- ✅ Automated triggers and functions
-- ✅ Useful views for common queries
-- ✅ Helper functions for grocery lists and recipe suggestions
--
-- Next steps:
-- 1. Run this script in your Supabase SQL Editor
-- 2. Create a test user account
-- 3. Start using your Chef AI application!

SELECT 'Chef AI Database Schema Created Successfully! 🚀' as status; 