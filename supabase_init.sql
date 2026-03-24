-- Script inițializare bază de date numarul.ro
-- Rulează acest script în SQL Editor-ul din dashboard-ul Supabase

-- 1. Creează tabela de comenzi
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Date client
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Date livrare
  shipping_method TEXT NOT NULL CHECK (shipping_method IN ('courier', 'easybox')),
  shipping_county TEXT,
  shipping_city TEXT,
  shipping_address TEXT,
  easybox_id TEXT, -- Populat doar dacă metoda este 'easybox'
  
  -- Sume și Stare
  subtotal_amount DECIMAL(10, 2) NOT NULL,
  shipping_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, Refunded
  order_status TEXT NOT NULL DEFAULT 'new' -- new, processing, shipped, completed, cancelled
);

-- 2. Creează tabela pentru articolele (produsele) din comandă
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Date produs direct din configurator
  product_type TEXT NOT NULL CHECK (product_type IN ('house', 'apartment', 'office')),
  finish TEXT NOT NULL CHECK (finish IN ('black', 'white', 'brown', 'lightgray')),
  
  main_number TEXT,
  street_name TEXT,
  office_name TEXT,
  office_function TEXT,
  office_orientation TEXT DEFAULT 'lateral' CHECK (office_orientation IN ('lateral', 'centered')),
  house_orientation TEXT DEFAULT 'lateral' CHECK (house_orientation IN ('lateral', 'centered')),
  
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

-- 3. Reguli de siguranță (Row Level Security - RLS)
-- Permitem oricui de pe site să INSEREZE comenzi (creând o comandă nouă)
-- Dar DOAR tu (utilizatorul autentificat în dashboard-ul Supabase) poți accesa și CITI comenzile!

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Permite insert anonim pentru coșul de cumpărături
CREATE POLICY "Permite creare de comenzi din site" ON orders 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permite creare articole in comenzi din site" ON order_items 
  FOR INSERT WITH CHECK (true);

-- Notă: Datorită RLS, clienții anonimi NU pot vedea comenzile altora! Nici măcar pe ale lor după ce au părăsit sesiunea, 
-- totul rămâne securizat în baza de date și vizibil doar pt Admin-ul din Supabase Studio.
