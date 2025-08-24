-- Add translation fields to ingredients table
ALTER TABLE public.ingredients
ADD COLUMN name_en TEXT,
ADD COLUMN name_id TEXT;

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can insert their own ingredients" ON public.ingredients;
CREATE POLICY "Users can insert their own ingredients"
ON public.ingredients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ingredients" ON public.ingredients;
CREATE POLICY "Users can update their own ingredients"
ON public.ingredients
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to update translation fields
CREATE OR REPLACE FUNCTION public.handle_ingredient_translations()
RETURNS TRIGGER AS $$
BEGIN
  -- If name_en and name_id are not provided, set them to the name value
  IF NEW.name_en IS NULL THEN
    NEW.name_en := NEW.name;
  END IF;
  
  IF NEW.name_id IS NULL THEN
    NEW.name_id := NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically fill translation fields if not provided
DROP TRIGGER IF EXISTS ingredient_translations_trigger ON public.ingredients;
CREATE TRIGGER ingredient_translations_trigger
BEFORE INSERT OR UPDATE ON public.ingredients
FOR EACH ROW
EXECUTE FUNCTION public.handle_ingredient_translations(); 