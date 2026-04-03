-- Profil Sekolah
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL, -- e.g., 'sejarah', 'visi', 'misi', 'akreditasi', 'fasilitas', 'sambutan'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Guru & Staff
CREATE TABLE teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  subject text,
  image_url text,
  category text NOT NULL, -- e.g., 'pimpinan', 'guru'
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pengumuman
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Berita
CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  image_url text,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agenda / Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Statistik Sekolah
CREATE TABLE statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  value text NOT NULL,
  icon text,
  order_index integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sliders / Hero
CREATE TABLE sliders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- Ekstrakurikuler
CREATE TABLE extracurriculars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  coach text,
  schedule_day text,
  schedule_time text,
  image_url text
);

-- OSIS & MPK
CREATE TABLE osis_mpk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'osis', 'mpk'
  section text NOT NULL, -- 'visi', 'misi', 'pengurus', 'galeri'
  content text NOT NULL,
  image_url text,
  order_index integer DEFAULT 0
);

-- Prestasi
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date,
  category text,
  image_url text
);

-- KJP & PIP
CREATE TABLE kjp_pip (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'kjp', 'pip'
  section text NOT NULL, -- 'syarat', 'dokumen', 'jadwal', 'cara'
  content text NOT NULL
);

-- SPMB / PPDB
CREATE TABLE spmb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'jadwal', 'syarat_masuk', 'syarat_keluar', 'berkas'
  title text NOT NULL,
  content text,
  date_info text
);

-- Menu Unggulan
CREATE TABLE featured_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon_name text,
  color text,
  path text,
  order_index integer DEFAULT 0
);

-- Mengapa Memilih Kami
CREATE TABLE why_us (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  order_index integer DEFAULT 0
);

-- Settings / Global Config
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL
);

-- Allow public read access (Modify policies as needed)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public news are viewable by everyone." ON news FOR SELECT USING (true);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public announcements are viewable by everyone." ON announcements FOR SELECT USING (true);

-- Repeat for all tables...
