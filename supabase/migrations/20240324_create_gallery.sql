-- Create gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    is_video BOOLEAN DEFAULT false,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access on gallery"
ON public.gallery FOR SELECT
TO public
USING (true);

-- Admin CRUD access
CREATE POLICY "Allow admin crud access on gallery"
ON public.gallery FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert initial data
INSERT INTO public.gallery (title, description, image_url, category, is_video)
VALUES
('Isra Mi''raj 1447 H / 2026 M: Meneladani Rasulullah dalam menumbuhkan semangat ibadah pada generasi Z', 'Peringatan Isra Mi''raj 1447 H / 2026 M menjadi momentum untuk meneladani Rasulullah SAW dalam memperkuat keimanan dan semangat ibadah, khususnya shalat sebagai tiang agama.', 'https://images.unsplash.com/photo-1542152331393-f384a5697240?q=80&w=2032&auto=format&fit=crop', 'Acara', true),
('Lepas Sambut Kepala Sekolah SMPN 112 Jakarta', 'Momentum perpisahan dan penyambutan sebagai bentuk penghargaan, penghormatan, serta komitmen bersama dalam melanjutkan kepemimpinan demi kemajuan sekolah.', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop', 'Kegiatan', true),
('P5 Kearifan Lokal', 'Projek P5 Kearifan Lokal mengajarkan peserta didik untuk mengenal, menghargai, dan melestarikan budaya serta tradisi daerah.', 'https://images.unsplash.com/photo-1577891729319-86adcd1c798f?q=80&w=2070&auto=format&fit=crop', 'Kegiatan', true),
('Ekstrakurikuler Paskibra SMP Negeri 112', 'Ekstrakurikuler Paskibra SMP Negeri 112 melatih kedisiplinan, tanggung jawab, dan semangat nasionalisme siswa.', 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=2070&auto=format&fit=crop', 'Kegiatan', true),
('Warga sekolah melaksanakan senam pagi', 'Warga sekolah melaksanakan senam pagi sebelum beraktifitas bersama untuk menjaga kesehatan, kebugaran, dan mempererat kebersamaan.', 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070&auto=format&fit=crop', 'Kegiatan', true),
('Hari Pendidikan Nasional 2025', 'Peringatan Hari Pendidikan Nasional 2025 menjadi momentum untuk menumbuhkan semangat belajar, menghargai perjuangan para pendidik, dan mewujudkan pendidikan berkualitas bagi semua.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2032&auto=format&fit=crop', 'Acara', true),
('Maulid Nabi Muhammad SAW', 'Peringatan Maulid Nabi Muhammad SAW sebagai momen untuk meneladani akhlak Rasulullah dan mempererat ukhuwah antar warga sekolah.', 'https://images.unsplash.com/photo-1563461660947-507ef49ee969?q=80&w=2070&auto=format&fit=crop', 'Acara', true),
('Lomba FLS3N Tingkat Provinsi DKI Jakarta', 'Lomba FLS3N Tingkat Provinsi DKI Jakarta menjadi wadah bagi siswa untuk mengekspresikan kreativitas dan bakat di bidang seni serta budaya.', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop', 'Prestasi', true);
