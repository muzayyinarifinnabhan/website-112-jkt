import { useState, useEffect } from 'react'
import { 
  CreditCard, ClipboardCheck, FileText, Calendar, 
  Users, Download, Loader2, Info
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function KJP() {
  const [content, setContent] = useState(null)
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchContent()
  }, [])

  async function fetchContent() {
    try {
      setLoading(true)
      const { data: secData } = await supabase.from('secondary_content').select('*').eq('slug', 'kjp').single()
      setContent(secData)
      const { data: guideData } = await supabase.from('kjp_pip_guides').select('*').order('order_index')
      setGuides(guideData || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const ProgramCard = ({ title, type, color, bgMain, bgLight, icon: MainIcon, fileUrl }) => {
    const categories = [
      { key: 'requirements', label: `Persyaratan ${type.toUpperCase()}`, icon: ClipboardCheck },
      { key: 'schedule', label: `Jadwal Kegiatan ${type.toUpperCase()}`, icon: Calendar },
      { key: 'documents', label: 'Dokumen yang Diperlukan', icon: FileText },
      { key: 'flow', label: 'Cara Pendaftaran', icon: Users }
    ]

    return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full animate-in slide-in-from-bottom duration-700">
        {/* Card Header */}
        <div className={`${bgLight} p-6 border-b border-gray-100 flex items-center justify-center gap-4`}>
           <div className={`p-2 ${bgMain} text-white rounded-lg`}>
              <MainIcon size={24} />
           </div>
           <h2 className={`text-2xl font-black ${color} uppercase tracking-tight`}>{title}</h2>
        </div>

        {/* Card Body */}
        <div className="p-8 md:p-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
           {categories.map((cat) => (
             <section key={cat.key} className="space-y-4">
                <div className={`flex items-center gap-3 ${color} font-black uppercase tracking-tight text-sm`}>
                   <cat.icon size={20} />
                   <h3>{cat.label}</h3>
                </div>
                <div className="space-y-3">
                   {guides.filter(g => g.program === type && g.category === cat.key).map((item, idx) => (
                     <div key={item.id} className="flex items-start gap-3">
                        {cat.key === 'flow' ? (
                           <span className="text-xs font-black text-gray-400 mt-1">{idx + 1}.</span>
                        ) : (
                           <span className="text-gray-400 mt-1">•</span>
                        )}
                        <p className="text-sm font-bold text-gray-600 leading-relaxed italic">{item.content}</p>
                     </div>
                   ))}
                   {guides.filter(g => g.program === type && g.category === cat.key).length === 0 && (
                      <p className="text-xs text-gray-300 italic">Data belum tersedia.</p>
                   )}
                </div>
             </section>
           ))}
        </div>

        {/* Card Footer (Download Button) */}
        <div className="p-8 pt-0 flex justify-center">
           <a 
             href={fileUrl || "#"} 
             target="_blank" 
             rel="noopener noreferrer"
             className={`${fileUrl ? bgMain + ' hover:opacity-90' : 'bg-gray-200 cursor-not-allowed'} text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg active:scale-95`}
           >
              <Download size={18} />
              Unduh Panduan {type.toUpperCase()}
           </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-xs italic">Menyiapkan Informasi KJP & PIP...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in bg-[#FAFAFA] min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden border-b-8 border-primary-600">
         {/* Background Image with Blur */}
         <div 
           className="absolute inset-0 bg-cover bg-center scale-110 blur-[2px] bg-gray-900"
           style={{ 
             backgroundImage: `url("${content?.image_url && content.image_url.trim() !== '' ? content.image_url : 'https://images.unsplash.com/photo-1523050335392-9ae8a27d011e?auto=format&fit=crop&q=80'}")` 
           }}
         >
            <div className="absolute inset-0 bg-black/60"></div>
         </div>

         {/* Hero Content */}
         <div className="relative z-10 text-center px-4 max-w-4xl animate-in zoom-in-95 duration-700">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
               <Info className="text-white w-10 h-10 md:w-12 md:h-12" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
               {content?.title || 'KJP / PIP'}
            </h1>
            <p className="text-lg md:text-xl font-medium text-white/80 italic max-w-2xl mx-auto leading-relaxed">
               {content?.content || 'Layanan Bantuan Pendidikan Terintegrasi'}
            </p>
         </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-7xl -mt-24 relative z-20">
        
        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 gap-16">
           {/* Section KJP */}
           <ProgramCard 
              title="Kartu Jakarta Pintar (KJP)" 
              type="kjp"
              color="text-blue-600"
              bgMain="bg-[#2563EB]"
              bgLight="bg-[#EFF6FF]"
              icon={CreditCard}
              fileUrl={content?.file_url}
           />

           {/* Section PIP */}
           <ProgramCard 
              title="Program Indonesia Pintar (PIP)" 
              type="pip"
              color="text-emerald-600"
              bgMain="bg-[#10B981]"
              bgLight="bg-[#ECFDF5]"
              icon={Info}
              fileUrl={content?.extra_url}
           />
        </div>

        {/* Extra Info Grid (Operational & Contact) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 animate-in slide-in-from-bottom duration-1000">
           {/* Jam Operasional */}
           <div className="bg-white p-10 rounded-[2.5rem] border-2 border-yellow-200 shadow-xl shadow-yellow-50/50">
              <div className="flex items-center gap-3 mb-8">
                 <div className="bg-yellow-100 p-3 rounded-2xl text-yellow-600">
                    <Calendar className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">Jam Operasional Layanan</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600 font-bold italic">
                 {guides.filter(g => g.category === 'operational').map(item => (
                   <p key={item.id}>{item.content}</p>
                 ))}
                 {guides.filter(g => g.category === 'operational').length === 0 && (
                   <p className="text-gray-400">Jadwal belum tersedia.</p>
                 )}
              </div>
           </div>

           {/* Kontak Bantuan */}
           <div className="bg-white p-10 rounded-[2.5rem] border-2 border-purple-200 shadow-xl shadow-purple-50/50">
              <div className="flex items-center gap-3 mb-8">
                 <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
                    <Users className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">Kontak Bantuan</h3>
              </div>
              <div className="space-y-6 text-sm text-gray-600 font-bold italic">
                 {guides.filter(g => g.category === 'contact').map(item => (
                   <p key={item.id} className="flex items-center gap-3">
                     {item.content}
                   </p>
                 ))}
                 {guides.filter(g => g.category === 'contact').length === 0 && (
                   <p className="text-gray-400">Kontak belum tersedia.</p>
                 )}
              </div>
           </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-[#F8FAFC] p-10 md:p-14 rounded-[4rem] border border-gray-100 shadow-inner animate-in slide-in-from-bottom duration-1000">
           <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">Pertanyaan Yang Sering Diajukan (FAQ)</h3>
           </div>
           <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              {guides.filter(g => g.category === 'faq').map(item => (
                <div key={item.id} className="space-y-3">
                   <h4 className="font-black text-gray-900 text-sm md:text-base leading-snug">Q: {item.content}</h4>
                   <p className="text-gray-500 font-bold italic text-sm leading-relaxed">A: {item.sub_content}</p>
                </div>
              ))}
              {guides.filter(g => g.category === 'faq').length === 0 && (
                <p className="text-center text-gray-400 italic font-bold">Belum ada FAQ tersedia.</p>
              )}
           </div>
        </div>

        {/* Footer Detail Section */}
        <div className="mt-24 flex items-center justify-center gap-6 md:gap-10 opacity-70">
           <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
           <p className="text-[11px] md:text-sm font-black text-gray-400 uppercase tracking-[0.4em] italic text-center leading-loose">
              INFORMASI INI DIKELOLA SECARA RESMI OLEH PETUGAS TATA USAHA KJP/PIP
           </p>
           <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>

      </div>

      {/* Tailwind Specific Style for Custom List Spacing if needed */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  )
}
