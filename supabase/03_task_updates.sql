-- 1. Projects Table Additions
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS stage_deadlines JSONB DEFAULT '{"Composer": 3, "Sound Designer": 3, "Arranger": 3, "FX Mixer": 3, "Mastering Engineer": 3}'::jsonb;

-- 2. Tasks Table Additions
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deadline_days NUMERIC DEFAULT 3;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deadline_waived BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS delay_penalty NUMERIC DEFAULT 0;
