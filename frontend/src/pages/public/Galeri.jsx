import { useState, useEffect } from 'react'
import { Camera, Play, Search, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Galeri() {
  const [activeTab, setActiveTab] = useState('Semua')
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchGalleries()
  }, [])

  async function fetchGalleries() {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGalleries(data || [])
    } catch (error) {
      console.error('Error fetching gallery:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = ['Semua', 'Fasilitas', 'Kegiatan', 'Prestasi', 'Acara']

  const filteredGalleries = activeTab === 'Semua'
    ? galleries
    : galleries.filter(item => item.category === activeTab)

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse italic">
        Memuat Galeri Terlengkap...
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-blue-100 p-4 rounded-2xl inline-block mb-6 shadow-sm border border-blue-200">
            <Camera className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Galeri Sekolah</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium italic">Momen dan fasilitas terbaik di SMP Negeri 112 Jakarta</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 border shadow-sm
                ${activeTab === tab
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100 scale-105'
                  : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:border-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGalleries.map((item) => (
            <div
              key={item.id}
              onClick={() => item.is_video ? setSelectedVideo(item) : setSelectedImage(item)}
              className={`group relative rounded-3xl overflow-hidden shadow-xl aspect-square bg-gray-900 border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer`}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-70"
              />

              {/* Category Tag */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-white/50">
                  {item.category}
                </span>
              </div>

              {/* Play Icon Overlay */}
              {item.is_video && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-white p-5 rounded-full shadow-2xl transform group-hover:scale-125 transition-all duration-500 border-4 border-white/20">
                    <Play className="h-8 w-8 text-blue-600 fill-blue-600 ml-1" />
                  </div>
                </div>
              )}

              {/* YouTube Tag */}
              {item.video_url && item.video_url.includes('youtu') && (
                <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg border border-red-500">
                  YouTube
                </div>
              )}

              {/* Text Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/60 to-transparent pt-24 z-10">
                <h3 className="text-white font-black text-sm leading-tight mb-2 line-clamp-2 uppercase tracking-tight group-hover:text-blue-200 transition-colors">
                  {item.title}
                </h3>
                {/* Deskripsi sekarang selalu muncul (opacity-100 dan tanpa translate-y) */}
                <p className="text-gray-300 text-[10px] font-bold line-clamp-2 leading-relaxed opacity-100 transition-all duration-500 italic">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredGalleries.length === 0 && (
          <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
            <Search className="h-16 w-16 text-gray-200 mx-auto mb-6" strokeWidth={1} />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Belum ada konten untuk kategori ini.</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedVideo(null)}></div>
          <div className="relative bg-black rounded-[2.5rem] w-full max-w-5xl aspect-video shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/10 group">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-6 right-6 z-20 p-3 bg-white/10 hover:bg-red-600 text-white rounded-2xl backdrop-blur-md transition-all border border-white/10 hover:scale-110 active:scale-95"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="w-full h-full">
              {selectedVideo.video_url?.includes('youtu') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.video_url)}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                ></video>
              )}
            </div>

            {/* Info Toast inside Modal */}
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <h2 className="text-white font-black text-lg uppercase tracking-tight leading-tight">{selectedVideo.title}</h2>
              <p className="text-gray-400 text-xs mt-2 italic line-clamp-1">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}></div>
          <div className="relative rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center animate-in zoom-in duration-300 group">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 p-3 bg-white/10 hover:bg-red-600 text-white rounded-2xl backdrop-blur-md transition-all border border-white/10 hover:scale-110 active:scale-95"
            >
              <X size={24} strokeWidth={3} />
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-3xl shadow-2xl"
            />
            {/* Modal Text Info */}
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl">
              <h2 className="text-white font-black text-xl uppercase tracking-widest">{selectedImage.title}</h2>
              <p className="text-gray-300 text-sm mt-2 font-medium italic">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
