import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Megaphone, BookOpen, MonitorPlay, CreditCard, CalendarDays } from 'lucide-react'

export default function Informasi() {
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

  const infos = [
    { id: 'pengumuman', title: 'Pengumuman Resmi', icon: Megaphone, link: '#' },
    { id: 'kurikulum', title: 'Kurikulum Merdeka', icon: BookOpen, link: '#' },
    { id: 'cbt', title: 'Sistem CBT (Ujian Online)', icon: MonitorPlay, link: '#', external: true },
    { id: 'kjp', title: 'Info KJP / PIP', icon: CreditCard, link: '#' },
    { id: 'agenda', title: 'Agenda Kegiatan Akademik', icon: CalendarDays, link: '#' },
  ]

  return (
    <div className="animate-fade-in bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 drop-shadow-sm">Pusat Informasi</h1>
          <p className="text-xl text-gray-600">Layanan informasi terpadu untuk siswa, wali murid, dan masyarakat umum.</p>
        </div>

        <div className="space-y-4">
          {infos.map((info, idx) => (
            <a 
              href={info.link} 
              key={idx} 
              id={info.id}
              target={info.external ? '_blank' : '_self'}
              className="flex items-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-primary-500 hover:shadow-md transition-all group scroll-mt-32"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mr-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <info.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">{info.title}</h2>
              </div>
              <div className="text-gray-400 group-hover:text-primary-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
