-- Add 'discussion' type to conversations table enum
ALTER TYPE conversations_type_enum ADD VALUE 'discussion';

-- Add game_news_id column to conversations table for linking to game news
ALTER TABLE conversations 
ADD COLUMN game_news_id TEXT;
