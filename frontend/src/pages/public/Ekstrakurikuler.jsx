import { useState, useEffect } from 'react'
import { User, Calendar, Clock, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Ekstrakurikuler() {
  const [ekskuls, setEkskuls] = useState([])
  const [heroContent, setHeroContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchEkskuls()
  }, [])

  async function fetchEkskuls() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'ekstrakurikuler')
        .single()
      
      if (heroData) setHeroContent(heroData)

      const { data, error } = await supabase
        .from('ekskul')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      setEkskuls(data || [])
    } catch (error) {
      console.error('Error fetching ekskul:', error.message)
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
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : 'https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?auto=format&fit=crop&q=80'}")` 
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
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-xl uppercase">
            {heroContent?.title || 'Ekstrakurikuler'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {heroContent?.content || 'Wadah Pengembangan Bakat and Minat Siswa SMP Negeri 112 Jakarta.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="animate-spin mb-4" size={48} />
             <p className="font-black uppercase tracking-widest text-xs">Memuat Ekskul...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {ekskuls.length > 0 ? ekskuls.map((e, idx) => (
              <div key={e.id} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100/50 flex flex-col group hover:shadow-2xl transition-all duration-500">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={e.image_url || 'https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=2070&auto=format&fit=crop'} 
                    alt={e.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase leading-tight line-clamp-1">{e.name}</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8 flex-1 italic">
                    {e.description}
                  </p>
                  
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                      <span className="text-[13px] font-bold text-gray-500">
                        Pelatih: <span className="text-gray-900">{e.coach || '-'}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary-400 shrink-0" />
                      <span className="text-[13px] font-bold text-gray-500">{e.schedule_day || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary-400 shrink-0" />
                      <span className="text-[13px] font-bold text-gray-500">{e.schedule_time || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 text-gray-400 font-bold italic">
                Belum ada data ekstrakurikuler yang tersedia.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
