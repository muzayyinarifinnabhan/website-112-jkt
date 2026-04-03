import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// ─────────────────────────────────────────────────────────────────
// Lazy-loaded Public Pages (code-split per route = faster FCP)
// ─────────────────────────────────────────────────────────────────
const Home             = lazy(() => import('./pages/public/Home'))
const TentangSekolah   = lazy(() => import('./pages/public/TentangSekolah'))
const Akreditasi       = lazy(() => import('./pages/public/Akreditasi'))
const Fasilitas        = lazy(() => import('./pages/public/Fasilitas'))
const Sambutan         = lazy(() => import('./pages/public/Sambutan'))
const Guru             = lazy(() => import('./pages/public/Guru'))
const BeritaList       = lazy(() => import('./pages/public/BeritaList'))
const BeritaDetail     = lazy(() => import('./pages/public/BeritaDetail'))
const Galeri           = lazy(() => import('./pages/public/Galeri'))
const Ekstrakurikuler  = lazy(() => import('./pages/public/Ekstrakurikuler'))
const Prestasi         = lazy(() => import('./pages/public/Prestasi'))
const OSIS             = lazy(() => import('./pages/public/OSIS'))
const KegiatanSiswa    = lazy(() => import('./pages/public/KegiatanSiswa'))
const Pengumuman       = lazy(() => import('./pages/public/Pengumuman'))
const PengumumanDetail = lazy(() => import('./pages/public/PengumumanDetail'))
const Kurikulum        = lazy(() => import('./pages/public/Kurikulum'))
const CBT              = lazy(() => import('./pages/public/CBT'))
const KJP              = lazy(() => import('./pages/public/KJP'))
const Agenda           = lazy(() => import('./pages/public/Agenda'))
const SPMB             = lazy(() => import('./pages/public/SPMB'))
const Kontak           = lazy(() => import('./pages/public/Kontak'))

// ─────────────────────────────────────────────────────────────────
// Lazy-loaded Admin Pages
// ─────────────────────────────────────────────────────────────────
const Dashboard          = lazy(() => import('./pages/admin/Dashboard'))
const Login              = lazy(() => import('./pages/admin/Login'))
const AdminSlider        = lazy(() => import('./pages/admin/home/AdminSlider'))
const AdminFeatures      = lazy(() => import('./pages/admin/home/AdminFeatures'))
const AdminWhyUs         = lazy(() => import('./pages/admin/home/AdminWhyUs'))
const AdminStats         = lazy(() => import('./pages/admin/home/AdminStats'))
const AdminHistory       = lazy(() => import('./pages/admin/profil/AdminHistory'))
const AdminIdentitas     = lazy(() => import('./pages/admin/profil/AdminIdentitas'))
const AdminVisionMission = lazy(() => import('./pages/admin/profil/AdminVisionMission'))
const AdminFacilities    = lazy(() => import('./pages/admin/profil/AdminFacilities'))
const AdminStaff         = lazy(() => import('./pages/admin/profil/AdminStaff'))
const AdminSambutan      = lazy(() => import('./pages/admin/profil/AdminSambutan'))
const AdminAkreditasi    = lazy(() => import('./pages/admin/profil/AdminAkreditasi'))
const AdminEkskul        = lazy(() => import('./pages/admin/kesiswaan/AdminEkskul'))
const AdminPrestasi      = lazy(() => import('./pages/admin/kesiswaan/AdminPrestasi'))
const AdminOsis          = lazy(() => import('./pages/admin/kesiswaan/AdminOsis'))
const AdminKegiatan      = lazy(() => import('./pages/admin/kesiswaan/AdminKegiatan'))
const AdminKontak        = lazy(() => import('./pages/admin/informasi/AdminKontak'))
const AdminGaleri        = lazy(() => import('./pages/admin/informasi/AdminGaleri'))
const AdminPengumuman    = lazy(() => import('./pages/admin/informasi/AdminPengumuman'))
const AdminNews          = lazy(() => import('./pages/admin/informasi/AdminNews'))
const AdminAgenda        = lazy(() => import('./pages/admin/informasi/AdminAgenda'))
const AdminSPMB          = lazy(() => import('./pages/admin/informasi/AdminSPMB'))
const AdminCBT           = lazy(() => import('./pages/admin/informasi/AdminCBT'))
const AdminKJP           = lazy(() => import('./pages/admin/informasi/AdminKJP'))
const AdminSecondary     = lazy(() => import('./pages/admin/informasi/AdminSecondary'))

