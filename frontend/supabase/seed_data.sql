-- Salin dan jalankan kode SQL ini di "SQL Editor" Supabase Bapak untuk mengisi data awal
-- Ini akan membuat data default muncul di dashboard admin dan halaman depan

-- Hapus data lama jika ada (opsional, hati-hati)
-- DELETE FROM sliders;
-- DELETE FROM featured_menus;
-- DELETE FROM statistics;
-- DELETE FROM why_us;

-- 1. Isi Data Slider
INSERT INTO sliders (title, subtitle, image_url, order_index, is_active)
VALUES 
('Selamat Datang di SMPN 112 Jakarta', 'Sekolah Menengah Pertama Negeri Terbaik', '/depan 112.png', 0, true),
('Fasilitas Modern & Lengkap', 'Mendukung proses belajar mengajar secara optimal', '/depan 112.png', 1, true),
('Lingkungan Belajar Inspiratif', 'Fasilitas laboratorium modern untuk eksperimen siswa', 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066&auto=format&fit=crop', 2, true);

-- 2. Isi Data Menu Unggulan
INSERT INTO featured_menus (title, description, icon_name, color, path, order_index)
VALUES 
('Fasilitas Sekolah', 'Berbagai fasilitas lengkap untuk mendukung proses belajar yang nyaman dan berkualitas.', 'Building2', 'text-blue-600', '/profil/fasilitas', 0),
('Pengumuman Sekolah', 'Informasi terbaru dan penting seputar kegiatan serta agenda sekolah.', 'Megaphone', 'text-red-500', '/informasi/pengumuman', 1),
('Prestasi Peserta Didik', 'Kumpulan prestasi membanggakan dari siswa yang meraih prestasi dari berbagai bidang.', 'Trophy', 'text-yellow-600', '/kesiswaan/prestasi', 2),
('Gallery Sekolah', 'Dokumentasi foto dan video kegiatan sekolah yang penuh kenangan', 'Camera', 'text-purple-600', '/galeri', 3);

-- 3. Isi Data Statistik
INSERT INTO statistics (title, value, icon, order_index)
VALUES 
('Total Siswa', '1,200+', 'Users', 0),
('Guru & Staff', '65+', 'UserCircle', 1),
('Total Prestasi', '150+', 'Trophy', 2),
('Predikat Terbaik', 'Akreditasi A', 'Award', 3);

-- 4. Isi Data Mengapa Memilih Kami
INSERT INTO why_us (title, description, order_index)
VALUES 
('Lokasi Strategis', 'Dapat dijangkau dengan berbagai kemudahan akses transportasi.', 0),
('Membantu Pengembangan Bakat', 'Mengembangkan bakat dari peserta didik sehingga muncul menjadi pembelajaran yang efektif.', 1),
('Pendidikan Berkualitas', 'Kurikulum yang disesuaikan dengan standar nasional dan internasional.', 2),
('Fasilitas Lengkap', 'Gedung modern dengan sarana prasarana yang sangat memadai.', 3),
('Prestasi Gemilang', 'Track record prestasi akademik and non-akademik yang membanggakan.', 4);
