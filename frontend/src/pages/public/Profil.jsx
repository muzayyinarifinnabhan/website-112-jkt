import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BookOpen, History, Eye, Target, Building2, CheckCircle2, Award } from 'lucide-react'

export default function Profil() {
  const location = useLocation()
  
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  const schoolIdentity = [
    { label: 'Nama Sekolah', value: 'SMP Negeri 112 Jakarta' },
    { label: 'NPSN', value: '20100717' },
    { label: 'Status', value: 'Negeri' },
    { label: 'Jenjang Pendidikan', value: 'SMP' },
    { label: 'Akreditasi', value: 'A' },
    { label: 'Kurikulum', value: 'Merdeka' },
    { label: 'Status Kepemilikan', value: 'Pemerintah Daerah' },
    { label: 'SK Pendirian Sekolah', value: 'AY 669667.09.05.02.02.4.0' },
    { label: 'Tanggal SK Pendirian', value: '1972-06-16' },
    { label: 'SK Izin Operasional', value: '-' },
    { label: 'Tanggal SK Izin Operasional', value: '1972-06-16' },
    { label: 'NSS', value: '10107400' },
    { label: 'Alamat', value: 'Jl. A1 Teluk Gong, Jakarta Utara' },
    { label: 'Telepon', value: '(021) 6603001' },
    { label: 'Email', value: 'smpn112jakut@gmail.com' },
    { label: 'Kepala Sekolah', value: 'Dwinanto Salip, S.Pd' },
    { label: 'SK Pengangkatan', value: '-' },
    { label: 'Tanggal SK Pengangkatan', value: '1806-10-10' },
    { label: 'SK Izin Operasional Kepala Sekolah', value: '-' },
    { label: 'Tanggal SK Izin Operasional Kepala Sekolah', value: '2004-06-25' },
  ]

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-20 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/depan 112.png')` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative text-center text-white px-4">
          <div className="mb-6 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-xl">
            Tentang SMP Negeri 112 Jakarta
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg">
            Mengenal Lebih Dekat Sekolah Berkarakter dan Berprestasi
          </p>
        </div>
      </section>

      {/* Sejarah Sekolah Section */}
      <section id="sejarah" className="py-24 container mx-auto px-4 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-primary-600">
              <History className="h-10 w-10" />
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Sejarah Sekolah</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg font-medium">
              SMP Negeri 112 Jakarta didirikan pada tahun 1985 sebagai respons terhadap meningkatnya kebutuhan pendidikan menengah di wilayah Jakarta Utara. Berawal dari bangunan sederhana, sekolah ini terus berkembang menjadi lembaga pendidikan yang modern dan terpercaya.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg font-medium">
              Selama lebih dari tiga dekade, kami telah mendedikasikan diri untuk mencetak lulusan yang tidak hanya unggul dalam bidang akademik, tetapi juga memiliki karakter yang kuat dan akhlak mulia.
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary-100 rounded-[2.5rem] blur-2xl group-hover:bg-primary-200 transition-colors"></div>
            <img 
              src="/foto smp 112 zaman dahulu.jpg" 
              alt="Gedung Sekolah SMPN 112 Zaman Dahulu" 
              className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover border-8 border-white"
            />
          </div>
        </div>
      </section>

      {/* Visi & Misi Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visi */}
            <div className="bg-blue-50/50 rounded-3xl p-10 border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 text-blue-600 mb-8 border-b border-blue-100 pb-6">
                <Eye className="h-10 w-10" />
                <h3 className="text-3xl font-black tracking-tight font-sans">Visi</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg font-bold uppercase tracking-wide">
                MEWUJUDKAN INSAN YANG BERTAQWA, BERNALAR KRITIS, KREATIF, UNGGUL DALAM PRESTASI, BERWAWASAN LINGKUNGAN DAN RAMAH ANAK.
              </p>
            </div>

            {/* Misi */}
            <div className="bg-emerald-50/50 rounded-3xl p-10 border border-emerald-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 text-emerald-600 mb-8 border-b border-emerald-100 pb-6">
                <Target className="h-10 w-10" />
                <h3 className="text-3xl font-black tracking-tight font-sans">Misi</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Meningkatkan keimanan dan ketaqwaan kepada Tuhan YME melalui penanaman budi pekerti dan program kegiatan keagamaan.",
                  "Mewujudkan pengembangan Kurikulum yang meliputi 8 standar pendidikan.",
                  "Mewujudkan pelaksanaan pembelajaran Aktif, Inovatif, Kreatif, Efektif dan menyenangkan dengan pendekatan STUDENT CENTER.",
                  "Meningkatkan prestasi akademik dan non akademik.",
                  "Meningkatkan sikap kejujuran, disiplin, peduli, santun, percaya diri, dalam berinteraksi dengan lingkungan sosial dan alam.",
                  "Mewujudkan pembelajaran dan pengembangan diri yang terintegrasi.",
                  "Dengan Pendidikan Lingkungan Hidup dan P4GN (Pencegahan, Pemberantasan, Penyalahgunaan dan Peredaran Gelap Narkoba).",
                  "Mewujudkan karakter warga sekolah yang berbudi pekerti luhur, bersih dari narkoba dan peduli terhadap kelestarian fungsi lingkungan.",
                  "Mewujudkan kondisi lingkungan sekolah yang bersih, asri dan nyaman untuk mencegah pencemaran dan kerusakan lingkungan.",
                  "Meningkatkan kualitas pelayanan pendidikan kepada masyarakat.",
                  "Mewujudkan lulusan peserta didik dengan penguatan profil pelajar Pancasila."
                ].map((misi, idx) => (
                  <li key={idx} className="flex gap-4 group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    <span className="text-gray-700 font-medium leading-relaxed">
                      <span className="font-black mr-2 text-emerald-600">{idx + 1}.</span>
                      {misi}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Identitas Sekolah Section */}
      <section id="akreditasi" className="py-24 container mx-auto px-4 scroll-mt-24">
        
        {/* Akreditasi Header & Description */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <Award className="h-16 w-16 text-blue-600 mb-2" />
            <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Akreditasi</h2>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Status Akreditasi</h3>
            <p className="text-gray-600 leading-relaxed font-medium text-lg">
              SMP Negeri 112 Jakarta telah meraih Akreditasi A dari Badan Akreditasi Nasional Pendidikan Anak Usia Dini, Dasar, dan Menengah (BAN-PDM). Akreditasi ini menunjukkan bahwa sekolah memenuhi standar nasional dalam hal kualitas pendidikan, manajemen sekolah, fasilitas, dan prestasi siswa.
            </p>
            <p className="text-gray-600 leading-relaxed font-medium text-lg">
              Proses akreditasi dilakukan secara berkala untuk memastikan sekolah terus meningkatkan mutu pendidikan. Kami berkomitmen untuk mempertahankan dan meningkatkan standar ini demi memberikan pendidikan terbaik bagi siswa.
            </p>
          </div>
        </div>

        {/* Akreditasi Details Table */}
        <div className="max-w-3xl mx-auto mb-24">
          <h3 className="text-2xl font-black text-center text-gray-800 tracking-tight uppercase mb-10">Detail Akreditasi</h3>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            {[
              { label: 'Tahun Akreditasi', value: '2022' },
              { label: 'Peringkat', value: 'A' },
              { label: 'Lembaga Akreditasi', value: 'BAN-PDM' },
              { label: 'Nomor SK Akreditasi', value: '1857/BAN-SM/SK/2022' },
              { label: 'Masa Berlaku', value: '2022 - 2027' },
            ].map((item, idx) => (
              <div key={idx} className={`flex p-6 ${idx !== 4 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                <div className="flex-1 font-black text-gray-800 text-sm md:text-base">{item.label}</div>
                <div className="flex-1 text-gray-600 font-bold text-sm md:text-base">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Identitas Sekolah Header */}
        <div className="text-center mb-16 pt-12 border-t border-gray-100">
          <div className="flex items-center justify-center gap-4 text-primary-600 mb-4">
            <Building2 className="h-10 w-10" />
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Identitas Sekolah</h2>
          </div>
        </div>
        
        <div className="bg-gray-50/50 rounded-[3rem] p-8 md:p-12 lg:p-16 border border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/50 blur-[100px] -ml-32 -mb-32 rounded-full"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-2 relative z-10">
            {schoolIdentity.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row py-4 border-b border-gray-200/60 hover:bg-white/50 px-4 rounded-xl transition-all duration-300 group">
                <div className="flex flex-1 w-full justify-between items-center sm:pr-8 mb-1 sm:mb-0">
                  <span className="text-gray-900 font-black text-xs md:text-sm uppercase tracking-wider group-hover:text-primary-600 transition-colors">{item.label}</span>
                  <span className="text-gray-400 font-bold">:</span>
                </div>
                <div className="flex-[1.5] w-full text-left">
                  <span className="text-gray-700 font-bold text-sm md:text-base leading-relaxed">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact Preview in Profile (Optional but good for completeness) */}
      <section id="kontak" className="py-24 container mx-auto px-4">
         {/* Can add another section like Facilities or Staff if needed to match original structure */}
      </section>

    </div>
  )
}
