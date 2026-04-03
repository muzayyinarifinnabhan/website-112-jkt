-- Alter ekskul table to add more details
ALTER TABLE ekskul 
ADD COLUMN IF NOT EXISTS coach TEXT,
ADD COLUMN IF NOT EXISTS schedule_day TEXT,
ADD COLUMN IF NOT EXISTS schedule_time TEXT;
