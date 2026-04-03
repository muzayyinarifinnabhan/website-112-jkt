import { useState, useEffect } from 'react'
import { Calendar, User, ArrowLeft, Share2, Loader2, Newspaper } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function BeritaDetail() {
  const { id } = useParams()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news?.title,
          text: 'Buka tautan ini untuk membaca berita selengkapnya!',
          url: window.location.href,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Tautan disalin ke clipboard!')
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchNews()
  }, [id])

  async function fetchNews() {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setNews(data)
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
        <p className="font-black uppercase tracking-widest text-xs italic">Memuat Berita...</p>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 max-w-lg w-full">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
             <Newspaper size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Berita Tidak Ditemukan</h2>
          <p className="text-gray-500 font-medium italic mb-8">Maaf, berita yang Anda cari mungkin telah dihapus atau dipindahkan.</p>
          <Link to="/berita" className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
            <ArrowLeft className="mr-2" size={16} strokeWidth={3} /> Kembali ke Berita
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen py-10 pb-20 animate-fade-in mt-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/berita" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-[0.2em] mb-8 transition-colors group">
          <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" /> Kembali ke Berita
        </Link>
        
        <div className="mb-10">
           <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 italic">
              <span className="bg-indigo-50 px-3 py-1 rounded-full">{news.category || 'Warta Sekolah'}</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tight uppercase">
             {news.title}
           </h1>
           
           <div className="flex flex-wrap items-center text-gray-400 gap-6 border-b border-gray-100 pb-8">
             <div className="flex items-center gap-2">
               <Calendar className="h-5 w-5 text-indigo-500" />
               <span className="font-black text-[11px] tracking-widest uppercase">
                 {new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
               </span>
             </div>
             <div className="flex items-center gap-2 border-l pl-6 border-gray-200">
               <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest italic">Penulis:</span>
               <span className="font-black text-xs text-gray-900 uppercase">{news.author}</span>
             </div>
             <button onClick={handleShare} className="flex items-center ml-auto hover:text-indigo-600 transition-colors text-[10px] font-black uppercase tracking-[0.3em] gap-2">
               <Share2 className="h-4 w-4" /> Bagikan
             </button>
           </div>
        </div>
        
        {news.image_url && (
          <div className="rounded-[3rem] overflow-hidden mb-12 shadow-2xl border-l-[10px] border-indigo-600 group">
            <img 
              src={news.image_url} 
              alt={news.title} 
              className="w-full h-auto object-cover max-h-[600px] group-hover:scale-105 transition-transform duration-1000" 
            />
          </div>
        )}
        
        <article className="prose prose-lg max-w-none text-gray-700 leading-[2] text-lg font-medium italic">
          {news.content.split('\n').map((paragraph, idx) => (
             paragraph.trim() && <p key={idx} className="mb-8 italic">{paragraph.trim()}</p>
          ))}
        </article>
      </div>
    </div>
  )
}
