import { useState, useEffect } from 'react'
import { Calendar, ArrowRight, Loader2, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import SEO from '../../components/SEO'

export default function BeritaList() {
  const [news, setNews] = useState([])
  const [heroContent, setHeroContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchNews()
  }, [])

  async function fetchNews() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'berita')
        .single()
      
      if (heroData) setHeroContent(heroData)

      // Fetch News
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setNews(data || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in bg-white min-h-screen overflow-x-hidden">
      <SEO title="Berita" description="Baca berita terbaru dan informasi kegiatan terkini dari SMP Negeri 112 Jakarta." />
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : 'https://images.unsplash.com/photo-1504711432869-efd597cdd04b?auto=format&fit=crop&q=80'}")` 
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
            {heroContent?.title || 'Berita Sekolah'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {heroContent?.content || 'Informasi and kegiatan terbaru dari lingkungan SMP Negeri 112 Jakarta.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-12">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="animate-spin mb-4" size={48} />
             <p className="font-black uppercase tracking-widest text-xs">Memuat Berita...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {news.length > 0 ? news.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group flex flex-col border border-gray-100/50">
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1566121404019-3ee7248e8983?q=80&w=2070&auto=format&fit=crop'} 
                    alt={item.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute top-6 left-6 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                     {item.category || 'Berita'}
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <div className="flex items-center text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mb-6 italic">
                    <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 mb-8 line-clamp-3 text-sm leading-relaxed font-medium italic">{item.content}</p>
                  <Link to={`/berita/${item.id}`} className="mt-auto inline-flex items-center text-indigo-600 font-black text-xs uppercase tracking-[0.3em] hover:text-indigo-700 transition-colors group/link">
                    Baca Selengkapnya
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover/link:translate-x-2 transition-transform stroke-[3]" />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                 <Newspaper className="mx-auto text-gray-200 mb-4" size={64} />
                 <p className="text-gray-400 font-black italic uppercase tracking-widest text-xs">Belum ada berita yang diterbitkan.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
