import { useState, useEffect } from 'react'
import { Calendar, Trophy, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Prestasi() {
  const [achievements, setAchievements] = useState([])
  const [heroContent, setHeroContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchAchievements()
  }, [])

  async function fetchAchievements() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'prestasi')
        .single()
      
      if (heroData) setHeroContent(heroData)

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('year', { ascending: false })
      
      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error('Error fetching achievements:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryStyles = (category) => {
    if (category?.toLowerCase().includes('akademik') && !category?.toLowerCase().includes('non')) {
      return 'bg-blue-100 text-blue-700 border-blue-200'
    }
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80'}")` 
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
            {heroContent?.title || 'Prestasi Peserta Didik'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {heroContent?.content || 'Kebanggaan Sekolah melalui Dedikasi and Kerja Keras Siswa.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="animate-spin mb-4" size={48} />
             <p className="font-black uppercase tracking-widest text-xs">Memuat Prestasi...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.length > 0 ? achievements.map((a, idx) => (
              <div key={a.id} className="bg-white rounded-[2rem] overflow-hidden shadow-[0_15px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 group flex flex-col border border-gray-100/50">
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={a.image_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop'} 
                    alt={a.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all"></div>
                  <div className="absolute top-6 right-6 bg-yellow-400 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg">
                    {a.year}
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight leading-tight group-hover:text-primary-600 transition-colors uppercase line-clamp-2">
                    {a.title}
                  </h3>
                  <p className="text-primary-600 font-bold text-xs mb-6 italic">{a.winner}</p>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed mb-10 flex-1 italic">
                    {a.description}
                  </p>
                  
                  <div className="space-y-4 pt-6 mt-auto border-t border-gray-50">
                     <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryStyles(a.category)}`}>
                      {a.category}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 text-gray-400 font-bold italic">
                Belum ada prestasi yang dicatat.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
