import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Akreditasi() {
  const [data, setData] = useState({ description: '', details: [], image_url: '' })
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  const defaultDesc = `SMP Negeri 112 Jakarta telah meraih Akreditasi A dari Badan Akreditasi Nasional Pendidikan Anak Usia Dini, Dasar, dan Menengah (BAN-PDM). Akreditasi ini menunjukkan bahwa sekolah memenuhi standar nasional dalam hal kualitas pendidikan, manajemen sekolah, fasilitas, dan prestasi siswa.\n\nProses akreditasi dilakukan secara berkala untuk memastikan sekolah terus meningkatkan mutu pendidikan. Kami berkomitmen untuk meningkatkan standar ini demi memberikan pendidikan terbaik bagi siswa.`
  
  const defaultDetails = [
    { id: 1, label: 'Tahun Akreditasi', value: '2022' },
    { id: 2, label: 'Peringkat', value: 'A' },
    { id: 3, label: 'Lembaga Akreditasi', value: 'BAN-PDM' },
    { id: 4, label: 'Nomor SK Akreditasi', value: '1857/BAN-SM/SK/2022' },
    { id: 5, label: 'Masa Berlaku', value: '2022 - 2027' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const { data: heroData } = await supabase
        .from('secondary_content').select('*').eq('slug', 'akreditasi').single()
      if (heroData) setContent(heroData)

      const { data: dbData, error } = await supabase
        .from('school_profile').select('content, image_url').eq('section_name', 'accreditation').single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      if (dbData) {
        try {
          const parsed = dbData.content ? JSON.parse(dbData.content) : {};
          setData({
            description: parsed.description || defaultDesc,
            details: parsed.details?.length ? parsed.details : defaultDetails,
            image_url: dbData.image_url
          });
        } catch {
          setData({ description: dbData.content || defaultDesc, details: defaultDetails, image_url: dbData.image_url });
        }
      } else {
        setData({ description: defaultDesc, details: defaultDetails, image_url: '' });
      }
    } catch (error) {
      console.error('Error fetching accreditation:', error.message)
      setData({ description: defaultDesc, details: defaultDetails, image_url: '' });
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="animate-fade-in bg-[#FAFAFA] min-h-screen">
      {/* Skeleton Hero */}
      <div className="relative h-[350px] md:h-[450px] bg-slate-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 animate-pulse" />
        <div className="relative text-center space-y-4">
          <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto animate-pulse" />
          <div className="h-10 w-64 bg-white/10 rounded-2xl mx-auto animate-pulse" />
          <div className="h-5 w-48 bg-white/10 rounded-xl mx-auto animate-pulse" />
        </div>
      </div>
      {/* Skeleton Content */}
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-16 flex flex-col items-center gap-6">
          <Loader2 className="animate-spin text-blue-400" size={40} />
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Memuat Data Akreditasi...</p>
          <div className="w-full space-y-4 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in bg-[#FAFAFA] min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[350px] md:h-[450px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-[2px] bg-gray-900 transition-all duration-1000"
          style={{ 
            backgroundImage: `url("${content?.image_url && content.image_url.trim() !== '' ? content.image_url : 'https://images.unsplash.com/photo-1523050335392-9ae8a27d011e?auto=format&fit=crop&q=80'}")` 
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl animate-in zoom-in-95 duration-700">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl p-4">
            <img src="/logo.png" alt="Logo SMPN 112" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-2xl">
            {content?.title || 'Akreditasi Sekolah'}
          </h1>
          <p className="text-lg md:text-xl font-medium text-white/80 italic max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            {content?.content || 'Mengenal Lebih Dekat Sekolah Berkarakter and Berprestasi'}
          </p>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden p-8 md:p-16">
          
          {/* Status Akreditasi */}
          <div className="text-center mb-16">
            <h1 className="text-2xl md:text-3xl font-black text-slate-700 tracking-wider mb-8">STATUS AKREDITASI</h1>
            <div className="text-slate-500 leading-relaxed text-base space-y-6 max-w-3xl mx-auto">
              {data.description.split('\n').map((para, i) => para.trim() ? <p key={i} className="text-justify md:text-center">{para}</p> : null)}
            </div>
          </div>

          {/* Detail Akreditasi */}
          <div className="mt-20">
            <h2 className="text-2xl md:text-3xl font-black text-slate-700 tracking-wider mb-8 text-center">DETAIL AKREDITASI</h2>
            <div className="border border-slate-100 rounded-lg overflow-hidden shadow-sm">
               {data.details.map((detail, index) => (
                 <div 
                   key={detail.id} 
                   className={`flex flex-col sm:flex-row p-6 items-start sm:items-center ${
                     index !== data.details.length - 1 ? 'border-b border-slate-100' : ''
                   } hover:bg-slate-50/50 transition-colors`}
                 >
                   <span className="w-full sm:w-1/3 font-bold text-slate-700 text-[15px]">{detail.label}</span>
                   <span className="w-full sm:w-2/3 font-medium text-slate-600 mt-2 sm:mt-0 text-[15px]">{detail.value}</span>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
