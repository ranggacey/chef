-- Add 'recipe' to the message_type check constraint
ALTER TABLE chat_history DROP CONSTRAINT IF EXISTS chat_history_message_type_check;
ALTER TABLE chat_history ADD CONSTRAINT chat_history_message_type_check 
  CHECK (message_type IN ('user', 'ai', 'system', 'recipe')); 