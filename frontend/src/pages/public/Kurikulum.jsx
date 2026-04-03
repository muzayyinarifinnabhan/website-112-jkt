import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Kurikulum() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchContent()
  }, [])

  async function fetchContent() {
    try {
      const { data, error } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'kurikulum')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      setContent(data)
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
            backgroundImage: `url("${content?.image_url && content.image_url.trim() !== '' ? content.image_url : 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80'}")` 
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
            {content?.title || 'Kurikulum Sekolah'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {content?.extra_url || 'Implementasi Kurikulum Merdeka untuk Masa Depan Gemilang.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="animate-spin mb-4" size={48} />
             <p className="font-black uppercase tracking-widest text-xs">Memuat Kurikulum...</p>
          </div>
        ) : content ? (
           <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl border border-gray-50 relative overflow-hidden">
                 <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50"></div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10 text-primary-600">
                       <div className="p-4 bg-primary-50 rounded-3xl">
                          <BookOpen size={32} />
                       </div>
                       <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Detail Kurikulum</h2>
                    </div>


                    <div className="prose prose-xl max-w-none text-gray-600 leading-[2] font-medium italic whitespace-pre-wrap">
                       {content.content}
                    </div>

                    <div className="mt-16 flex items-center justify-center p-8 bg-primary-50 rounded-[3rem] border border-primary-100 gap-4">
                       <Sparkles className="text-primary-500" size={24} />
                       <p className="text-primary-700 font-black text-sm uppercase tracking-widest leading-none">Informasi kurikulum ini diperbarui secara berkala oleh Bagian Kurikulum.</p>
                    </div>
                 </div>
              </div>
           </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12">
             <div className="bg-gray-50 rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-xl">
               <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight uppercase">Kurikulum Merdeka</h2>
               <p className="text-gray-600 leading-relaxed text-lg font-medium mb-8 italic">
                 SMP Negeri 112 Jakarta menerapkan Kurikulum Merdeka yang menitikberatkan pada pengembangan karakter Profil Pelajar Pancasila and fleksibilitas pembelajaran sesuai minat bakat siswa.
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    'Pembelajaran Berbasis Projek (P5)',
                    'Penguatan Literasi & Numerasi',
                    'Ekstrakurikuler Pilihan Beragam',
                    'Asesmen Diagnostik Berkala'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      <span className="font-bold text-gray-700">{item}</span>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
