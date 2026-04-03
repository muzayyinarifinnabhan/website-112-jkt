import { useState, useEffect } from 'react'
import { Calendar, Users, Star, Camera, Loader2, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function KegiatanSiswa() {
  const [activities, setActivities] = useState([])
  const [heroContent, setHeroContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchActivities()
  }, [])

  async function fetchActivities() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'kegiatan-siswa')
        .single()
      
      if (heroData) setHeroContent(heroData)

      const { data, error } = await supabase
        .from('student_activities')
        .select('*')
        .order('activity_date', { ascending: false })
      
      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error.message)
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
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : 'https://images.unsplash.com/photo-1523050853064-8521b3530f2d?auto=format&fit=crop&q=80'}")` 
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
            {heroContent?.title || 'Kegiatan Siswa'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {heroContent?.content || 'Dinamika and Semangat Kebersamaan Siswa SMP Negeri 112 Jakarta.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="animate-spin mb-4" size={48} />
             <p className="font-black uppercase tracking-widest text-xs">Memuat Galeri Kegiatan...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.length > 0 ? activities.map((act) => (
              <div key={act.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100/50 flex flex-col group hover:-translate-y-2 transition-all duration-500">
                <div className="h-48 relative overflow-hidden">
                   <img 
                     src={act.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop'} 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                     alt={act.title} 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-[10px] font-black uppercase flex items-center gap-2">
                         <Calendar size={12} className="text-primary-400" />
                         {new Date(act.activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                   </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight uppercase leading-tight line-clamp-2">{act.title}</h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed italic line-clamp-3">
                    {act.description}
                  </p>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 text-gray-400 font-bold italic">
                Belum ada dokumentasi kegiatan siswa yang tersedia.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
