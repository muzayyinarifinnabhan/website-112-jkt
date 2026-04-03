import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Kontak() {
  const { contact } = useOutletContext()
  const [heroContent, setHeroContent] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    supabase
      .from('secondary_content')
      .select('*')
      .eq('slug', 'kontak')
      .single()
      .then(({ data }) => { if (data) setHeroContent(data) })
  }, [])

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("${heroContent?.image_url && heroContent.image_url.trim() !== '' ? heroContent.image_url : 'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?auto=format&fit=crop&q=80'}")` 
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
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-xl uppercase text-white">
            {heroContent?.title || 'Hubungi Kami'}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {heroContent?.content || 'Kami siap membantu menjawab berbagai pertanyaan Anda seputar sekolah kami.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 pb-0 max-w-6xl">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Info Cards */}
          <div className="col-span-1 space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start group hover:bg-primary-50 transition-colors">
              <MapPin className="h-6 w-6 text-primary-600 mr-4 mt-1" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">Alamat</h3>
                <p className="text-gray-600">{contact.address}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start group hover:bg-primary-50 transition-colors">
              <Phone className="h-6 w-6 text-primary-600 mr-4 mt-1" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">Telepon & WhatsApp</h3>
                <p className="text-gray-600">{contact.phone}<br />{contact.whatsapp}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start group hover:bg-primary-50 transition-colors">
              <Mail className="h-6 w-6 text-primary-600 mr-4 mt-1" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">Email</h3>
                <p className="text-gray-600">{contact.email}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start group hover:bg-primary-50 transition-colors">
              <Clock className="h-6 w-6 text-primary-600 mr-4 mt-1" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">Jam Operasional</h3>
                <p className="text-gray-600">{contact.opening_hours}</p>
              </div>
            </div>
          </div>

          {/* Maps */}
          <div className="col-span-1 lg:col-span-2 bg-gray-200 rounded-2xl overflow-hidden min-h-[400px]">
            {contact.map_url ? (
              <iframe 
                src={contact.map_url}
                width="100%" 
                height="100%" 
                allowFullScreen="" 
                loading="lazy" 
                className="border-0"
                title="Google Maps SMPN 112 Jakarta"
              ></iframe>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest">
                    Peta Lokasi Belum Tersedia
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
