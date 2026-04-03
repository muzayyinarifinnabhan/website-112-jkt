import { useState, useEffect } from 'react'
import { BookOpen, Quote } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Sambutan() {
  const [profile, setProfile] = useState(null)
  const [heroContent, setHeroContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchSambutan()
  }, [])

  async function fetchSambutan() {
    try {
      setLoading(true)
      // Fetch Hero Content
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'sambutan')
        .single()
      
      if (heroData) setHeroContent(heroData)

      // Fetch Sambutan Content
      const { data, error } = await supabase
        .from('school_profile')
        .select('*')
        .eq('section_name', 'remarks')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      if (data) setProfile(data)
    } catch (error) {
      console.error('Error fetching remarks:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-4 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : 'https://images.unsplash.com/photo-1544717297-fa95b3ee51f3?q=80&w=2070&auto=format&fit=crop'}")` 
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
            {heroContent?.title || 'Sambutan Kepala Sekolah'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg">
            {heroContent?.content || 'Pesan dan Harapan Pemimpin Sekolah SMP Negeri 112 Jakarta.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto bg-gray-50 rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center relative z-10">
            <div className="lg:col-span-1 space-y-6">
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary-200/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img 
                  src={profile?.image_url || "https://images.unsplash.com/photo-1544717297-fa95b3ee51f3?q=80&w=2070&auto=format&fit=crop"} 
                  alt="Kepala Sekolah" 
                  className="relative rounded-full w-64 h-64 object-cover mx-auto border-8 border-white shadow-xl"
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{profile?.title || 'Dwinanto Salip, S.Pd'}</h3>
                <p className="text-primary-600 font-bold uppercase tracking-widest text-sm">Kepala Sekolah</p>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Quote className="h-16 w-16 text-primary-200" />
              <div className="space-y-6 text-gray-700 leading-relaxed font-medium text-lg italic">
                {profile?.content ? (
                  profile.content.split('\n').map((para, i) => (
                    <p key={i}>"{para}"</p>
                  ))
                ) : (
                  <p className="text-gray-400">"{loading ? 'Memuat sambutan...' : 'Belum ada pesan yang ditambahkan.'}"</p>
                )}
                <div className="flex justify-end">
                  <Quote className="h-16 w-16 text-primary-200 rotate-180" />
                </div>
              </div>

              {/* Signature Section */}
              <div className="mt-12 text-right space-y-1 relative z-10">
                <p className="text-gray-600 font-medium">Hormat kami,</p>
                <h4 className="text-xl font-black text-gray-900">{profile?.title || 'Dwinanto Salip, S.Pd'}</h4>
                <p className="text-gray-500 text-sm font-bold">Kepala SMP Negeri 112 Jakarta</p>
              </div>
            </div>
          </div>
          {/* Decorative Background Quote */}
          <Quote className="absolute -bottom-8 -right-8 h-64 w-64 text-primary-100/50 -rotate-12 z-0 opacity-50" />
        </div>
      </div>
    </div>
  )
}
