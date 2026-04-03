import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight, Loader2, Bell } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Pengumuman() {
  const [announcements, setAnnouncements] = useState([])
  const [heroContent, setHeroContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'pengumuman')
        .single()
      
      if (heroData) setHeroContent(heroData)

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : 'https://images.unsplash.com/photo-1504917595217-d4dc5f64d0b9?auto=format&fit=crop&q=80'}")` 
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        
        {/* Hero Content */}
        <div className="relative text-center text-white px-4">
          <div className="mb-6 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <img src="/logo.png" alt="Logo SMPN 112" className="h-14 w-14 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-xl uppercase text-white">
            {heroContent?.title || 'Pengumuman Terbaru'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {heroContent?.content || 'Informasi Resmi and Terkini Mengenai Seluruh Kegiatan Sekolah.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="animate-spin mb-4" size={48} />
             <p className="font-black uppercase tracking-widest text-xs">Memuat Pengumuman...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.length > 0 ? announcements.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-xl border-l-[6px] border-red-600 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full"
              >
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1542152331393-f384a5697240?q=80&w=2032&auto=format&fit=crop'} 
                    alt={item.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center text-red-600 font-bold text-sm mb-4 uppercase tracking-widest italic">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4 leading-tight group-hover:text-red-600 transition-colors uppercase tracking-tight line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 flex-1 line-clamp-3 italic">
                    {item.content}
                  </p>
                  <div className="mt-auto">
                     <Link 
                       to={`/informasi/pengumuman/${item.id}`}
                       className="flex items-center text-red-600 font-black text-xs uppercase tracking-[0.2em] group/btn transition-all"
                     >
                       Baca Selengkapnya <ArrowRight className="h-4 w-4 ml-2 transform group-hover/btn:translate-x-2 transition-transform" />
                     </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                 <Bell className="mx-auto text-gray-300 mb-4" size={48} />
                 <p className="text-gray-400 font-bold italic uppercase tracking-widest text-xs">Belum ada pengumuman terbaru saat ini.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