// Global page loader - shown while a lazy chunk is loading
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Memuat halaman...</p>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
          <Route path="profil">
            <Route index element={<Suspense fallback={<PageLoader />}><TentangSekolah /></Suspense>} />
            <Route path="tentang-sekolah" element={<Suspense fallback={<PageLoader />}><TentangSekolah /></Suspense>} />
            <Route path="akreditasi" element={<Suspense fallback={<PageLoader />}><Akreditasi /></Suspense>} />
            <Route path="fasilitas" element={<Suspense fallback={<PageLoader />}><Fasilitas /></Suspense>} />
            <Route path="sambutan" element={<Suspense fallback={<PageLoader />}><Sambutan /></Suspense>} />
            <Route path="guru" element={<Suspense fallback={<PageLoader />}><Guru /></Suspense>} />
          </Route>
          <Route path="berita" element={<Suspense fallback={<PageLoader />}><BeritaList /></Suspense>} />
          <Route path="berita/:id" element={<Suspense fallback={<PageLoader />}><BeritaDetail /></Suspense>} />
          <Route path="galeri" element={<Suspense fallback={<PageLoader />}><Galeri /></Suspense>} />
          <Route path="kesiswaan">
            <Route index element={<Suspense fallback={<PageLoader />}><Ekstrakurikuler /></Suspense>} />
            <Route path="ekstrakurikuler" element={<Suspense fallback={<PageLoader />}><Ekstrakurikuler /></Suspense>} />
            <Route path="prestasi" element={<Suspense fallback={<PageLoader />}><Prestasi /></Suspense>} />
            <Route path="osis" element={<Suspense fallback={<PageLoader />}><OSIS /></Suspense>} />
            <Route path="kegiatan-siswa" element={<Suspense fallback={<PageLoader />}><KegiatanSiswa /></Suspense>} />
          </Route>
          <Route path="informasi">
            <Route index element={<Suspense fallback={<PageLoader />}><Pengumuman /></Suspense>} />
            <Route path="pengumuman" element={<Suspense fallback={<PageLoader />}><Pengumuman /></Suspense>} />
            <Route path="pengumuman/:id" element={<Suspense fallback={<PageLoader />}><PengumumanDetail /></Suspense>} />
            <Route path="kurikulum" element={<Suspense fallback={<PageLoader />}><Kurikulum /></Suspense>} />
            <Route path="cbt" element={<Suspense fallback={<PageLoader />}><CBT /></Suspense>} />
            <Route path="kjp" element={<Suspense fallback={<PageLoader />}><KJP /></Suspense>} />
            <Route path="agenda" element={<Suspense fallback={<PageLoader />}><Agenda /></Suspense>} />
          </Route>
          <Route path="spmb" element={<Suspense fallback={<PageLoader />}><SPMB /></Suspense>} />
          <Route path="kontak" element={<Suspense fallback={<PageLoader />}><Kontak /></Suspense>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="home/slider"    element={<Suspense fallback={<PageLoader />}><AdminSlider /></Suspense>} />
            <Route path="home/features"  element={<Suspense fallback={<PageLoader />}><AdminFeatures /></Suspense>} />
            <Route path="home/why-us"    element={<Suspense fallback={<PageLoader />}><AdminWhyUs /></Suspense>} />
            <Route path="home/stats"     element={<Suspense fallback={<PageLoader />}><AdminStats /></Suspense>} />
            <Route path="profil/history"         element={<Suspense fallback={<PageLoader />}><AdminHistory /></Suspense>} />
            <Route path="profil/identitas"       element={<Suspense fallback={<PageLoader />}><AdminIdentitas /></Suspense>} />
            <Route path="profil/vision-mission"  element={<Suspense fallback={<PageLoader />}><AdminVisionMission /></Suspense>} />
            <Route path="profil/akreditasi"      element={<Suspense fallback={<PageLoader />}><AdminAkreditasi /></Suspense>} />
            <Route path="profil/facilities"      element={<Suspense fallback={<PageLoader />}><AdminFacilities /></Suspense>} />
            <Route path="profil/sambutan"        element={<Suspense fallback={<PageLoader />}><AdminSambutan /></Suspense>} />
            <Route path="profil/staff"           element={<Suspense fallback={<PageLoader />}><AdminStaff /></Suspense>} />
            <Route path="kesiswaan/ekskul"    element={<Suspense fallback={<PageLoader />}><AdminEkskul /></Suspense>} />
            <Route path="kesiswaan/prestasi"  element={<Suspense fallback={<PageLoader />}><AdminPrestasi /></Suspense>} />
            <Route path="kesiswaan/osis"      element={<Suspense fallback={<PageLoader />}><AdminOsis /></Suspense>} />
            <Route path="kesiswaan/kegiatan"  element={<Suspense fallback={<PageLoader />}><AdminKegiatan /></Suspense>} />
            <Route path="informasi/kontak"     element={<Suspense fallback={<PageLoader />}><AdminKontak /></Suspense>} />
            <Route path="informasi/galeri"     element={<Suspense fallback={<PageLoader />}><AdminGaleri /></Suspense>} />
            <Route path="informasi/pengumuman" element={<Suspense fallback={<PageLoader />}><AdminPengumuman /></Suspense>} />
            <Route path="informasi/berita"     element={<Suspense fallback={<PageLoader />}><AdminNews /></Suspense>} />
            <Route path="informasi/agenda"     element={<Suspense fallback={<PageLoader />}><AdminAgenda /></Suspense>} />
            <Route path="informasi/kurikulum"  element={<Suspense fallback={<PageLoader />}><AdminSecondary slug="kurikulum" title="Kurikulum" /></Suspense>} />
            <Route path="informasi/cbt"        element={<Suspense fallback={<PageLoader />}><AdminCBT /></Suspense>} />
            <Route path="informasi/kjp"        element={<Suspense fallback={<PageLoader />}><AdminKJP /></Suspense>} />
            <Route path="spmb"    element={<Suspense fallback={<PageLoader />}><AdminSPMB /></Suspense>} />
            <Route path="users"   element={<div>Manage Admin Users</div>} />
            <Route path="settings" element={<div>General Settings</div>} />
          </Route>
        </Route>

        {/* Auth Route */}
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
      </Routes>
    </Suspense>
  )
}

export default App
