-- Table: announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: news
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    author TEXT DEFAULT 'Admin',
    category TEXT DEFAULT 'Berita Umum',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: agenda
CREATE TABLE IF NOT EXISTS agenda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: secondary_content (for Curriculum, KJP, PIP, etc.)
CREATE TABLE IF NOT EXISTS secondary_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- e.g., 'kurikulum', 'kjp', 'pip'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    file_url TEXT, -- for curriculum PDF etc.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initial Data for secondary_content
INSERT INTO secondary_content (slug, title, content) VALUES 
('kurikulum', 'Kurikulum Sekolah', 'Informasi mengenai kurikulum yang diterapkan di SMP Negeri 112 Jakarta.'),
('kjp', 'Layanan KJP / PIP', 'Informasi mengenai administrasi dan pengajuan KJP serta PIP untuk siswa.')
ON CONFLICT (slug) DO NOTHING;
