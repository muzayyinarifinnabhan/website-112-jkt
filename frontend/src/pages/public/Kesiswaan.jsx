import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Award, Target, Users, Activity } from 'lucide-react'

export default function Kesiswaan() {
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

  const menus = [
    { id: 'ekstrakurikuler', title: 'Ekstrakurikuler', icon: Target, desc: 'Pramuka, Paskibra, PMR, Rohis, Rokris, Basket, Futsal, Tari Tradisional, Paduan Suara, Jurnalistik.', color: 'bg-green-500' },
    { id: 'prestasi', title: 'Prestasi Siswa', icon: Award, desc: 'Juara 1 OSN Matematika Tingkat Provinsi, Juara Umum Lomba Paskibra tingkat Kota, Medali Emas Taekwondo.', color: 'bg-yellow-500' },
    { id: 'osis', title: 'OSIS & MPK', icon: Users, desc: 'Organisasi siswa intra sekolah yang menjadi wadah pengembangan kepemimpinan dan karakter siswa.', color: 'bg-blue-500' },
    { id: 'kegiatan', title: 'Kegiatan Siswa', icon: Activity, desc: 'Class Meeting, LDKS, Pesantren Kilat, Retret, Study Tour, dan Perayaan Hari Besar Nasional/Agama.', color: 'bg-indigo-500' },
  ]

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen pb-20">
      <div className="bg-primary-600 text-white py-20 pb-28 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">Kesiswaan</h1>
        <p className="text-primary-100 max-w-2xl mx-auto text-lg">Mewadahi kreativitas, bakat, dan pembentukan karakter kepemimpinan siswa SMP Negeri 112 Jakarta.</p>
      </div>

      <div className="container mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menus.map((menu, idx) => (
            <div key={idx} id={menu.id} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all flex flex-col items-start group scroll-mt-32">
              <div className={`${menu.color} text-white p-4 rounded-xl mb-6 shadow-md transform group-hover:-translate-y-2 transition-transform duration-300`}>
                <menu.icon className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{menu.title}</h2>
              <p className="text-gray-600 leading-relaxed">
                {menu.desc}
              </p>
              <button className="mt-8 text-primary-600 font-semibold text-sm hover:underline">
                Lihat Selengkapnya →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
