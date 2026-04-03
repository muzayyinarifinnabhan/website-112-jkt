import { useState, useEffect } from 'react'
import { Users, Target, Rocket, Heart, Eye, Camera, Loader2, ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function OSIS() {
  const [osisData, setOsisData] = useState({ vision: '', mission: '' })
  const [heroContent, setHeroContent] = useState(null)
  const [members, setMembers] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchOsisAndActivities()
  }, [])

  async function fetchOsisAndActivities() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'osis')
        .single()
      
      if (heroData) setHeroContent(heroData)

      const { data: infoData } = await supabase.from('osis_info').select('*')
      const { data: actData } = await supabase.from('student_activities').select('*').limit(6).order('activity_date', { ascending: false })
      
      const v = infoData?.find(d => d.section_name === 'vision')
      const m = infoData?.find(d => d.section_name === 'mission')
      
      const { data: memberData } = await supabase
        .from('osis_members')
        .select('*')
        .order('order_index', { ascending: true })
      
      setOsisData({
        vision: v?.content || '',
        mission: m?.content || ''
      })
      setMembers(memberData || [])
      setActivities(actData || [])
    } catch (error) {
      console.error('Error fetching OSIS data:', error.message)
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
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-xl uppercase text-white">
            {heroContent?.title || 'OSIS & MPK'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {heroContent?.content || 'Wadah Kepemimpinan and Aspirasi Siswa SMP Negeri 112 Jakarta.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="animate-spin mb-4" size={48} />
             <p className="font-black uppercase tracking-widest text-xs">Memuat Informasi Organisasi...</p>
          </div>
        ) : (
          <>
            {/* Visi & Misi Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
              {/* Visi */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm hover:shadow-md transition-all duration-500 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8 text-blue-600">
                  <Eye className="h-10 w-10" />
                  <h2 className="text-3xl font-black tracking-tight uppercase">Visi OSIS</h2>
                </div>
                <p className="text-gray-700 font-bold text-lg md:text-xl leading-relaxed uppercase italic relative z-10">
                  {osisData.vision || 'MEWUJUDKAN OSIS SMP NEGERI 112 SEBAGAI WADAH ASPIRASI DAN KREATIVITAS SISWA YANG BERLANDASKAN IMTAK DAN IPTEK.'}
                </p>
                <Eye className="absolute -bottom-6 -right-6 h-32 w-32 text-blue-100/50 -rotate-12" />
              </div>

              {/* Misi */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm hover:shadow-md transition-all duration-500">
                <div className="flex items-center gap-4 mb-8 text-emerald-600">
                  <Target className="h-10 w-10" />
                  <h2 className="text-3xl font-black tracking-tight uppercase">Misi OSIS</h2>
                </div>
                <ul className="space-y-6">
                  {osisData.mission ? osisData.mission.split('\n').map((item, idx) => (
                    <li key={idx} className="flex gap-4 items-start text-gray-700 font-bold leading-relaxed">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black mt-1">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  )) : (
                    <li className="text-gray-400 font-medium italic">Data misi belum tersedia.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Struktur Organisasi Section */}
            <div className="py-20 border-t border-gray-100">
               {/* OSIS SECTION */}
               <div className="text-center mb-16 px-4">
                 <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 tracking-tighter uppercase leading-none">Struktur Organisasi OSIS</h2>
                 <p className="text-gray-500 font-medium italic max-w-2xl mx-auto">Pengurus Organisasi Siswa Intra Sekolah</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto mb-32">
                  {members.filter(m => m.type === 'OSIS').map((member) => (
                    <div key={member.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500">
                       <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-gray-50 mb-6 overflow-hidden border-4 border-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center">
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                               <Users size={64} strokeWidth={1} />
                            </div>
                          )}
                       </div>
                       <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{member.name}</h3>
                       <p className="text-sm font-black text-blue-500 uppercase tracking-widest italic">{member.position}</p>
                    </div>
                  ))}
               </div>

               {/* MPK SECTION */}
               <div className="text-center mb-16 px-4">
                 <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 tracking-tighter uppercase leading-none">Struktur Organisasi MPK</h2>
                 <p className="text-gray-500 font-medium italic max-w-2xl mx-auto">Pengurus Majelis Perwakilan Kelas</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                  {members.filter(m => m.type === 'MPK').map((member) => (
                    <div key={member.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500">
                       <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-gray-50 mb-6 overflow-hidden border-4 border-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center">
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                               <Users size={64} strokeWidth={1} />
                            </div>
                          )}
                       </div>
                       <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight group-hover:text-purple-600 transition-colors uppercase">{member.name}</h3>
                       <p className="text-sm font-black text-purple-500 uppercase tracking-widest italic">{member.position}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Gallery Section */}
            <div className="pt-24 pb-8 border-t border-gray-100">
               <div className="text-center mb-16">
                  <div className="flex justify-center mb-6">
                     <div className="bg-pink-100 p-4 rounded-2xl">
                        <Camera className="h-10 w-10 text-pink-600" />
                     </div>
                  </div>
                 <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase leading-none">Galeri Kesiswaan</h2>
                 <p className="text-gray-500 font-medium italic">Dokumentasi kegiatan and aktivitas organisasi siswa</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activities.length > 0 ? activities.map((item) => (
                    <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl group hover:shadow-2xl transition-all duration-500 flex flex-col">
                       <div className="h-64 overflow-hidden relative">
                        <img 
                          src={item.image_url || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop"} 
                          alt={item.title} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                       </div>
                       <div className="p-8">
                          <h5 className="font-black text-gray-900 mb-2 uppercase tracking-tight text-lg leading-tight line-clamp-2">{item.title}</h5>
                          <p className="text-xs text-pink-600 uppercase tracking-widest font-black italic mb-4">
                            {new Date(item.activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">
                             {item.description}
                          </p>
                       </div>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-10 text-gray-400 font-black uppercase text-xs italic">
                       Belum ada dokumentasi kegiatan kesiswaan.
                    </div>
                  )}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
