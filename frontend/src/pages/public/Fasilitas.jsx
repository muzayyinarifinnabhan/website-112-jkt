import { useState, useEffect } from 'react'
import { LayoutGrid, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Fasilitas() {
  const [facilities, setFacilities] = useState([])
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      // Fetch Facilities
      const { data: facData } = await supabase.from('facilities').select('*').order('order_index')
      setFacilities(facData || [])
      
      // Fetch Hero Content
      const { data: secData } = await supabase.from('secondary_content').select('*').eq('slug', 'fasilitas').single()
      setContent(secData)
    } catch (error) {
      console.error('Error fetching fasilitas:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-xs italic">Menyiapkan Informasi Fasilitas...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in bg-[#FAFAFA] min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[350px] md:h-[450px] flex items-center justify-center overflow-hidden">
         {/* Background Image with Blur */}
         <div 
           className="absolute inset-0 bg-cover bg-center scale-110 blur-[2px] bg-gray-900 transition-all duration-1000"
           style={{ 
             backgroundImage: `url("${content?.image_url && content.image_url.trim() !== '' ? content.image_url : 'https://images.unsplash.com/photo-1523050335392-9ae8a27d011e?auto=format&fit=crop&q=80'}")` 
           }}
         >
            <div className="absolute inset-0 bg-black/60"></div>
         </div>

         {/* Hero Content */}
         <div className="relative z-10 text-center px-4 max-w-4xl animate-in zoom-in-95 duration-700">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
               <img src="/logo.png" alt="Logo SMPN 112" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
               {content?.title || 'Fasilitas Sekolah'}
            </h1>
            <p className="text-lg md:text-xl font-medium text-white/80 italic max-w-2xl mx-auto leading-relaxed">
               {content?.content || 'Sarana dan Prasarana Penunjang Kegiatan Belajar Mengajar.'}
            </p>
         </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {facilities.map((fac, idx) => (
            <div key={fac.id || idx} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col h-full border border-gray-100/50 hover:-translate-y-2">
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={fac.image_url || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80"} 
                  alt={fac.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="p-8 flex flex-col items-center text-center flex-grow">
                <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tighter group-hover:text-primary-600 transition-colors uppercase leading-tight">
                  {fac.name}
                </h3>
                <div className="w-10 h-1 bg-primary-100 mb-4 rounded-full group-hover:w-20 transition-all duration-500"></div>
                <p className="text-gray-500 leading-relaxed font-bold text-xs italic">
                   {fac.description}
                </p>
              </div>
            </div>
          ))}
          {facilities.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
               <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] italic">Belum ada daftar fasilitas sekolah yang diunggah.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
