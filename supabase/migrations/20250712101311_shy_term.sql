/*
  # Add tags column to questions table

  1. Changes
    - Add `tags` column to `questions` table as text array
    - This will store tag names as an array of strings

  2. Notes
    - Uses text[] type to store multiple tag names
    - Defaults to empty array if no tags provided
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'tags'
  ) THEN
    ALTER TABLE questions ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;