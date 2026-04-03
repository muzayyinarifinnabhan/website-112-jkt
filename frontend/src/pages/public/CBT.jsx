import { useState, useEffect } from 'react'
import { 
  MonitorPlay, ExternalLink, ShieldCheck, Loader2, 
  CheckCircle2, XCircle, Lightbulb, X
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function CBT() {
  const [content, setContent] = useState({
    hero: null,
    portal: null
  })
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchContent()
  }, [])

  async function fetchContent() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase.from('secondary_content').select('*').eq('slug', 'cbt').single()
      
      // Fetch Portal Card Content
      const { data: portalData } = await supabase.from('secondary_content').select('*').eq('slug', 'cbt_portal').single()
      
      setContent({
        hero: heroData,
        portal: portalData
      })
      
      const { data: guideData } = await supabase.from('cbt_guides').select('*').order('order_index')
      setGuides(guideData || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-xs italic">Memuat Sistem CBT...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("${content.hero?.image_url && content.hero.image_url.trim() !== '' ? content.hero.image_url : 'https://images.unsplash.com/photo-1434031211660-356960c3f5f8?auto=format&fit=crop&q=80'}")` 
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
            {content.hero?.title || 'Sistem CBT'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {content.hero?.content || 'Computer Based Test - Platform Ujian Mandiri Sekolah.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-0">
        <div className="max-w-4xl mx-auto text-center space-y-12">
           <div className="bg-gray-50 rounded-[4rem] p-12 md:p-20 border border-gray-100 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
             
             <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-lg">
                <MonitorPlay className="h-12 w-12" />
             </div>
             
             <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight uppercase">
                {content.portal?.title || 'Portal Ujian Online'}
             </h2>
             
             <div className="prose prose-xl max-w-2xl mx-auto text-gray-600 leading-relaxed font-medium italic mb-12">
                {content.portal?.content || 'Kelola pelaksanaan ujian mandiri Anda secara transparan and efisien melalui platform resmi sekolah.'}
             </div>

             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href={content.hero?.extra_url || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl hover:shadow-primary-200/50 flex items-center justify-center gap-3 group"
                >
                  Buka Portal CBT
                  <ExternalLink className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                
                <button 
                  onClick={() => setShowGuide(true)}
                  className="bg-white text-gray-700 border border-gray-200 px-10 py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                >
                  Panduan Penggunaan
                </button>
             </div>
           </div>

           <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-xs">
              <ShieldCheck className="h-4 w-4" />
              Koneksi Aman & Terenskripsi
           </div>
        </div>
      </div>

      {/* Guide Modal (The "Beautiful UI" from Image) */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#F8FAFC] w-full max-w-6xl max-h-[90vh] rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-gray-900 p-8 text-white flex justify-between items-center flex-shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                       <MonitorPlay size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Panduan Pelaksanaan CBT</h2>
                 </div>
                 <button onClick={() => setShowGuide(false)} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all hover:rotate-90">
                    <X size={24} />
                 </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
                 {/* 1. Tata Cara Pelaksanaan (Green) */}
                 <section className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="bg-[#22C55E] p-6 flex items-center gap-4 text-white">
                       <CheckCircle2 size={24} />
                       <h3 className="text-xl font-black uppercase tracking-tight">Tata Cara Pelaksanaan CBT</h3>
                    </div>
                    <div className="p-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {guides.filter(g => g.type === 'tata_cara').map((item) => (
                             <div key={item.id} className="flex items-start gap-4 p-5 bg-emerald-50/20 rounded-2xl border border-emerald-50">
                                <CheckCircle2 className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
                                <p className="text-sm font-bold text-gray-700 leading-relaxed italic">{item.content}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 </section>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                    {/* 2. Yang Tidak Diperbolehkan (Red) */}
                    <section className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                       <div className="bg-[#EF4444] p-6 flex items-center gap-4 text-white">
                          <XCircle size={24} />
                          <h3 className="text-xl font-black uppercase tracking-tight">Yang Tidak Diperbolehkan</h3>
                       </div>
                       <div className="p-8 space-y-4">
                          {guides.filter(g => g.type === 'larangan').map((item) => (
                             <div key={item.id} className="flex items-start gap-4 p-4 bg-red-50/20 rounded-2xl border border-red-50">
                                <XCircle className="text-red-500 mt-1 flex-shrink-0" size={18} />
                                <p className="text-sm font-bold text-gray-700 leading-relaxed italic">{item.content}</p>
                             </div>
                          ))}
                       </div>
                    </section>

                    {/* 3. Tips Sukses Ujian (Yellow) */}
                    <section className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                       <div className="bg-[#F59E0B] p-6 flex items-center gap-4 text-white">
                          <Lightbulb size={24} />
                          <h3 className="text-xl font-black uppercase tracking-tight">Tips Sukses Ujian CBT</h3>
                       </div>
                       <div className="p-8 space-y-4">
                          {guides.filter(g => g.type === 'tips').map((item, idx) => (
                             <div key={item.id} className="flex items-start gap-4 p-4 bg-amber-50/20 rounded-2xl border border-amber-50">
                                <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 shadow-sm">
                                   {idx + 1}
                                </div>
                                <p className="text-sm font-bold text-gray-700 leading-relaxed italic">{item.content}</p>
                             </div>
                          ))}
                       </div>
                    </section>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
