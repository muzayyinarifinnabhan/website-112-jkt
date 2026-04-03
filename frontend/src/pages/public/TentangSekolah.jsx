import { useState, useEffect } from 'react'
import { BookOpen, History, Building2, Eye, Target } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function TentangSekolah() {
  const [history, setHistory] = useState({ content: '', image_url: '' })
  const [vision, setVision] = useState('')
  const [mission, setMission] = useState([])
  const [heroContent, setHeroContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchProfileData()
  }, [])

  async function fetchProfileData() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'tentang-sekolah')
        .single()
      
      if (heroData) setHeroContent(heroData)

      // Fetch Profile Sections
      const { data, error } = await supabase
        .from('school_profile')
        .select('*')
        .in('section_name', ['history', 'vision', 'mission', 'identitas'])
      
      if (error) throw error
      
      if (data) {
        const h = data.find(d => d.section_name === 'history')
        const v = data.find(d => d.section_name === 'vision')
        const m = data.find(d => d.section_name === 'mission')
        const id = data.find(d => d.section_name === 'identitas')
        
        setHistory({ content: h?.content || '', image_url: h?.image_url || '' })
        setVision(v?.content || '')
        setMission(m?.content ? m.content.split('\n') : [])

        // Parse identitas content from "Label: Value" text format
        if (id?.content) {
          const parsed = id.content
            .split('\n')
            .filter(line => line.includes(':'))
            .map(line => {
              const colonIndex = line.indexOf(':')
              return {
                label: line.substring(0, colonIndex).trim(),
                value: line.substring(colonIndex + 1).trim()
              }
            })
            .filter(item => item.label && item.value)
          setIdentitas(parsed)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const [identitas, setIdentitas] = useState([])

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-4 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : '/depan 112.png'}")` 
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
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-xl">
            {heroContent?.title || 'Tentang SMP Negeri 112 Jakarta'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg">
            {heroContent?.content || 'Mengenal Lebih Dekat Sekolah Berkarakter and Berprestasi'}
          </p>
        </div>
      </section>

      {/* Sejarah Sekolah Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-primary-600">
              <History className="h-10 w-10" />
              <h2 className="text-4xl font-black text-gray-900 tracking-tight text-left">Sejarah Sekolah</h2>
            </div>
            <div className="space-y-4">
              {history.content ? history.content.split('\n').map((para, i) => (
                <p key={i} className="text-gray-600 leading-relaxed text-lg font-medium text-left">
                  {para}
                </p>
              )) : (
                <p className="text-gray-400 italic">Memuat sejarah...</p>
              )}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary-100 rounded-[2.5rem] blur-2xl group-hover:bg-primary-200 transition-colors"></div>
            <img 
              src={history.image_url || "/foto smp 112 zaman dahulu.jpg"} 
              alt="Gedung Sekolah SMPN 112" 
              className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover border-8 border-white"
            />
          </div>
        </div>
      </section>

      {/* Visi & Misi Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visi */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm hover:shadow-md transition-all duration-500">
              <div className="flex items-center gap-4 mb-8 text-blue-600">
                <Eye className="h-10 w-10" />
                <h2 className="text-3xl font-black tracking-tight">Visi</h2>
              </div>
              <p className="text-gray-700 font-bold text-lg leading-relaxed uppercase">
                {vision || "MEMUAT VISI..."}
              </p>
            </div>

            {/* Misi */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm hover:shadow-md transition-all duration-500">
              <div className="flex items-center gap-4 mb-8 text-emerald-600">
                <Target className="h-10 w-10" />
                <h2 className="text-3xl font-black tracking-tight">Misi</h2>
              </div>
              <ul className="space-y-4">
                {mission.length > 0 ? mission.map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-gray-700 font-medium leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black mt-1">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                )) : (
                  <li className="text-gray-400 italic">Memuat misi...</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Identitas Sekolah Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16 pt-12 border-t border-gray-100">
          <div className="flex items-center justify-center gap-4 text-primary-600 mb-4">
            <Building2 className="h-10 w-10" />
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Identitas Sekolah</h2>
          </div>
        </div>
        
        <div className="bg-gray-50/50 rounded-[3rem] p-8 md:p-12 lg:p-16 border border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/50 blur-[100px] -ml-32 -mb-32 rounded-full"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-2 relative z-10">
            {identitas.length > 0 ? identitas.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row py-4 border-b border-gray-200/60 hover:bg-white/50 px-4 rounded-xl transition-all duration-300 group">
                <div className="flex flex-1 w-full justify-between items-center sm:pr-8 mb-1 sm:mb-0">
                  <span className="text-gray-900 font-black text-xs md:text-sm uppercase tracking-wider group-hover:text-primary-600 transition-colors">{item.label}</span>
                  <span className="text-gray-400 font-bold">:</span>
                </div>
                <div className="flex-[1.5] w-full text-left">
                  <span className="text-gray-700 font-bold text-sm md:text-base leading-relaxed">{item.value}</span>
                </div>
              </div>
            )) : (
              <p className="col-span-2 text-center text-gray-400 italic py-8">Data identitas sekolah belum diisi. Silakan isi melalui dashboard admin.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
