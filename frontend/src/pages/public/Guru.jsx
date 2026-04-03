import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const CATEGORY_ORDER = [
  { key: 'kepala_sekolah', label: 'Kepala Sekolah & Wakil Kepala Sekolah' },
  { key: 'guru',           label: 'Guru' },
  { key: 'tendik',         label: 'Tenaga Kependidikan' },
]

export default function Guru() {
  const [staffMembers, setStaffMembers] = useState([])
  const [heroContent, setHeroContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchStaff()
  }, [])

  async function fetchStaff() {
    try {
      setLoading(true)
      const { data: heroData } = await supabase
        .from('secondary_content').select('*').eq('slug', 'guru').single()
      if (heroData) setHeroContent(heroData)

      const { data, error } = await supabase
        .from('staff').select('*').order('order_index', { ascending: true })
      if (error) throw error
      setStaffMembers(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const PersonCard = ({ p }) => (
    <div className="bg-white rounded-2xl p-5 text-center shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col items-center border border-gray-100/50">
      <div className="relative mb-4">
        <div className="absolute -inset-1 bg-gradient-to-tr from-primary-400 to-blue-400 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity" />
        <img
          src={p.image_url || '/placeholder-staff.png'}
          alt={p.name}
          loading="lazy"
          className="relative h-20 w-20 rounded-full object-cover border-4 border-white shadow-md z-10"
        />
      </div>
      <h3 className="text-sm font-black text-gray-900 leading-tight mb-1 line-clamp-2">{p.name}</h3>
      <p className="text-primary-600 font-bold text-[10px] tracking-tight mb-1 line-clamp-2 px-1">{p.role}</p>
      {p.subject && (
        <p className="text-gray-400 font-bold text-[10px] italic line-clamp-1">{p.subject}</p>
      )}
    </div>
  )

  // Group by category
  const grouped = CATEGORY_ORDER.map(cat => ({
    ...cat,
    items: staffMembers.filter(m => (m.category || 'guru') === cat.key)
  })).filter(g => g.items.length > 0)

  // Fallback: if no category field, show all as flat list
  const hasCategories = staffMembers.some(m => m.category)

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : 'https://images.unsplash.com/photo-1524178232363-1fb28f74b671?auto=format&fit=crop&q=80'}")`
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative text-center text-white px-4">
          <div className="mb-6 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <img src="/logo.png" alt="Logo SMPN 112" className="h-14 w-14 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-xl uppercase">
            {heroContent?.title || 'Guru & Tenaga Kependidikan'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto">
            {heroContent?.content || 'Mengenal Lebih Dekat Para Pendidik Profesional SMP Negeri 112 Jakarta.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-black uppercase tracking-widest text-xs">Memuat Data Staff...</p>
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest italic">Belum ada data staff.</p>
          </div>
        ) : hasCategories ? (
          /* Grouped by Category */
          <div className="space-y-16">
            {grouped.map(group => (
              <section key={group.key}>
                {/* Section Header - Centered */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-3 mb-3">
                    <div className="h-px w-12 bg-primary-300" />
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{group.label}</h2>
                    <div className="h-px w-12 bg-primary-300" />
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{group.items.length} Orang</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {group.items.map((p) => (
                    <PersonCard key={p.id} p={p} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Flat list (legacy — no category field) */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {staffMembers.map((p) => <PersonCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
