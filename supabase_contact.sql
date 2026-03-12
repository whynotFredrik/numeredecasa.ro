-- Tabela pentru mesajele de contact de pe site
-- Rulează în Supabase -> SQL Editor -> New Query

CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Permite inserare anonimă de pe site
CREATE POLICY "Permite trimitere mesaje de contact de pe site" ON contact_messages 
  FOR INSERT WITH CHECK (true);
