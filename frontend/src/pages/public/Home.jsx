import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Trophy, Award, ArrowRight, Calendar, CheckCircle2, Building2, Megaphone, Camera, UserCircle, LayoutGrid, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import SEO from '../../components/SEO'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [expandedIdx, setExpandedIdx] = useState(null)

  const [sliders, setSliders] = useState([])
  const [features, setFeatures] = useState([])
  const [stats, setStats] = useState([])
  const [whyUs, setWhyUs] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [latestNews, setLatestNews] = useState([])
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  async function fetchHomeData() {
    try {
      // Fetch Sliders
      const { data: sliderData } = await supabase.from('sliders').select('*').eq('is_active', true).order('order_index')
      setSliders(sliderData || [])

      // Fetch Features
      const { data: featureData } = await supabase.from('featured_menus').select('*').order('order_index')
      setFeatures(featureData || [])

      // Fetch Stats
      const { data: statData } = await supabase.from('statistics').select('*').order('order_index')
      setStats(statData || [])

      // Fetch Why Us
      const { data: whyData } = await supabase.from('why_us').select('*').order('order_index')
      setWhyUs(whyData || [])

      // Fetch Latest News
      const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(3)
      setLatestNews(newsData || [])

      // Fetch Announcements
      const { data: annData } = await supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3)
      setAnnouncements(annData || [])

      // Fetch Gallery - Limit 15
      const { data: galData } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);
      setGalleryItems(galData || []);

    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sliders.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [sliders])

  return (
    <div className="animate-fade-in pb-20 overflow-x-hidden">
      <SEO
        title="Beranda"
        description="Website resmi SMP Negeri 112 Jakarta. Informasi terkini tentang sekolah, berita, kegiatan siswa, PPDB, prestasi, dan pengumuman resmi."
      />

      {/* Hero / Slider Section */}
      <section className="relative h-[600px] w-full overflow-hidden bg-slate-900">
        {sliders.length > 0 ? sliders.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${idx === currentSlide ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-110 translate-x-full'
              }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image_url})` }}
            >
              <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            </div>

            <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
              <div className="mb-6 animate-slide-up">
                <img src="/logo.png" alt="Logo SMPN 112 Jakarta" className="h-32 md:h-40 w-auto drop-shadow-2xl" />
              </div>
              <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl font-light max-w-3xl mb-10 text-gray-200 drop-shadow animate-slide-up" style={{ animationDelay: '200ms' }}>
                {slide.subtitle || ''}
              </p>
            </div>
          </div>
        )) : (
          <div className="h-full flex items-center justify-center text-white font-bold animate-pulse">
            Loading Awesome Content...
          </div>
        )}

        {/* Slider Indicators */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {sliders.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-blue-500 w-10' : 'bg-white/50 hover:bg-white'
                }`}
            />
          ))}
        </div>
      </section>

      {/* Menu Unggulan */}
      <section className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const icons = { Building2, Megaphone, Trophy, Camera, LayoutGrid }
            const IconComp = icons[feature.icon_name] || LayoutGrid

            return (
              <Link
                key={idx}
                to={feature.path || '#'}
                className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 duration-300"
              >
                <div className={`${feature.color || 'text-blue-600'} mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  <IconComp className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const icons = { Users, Trophy, Award, UserCircle, Star }
              const IconComp = icons[stat.icon] || Star
              const colors = ['text-blue-600', 'text-indigo-600', 'text-yellow-600', 'text-emerald-600']

              return (
                <div key={idx} className="text-center p-10 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all group">
                  <div className={`${colors[idx % colors.length]} mb-6 flex justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <IconComp className="h-10 w-10" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">{stat.value}</div>
                  <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">{stat.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mengapa Memilih Kami */}
      <section className="py-24 bg-blue-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">Mengapa Memilih SMP Negeri 112 Jakarta?</h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              Kami berkomitmen untuk menyediakan pendidikan terbaik yang membentuk siswa menjadi pribadi berkarakter, cerdas, dan siap menghadapi masa depan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: School Image */}
            <div className="relative group animate-slide-right">
              <div className="absolute -inset-4 bg-blue-200/50 rounded-[2.5rem] blur-2xl group-hover:bg-blue-300/50 transition-colors"></div>
              <img
                src="/depan 112.png"
                alt="Gedung SMPN 112 Jakarta"
                className="relative rounded-3xl shadow-2xl w-full h-[450px] object-cover border-8 border-white"
              />
            </div>

            {/* Right: Features List */}
            <div className="space-y-4 animate-slide-left">
              {whyUs.map((item, idx) => (
                <div key={idx} className="flex items-start group">
                  <div className="mt-1 flex-shrink-0 bg-white shadow-sm border border-blue-100 p-1.5 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="ml-5">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pengumuman Terbaru */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-slide-up">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Pengumuman Terbaru</h2>
            <p className="text-gray-600 font-medium">Informasi penting dan pengumuman resmi dari sekolah</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {announcements.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-xl border-l-[6px] border-red-600 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Card Image */}
                <div className="h-56 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542152331393-f384a5697240?q=80&w=2032&auto=format&fit=crop'}
                    alt={item.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Card Content */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center text-red-600 font-bold text-xs mb-4 uppercase tracking-widest italic">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4 leading-tight group-hover:text-red-600 transition-colors uppercase tracking-tight line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3 italic">
                    {item.content}
                  </p>
                  <Link
                    to={`/informasi/pengumuman/${item.id}`}
                    className="flex items-center text-red-600 font-black text-xs uppercase tracking-[0.2em] hover:gap-3 transition-all mt-auto group/btn"
                  >
                    Baca Selengkapnya <ArrowRight className="h-4 w-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              to="/informasi"
              className="bg-red-600 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center gap-3 group"
            >
              Lihat Semua Pengumuman
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Berita Terbaru */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-slide-up">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Berita Terbaru</h2>
            <p className="text-gray-600 font-medium">Ikuti perkembangan dan kegiatan terbaru di SMP Negeri 112 Jakarta</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {latestNews.map((news, idx) => (
              <div
                key={news.id}
                className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-50 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* News Image */}
                <div className="h-56 overflow-hidden">
                  <img
                    src={news.image_url || 'https://images.unsplash.com/photo-1566121404019-3ee7248e8983?q=80&w=2070&auto=format&fit=crop'}
                    alt={news.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* News Content */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center text-blue-600 font-bold text-xs mb-4 uppercase tracking-widest italic">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3 italic">
                    {news.content}
                  </p>
                  <Link
                    to={`/berita/${news.id}`}
                    className="flex items-center text-blue-600 font-black text-xs uppercase tracking-[0.2em] hover:gap-3 transition-all mt-auto group/btn"
                  >
                    Baca Selengkapnya <ArrowRight className="h-4 w-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              to="/berita"
              className="bg-blue-600 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-3 group"
            >
              Lihat Semua Berita
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Galeri Sekolah */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-slide-up">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Galeri Sekolah</h2>
            <p className="text-gray-600 font-medium">Dokumentasi kegiatan, fasilitas, dan video pembelajaran SMP Negeri 112 Jakarta</p>
          </div>

          {/* GRID UTAMA: Tambahkan 'grid-auto-flow-dense' */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16 auto-rows-[200px] grid-auto-flow-dense">
            {galleryItems.map((item, idx) => {
              // Pola: Item ke-1 (0), ke-6 (5), ke-11 (10) dsb akan menjadi besar
              // Ini menciptakan variasi bento yang stabil
              const isLarge = idx % 5 === 0;

              return (
                <Link
                  key={item.id}
                  to="/galeri"
                  className={`relative group overflow-hidden rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 
              ${isLarge
                      ? 'col-span-2 row-span-2'
                      : 'col-span-1 row-span-1'
                    }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Background Image - Tetap mempertahankan object-cover agar tidak gepeng */}
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-70 group-hover:opacity-85 transition-opacity"></div>

                  {/* Play Icon for Video */}
                  {item.is_video && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 transform group-hover:scale-110 transition-transform">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    {item.is_video && (
                      <span className="inline-block bg-red-600 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded mb-2">VIDEO</span>
                    )}
                    <h4 className={`font-bold mb-1 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 uppercase ${isLarge ? 'text-xl' : 'text-xs md:text-sm'}`}>
                      {item.title}
                    </h4>

                    {isLarge && item.description && (
                      <p className="text-gray-300 text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 italic hidden md:block">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Link
              to="/galeri"
              className="bg-gray-800 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-gray-900 transition-all shadow-xl flex items-center gap-3 group"
            >
              Lihat Galeri Lengkap
              <ArrowRight className="h-6 w-6 transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
