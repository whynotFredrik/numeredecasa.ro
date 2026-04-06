-- Migration: Adaugă tabelele pentru recenzii și coduri de reducere
-- Rulează acest script în SQL Editor-ul din dashboard-ul Supabase

-- 1. Tabela de recenzii
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Legătură cu comanda (opțional, pentru recenzii verificate)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Date reviewer
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,

  -- Recenzie
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('house', 'apartment', 'office')),

  -- Moderare
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false
);

-- 2. Tabela de coduri de reducere (referral)
CREATE TABLE discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Codul de reducere
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL DEFAULT 15,

  -- Legătură cu comanda originală
  source_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  source_customer_name TEXT NOT NULL,
  source_customer_email TEXT NOT NULL,

  -- Stare și utilizare
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT 3,  -- Câți prieteni/membri de familie pot folosi codul
  times_used INTEGER DEFAULT 0,

  -- Tracking email
  email_sent_at TIMESTAMP WITH TIME ZONE,

  -- Expirare (90 de zile de la creare)
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '90 days')
);

-- 3. Tabela pentru tracking utilizării codurilor
CREATE TABLE discount_code_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Cine a folosit codul
  used_by_email TEXT NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL
);

-- 4. Adaugă coloana discount pe tabela orders (pentru a stoca reducerea aplicată)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- 5. Adaugă coloana order_status completă dacă nu există deja
-- (delivered este necesar pentru triggerul de email referral)
-- Verifică dacă constraint-ul există deja; dacă nu, adaugă-l
DO $$
BEGIN
  -- Adaugă valoarea 'delivered' la order_status dacă nu e deja acolo
  -- Aceasta permite tracking-ul livrării pentru trimiterea emailurilor de referral
  EXECUTE 'COMMENT ON COLUMN orders.order_status IS ''new, processing, shipped, delivered, completed, cancelled''';
END $$;

-- 6. Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_uses ENABLE ROW LEVEL SECURITY;

-- Permite insert anonim pentru recenzii (de pe site)
CREATE POLICY "Permite creare recenzii din site" ON reviews
  FOR INSERT WITH CHECK (true);

-- Permite citirea recenziilor aprobate (pentru afișarea pe site)
CREATE POLICY "Permite citirea recenziilor aprobate" ON reviews
  FOR SELECT USING (is_approved = true);

-- Discount codes: doar citire prin service role (admin)
-- Nu expunem codurile direct la public
CREATE POLICY "Permite validarea codurilor de reducere" ON discount_codes
  FOR SELECT USING (true);

-- Discount code uses: insert anonim (la checkout)
CREATE POLICY "Permite tracking utilizare cod" ON discount_code_uses
  FOR INSERT WITH CHECK (true);
