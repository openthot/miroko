-- Migration script to add ON DELETE CASCADE to existing foreign keys
-- Run this in the Supabase SQL Editor

-- Messages table
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Tasks table
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_admin_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_producer_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Statistics table
ALTER TABLE public.statistics DROP CONSTRAINT IF EXISTS statistics_admin_id_fkey;
ALTER TABLE public.statistics ADD CONSTRAINT statistics_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Awards table
ALTER TABLE public.awards DROP CONSTRAINT IF EXISTS awards_producer_id_fkey;
ALTER TABLE public.awards ADD CONSTRAINT awards_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
