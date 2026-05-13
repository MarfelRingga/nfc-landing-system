-- Migration to seed the 'rifelo' circle and demo data

-- First create the owner / main user (fallback if not exists)
-- You can skip this part if you've already created the 'marfel' account.
INSERT INTO public.profiles (id, username, full_name, bio, company, is_public) 
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'marfel', 
  'Marfel Ringga P', 
  'Your profile is always ready. Share your name, links, social media, or anything that represents you — all in one simple page. No need to repeat yourself.',
  'Rifelo',
  true
)
ON CONFLICT (username) DO NOTHING;

-- Note: In a real scenario, you would map 'owner_id' to `marfel`'s actual auth UUID.
-- For the sake of this migration, we'll try to find an existing user or use a dummy UUID if constraints allow it,
-- but usually circles require a valid owner_id. We'll use an anonymous block to handle it safely.

DO $$
DECLARE
  v_owner_id UUID;
  v_circle_id UUID;
BEGIN
  -- Try to get 'marfel' profile ID or any other admin/first user for ownership
  SELECT id INTO v_owner_id FROM public.profiles WHERE username = 'marfel' LIMIT 1;
  
  IF v_owner_id IS NULL THEN
      -- Fallback to the first available profile
      SELECT id INTO v_owner_id FROM public.profiles LIMIT 1;
  END IF;

  IF v_owner_id IS NOT NULL THEN
      -- Create the Circle
      INSERT INTO public.circles (name, description, slug, invite_code, owner_id)
      VALUES (
          'Rifelo',
          'Private Circle Member',
          'rifelo',
          'RIFELO',
          v_owner_id
      )
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id INTO v_circle_id;

      -- Create Circle Members (simulate the 5 members plus the owner)
      -- Owner (You / Marfel)
      INSERT INTO public.circle_members (circle_id, profile_id, role)
      VALUES (v_circle_id, v_owner_id, 'Admin')
      ON CONFLICT (circle_id, profile_id) DO NOTHING;
      
      -- For demo purposes we won't seed random profiles for Sarah Jin, Mike Ross, etc., 
      -- because generating auth ids for them is complex. We will just let the frontend default back 
      -- to their fallback names when the members don't exist yet!
      -- If real users join the circle later, the frontend will automatically sync with them.
  END IF;
END $$;
