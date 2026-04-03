-- Kesiswaan Tables

-- Ekstrakurikuler Table
CREATE TABLE IF NOT EXISTS ekskul (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prestasi Table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    winner TEXT,
    year TEXT,
    category TEXT DEFAULT 'Akademik', -- Akademik / Non-Akademik
    description TEXT,
    image_url TEXT,
    date_achieved DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OSIS & MPK Table (Single row or small set)
CREATE TABLE IF NOT EXISTS osis_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_name TEXT UNIQUE NOT NULL, -- 'vision', 'mission', 'structure_image'
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Activities / Gallery Section
CREATE TABLE IF NOT EXISTS student_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data for Kesiswaan

INSERT INTO ekskul (name, description, image_url, order_index) VALUES
('Pramuka', 'Kegiatan kepanduan untuk membentuk karakter and kemandirian.', '/ekskul/pramuka.jpg', 1),
('PMR', 'Palang Merah Remaja yang melatih kesigapan dalam pertolongan pertama.', '/ekskul/pmr.jpg', 2),
('Paskibra', 'Pasukan Pengibar Bendera yang melatih kedisiplinan and rasa cinta tanah air.', '/ekskul/paskibra.jpg', 3),
('Basket', 'Pengembangan bakat olahraga basket untuk melatih kerjasama tim.', '/ekskul/basket.jpg', 4),
('Futsal', 'Kegiatan olahraga futsal yang sangat diminati untuk melatih sportivitas.', '/ekskul/futsal.jpg', 5),
('Rohis', 'Kerohanian Islam untuk pendalaman agama and pembentukan akhlak.', '/ekskul/rohis.jpg', 6),
('Seni Tari', 'Pelestarian budaya melalui tari tradisional and modern.', '/ekskul/tari.jpg', 7)
ON CONFLICT DO NOTHING;

INSERT INTO achievements (title, winner, year, category, description) VALUES
('Juara 1 Lomba Matematika Nasional', 'Budi Santoso', '2023', 'Akademik', 'Meraih hasil tertinggi dalam kompetisi sains tingkat nasional.'),
('Juara 2 Futsal Cup Jakarta Utara', 'Tim Futsal 112', '2023', 'Non-Akademik', 'Berhasil mencapai final and menunjukkan sportivitas tinggi.'),
('Juara Harapan 1 Lomba Pidato Bahasa Inggris', 'Siti Aminah', '2022', 'Akademik', 'Menampilkan kemampuan orasi yang memukau juri.')
ON CONFLICT DO NOTHING;

INSERT INTO osis_info (section_name, content) VALUES
('vision', 'MEWUJUDKAN OSIS SMP NEGERI 112 SEBAGAI WADAH ASPIRASI DAN KREATIVITAS SISWA YANG BERLANDASKAN IMTAK DAN IPTEK.'),
('mission', '1. Meningkatkan ketaqwaan kepada Tuhan YME.\n2. Mengembangkan bakat and minat siswa melalui kegiatan ekstrakurikuler.\n3. Mempererat tali persaudaraan antar warga sekolah.')
ON CONFLICT (section_name) DO UPDATE SET content = EXCLUDED.content;
