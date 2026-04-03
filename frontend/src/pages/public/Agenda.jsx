import { useState, useEffect } from 'react'
import { CalendarDays, Clock, MapPin, Loader2, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Agenda() {
  const [agendas, setAgendas] = useState([])
  const [heroContent, setHeroContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchAgendas()
  }, [])

  async function fetchAgendas() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'agenda')
        .single()
      
      if (heroData) setHeroContent(heroData)

      const { data, error } = await supabase
        .from('agenda')
        .select('*')
        .order('event_date', { ascending: true })
      
      if (error) throw error
      setAgendas(data || [])
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
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : 'https://images.unsplash.com/photo-1506784919141-910403759392?auto=format&fit=crop&q=80'}")` 
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
            {heroContent?.title || 'Agenda Kegiatan'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {heroContent?.content || 'Jadwal and Rencana Kegiatan Akademik serta Non-Akademik.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="animate-spin mb-4" size={48} />
             <p className="font-black uppercase tracking-widest text-xs">Memuat Agenda...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
             {agendas.length > 0 ? agendas.map((item) => (
               <div key={item.id} className="flex gap-8 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors"></div>
                  <div className="flex-shrink-0 relative z-10">
                     <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex flex-col items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                        <CalendarDays className="h-8 w-8" />
                     </div>
                  </div>
                  <div className="space-y-4 relative z-10 flex-1">
                     <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight uppercase">{item.title}</h3>
                     <div className="flex flex-col gap-3 text-gray-500 font-bold text-sm italic">
                        <div className="flex items-center gap-3">
                           <Clock className="h-5 w-5 text-blue-600" /> 
                           <span>{new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} | {item.start_time?.slice(0, 5)} {item.end_time ? `- ${item.end_time?.slice(0, 5)}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <MapPin className="h-5 w-5 text-blue-600" /> 
                           <span>{item.location}</span>
                        </div>
                     </div>
                     {item.description && <p className="text-gray-400 text-xs font-medium leading-relaxed mt-2 line-clamp-2">{item.description}</p>}
                  </div>
               </div>
             )) : (
               <div className="col-span-full py-32 text-center bg-gray-50 rounded-[4rem] border border-dashed border-gray-200">
                  <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-400 font-black italic uppercase tracking-widest text-xs">Tidak ada agenda kegiatan terdekat.</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  )
}
