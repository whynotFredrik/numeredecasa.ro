-- Migrare: Adaugă coloanele de orientare + culori noi în order_items
-- Rulează acest script în SQL Editor-ul din dashboard-ul Supabase

-- 1. Adaugă coloanele de orientare
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS office_orientation TEXT DEFAULT 'lateral' CHECK (office_orientation IN ('lateral', 'centered'));

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS house_orientation TEXT DEFAULT 'lateral' CHECK (house_orientation IN ('lateral', 'centered'));

-- 2. Actualizează CHECK constraint pe coloana finish pentru a include culorile noi
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_finish_check;
ALTER TABLE order_items ADD CONSTRAINT order_items_finish_check CHECK (finish IN ('black', 'white', 'brown', 'lightgray'));
