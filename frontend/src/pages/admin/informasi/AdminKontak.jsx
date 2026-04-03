import { useState, useEffect } from 'react'
import { Save, Phone, MapPin, Mail, Clock, Facebook, Instagram, Youtube, Loader2, Globe, LayoutGrid, FileText, Image as ImageIcon, Upload } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { uploadImage } from '../../../lib/storage'

export default function AdminKontak() {
  const { toasts, toast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')

  const [heroForm, setHeroForm] = useState({
    title: 'Hubungi Kami',
    content: 'Kami siap membantu menjawab berbagai pertanyaan Anda seputar sekolah kami.',
    image_url: ''
  })

  const [contact, setContact] = useState({
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    opening_hours: '',
    map_url: '',
    facebook: '',
    instagram: '',
    youtube: ''
  })

  useEffect(() => {
    fetchContact()
  }, [])

  async function fetchContact() {
    try {
      // Fetch Hero
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'kontak')
        .single()
      
      if (heroData) {
        setHeroForm({
          title: heroData.title || 'Hubungi Kami',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }

      // Fetch Contact
      const { data, error } = await supabase
        .from('school_profile')
        .select('*')
        .eq('section_name', 'contact')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      if (data && data.content) {
        try {
          const parsed = JSON.parse(data.content)
          setContact(parsed)
        } catch (e) {
          setContact(prev => ({ ...prev, address: data.content }))
        }
      }
    } catch (error) {
      console.error('Error fetching contact:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHero = async () => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('secondary_content')
        .upsert({
          slug: 'kontak',
          title: heroForm.title,
          content: heroForm.content,
          image_url: heroForm.image_url
        })
      if (error) throw error
      toast.success('Hero berhasil disimpan!')
    } catch (error) {
      toast.error('Gagal: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const publicUrl = await uploadImage(file, 'website')
      setHeroForm({ ...heroForm, image_url: publicUrl })
    } catch (error) {
      toast.error('Gagal mengunggah: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const { error } = await supabase
        .from('school_profile')
        .upsert({ 
          section_name: 'contact',
          content: JSON.stringify(contact),
          title: 'Informasi Kontak Sekolah',
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_name' })
      
      if (error) throw error
      toast.info('Kontak berhasil disimpan!')
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Memuat Data Kontak...</p>
    </div>
  )

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 text-white p-4 rounded-3xl shadow-2xl shadow-blue-100 flex items-center justify-center">
            <Phone size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Informasi Kontak</h1>
            <p className="text-gray-500 font-bold italic text-sm mt-1">Kelola Hero and Informasi Kontak Sekolah.</p>
          </div>
        </div>
        {activeTab === 'hero' && (
          <button 
            onClick={handleSaveHero}
            disabled={saving || uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Simpan Hero
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-gray-100 rounded-[2rem] max-w-md mx-auto shadow-inner">
        <button 
          onClick={() => setActiveTab('hero')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'hero' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <LayoutGrid size={16} /> Header Hero
        </button>
        <button 
          onClick={() => setActiveTab('kontak')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'kontak' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <FileText size={16} /> Data Kontak
        </button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
        {activeTab === 'hero' ? (
          <div className="p-8 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Judul Hero (Headline)</label>
                  <input 
                    value={heroForm.title}
                    onChange={(e) => setHeroForm({...heroForm, title: e.target.value})}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Contoh: Hubungi Kami"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul (Deskripsi Singkat)</label>
                  <textarea 
                    value={heroForm.content}
                    onChange={(e) => setHeroForm({...heroForm, content: e.target.value})}
                    rows={4}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                    placeholder="Deskripsi singkat halaman kontak..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Gambar Background Hero</label>
                <div className="relative group">
                  <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                    {heroForm.image_url ? (
                      <img src={heroForm.image_url} alt="Hero BG" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                        <ImageIcon size={48} />
                        <span className="text-xs font-black uppercase tracking-widest">Belum Ada Gambar</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <input type="file" id="hero-bg" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <label 
                      htmlFor="hero-bg"
                      className="flex items-center justify-center gap-3 p-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-900 transition-all shadow-xl active:scale-95"
                    >
                      {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                      {uploading ? 'Mengunggah...' : 'Ganti Gambar Hero'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Informasi Dasar */}
                  <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                      <MapPin className="text-blue-600" size={24} /> Informasi Dasar
                    </h2>
                    
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Alamat Lengkap</label>
                      <textarea 
                        rows="3"
                        value={contact.address}
                        onChange={e => setContact({...contact, address: e.target.value})}
                        className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700"
                        placeholder="Masukkan alamat lengkap sekolah..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Telepon</label>
                        <input 
                          type="text"
                          value={contact.phone}
                          onChange={e => setContact({...contact, phone: e.target.value})}
                          className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700"
                          placeholder="(021) XXX-XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">WhatsApp</label>
                        <input 
                          type="text"
                          value={contact.whatsapp}
                          onChange={e => setContact({...contact, whatsapp: e.target.value})}
                          className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700"
                          placeholder="+62 8XX-XXXX-XXXX"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Email</label>
                        <input 
                          type="email"
                          value={contact.email}
                          onChange={e => setContact({...contact, email: e.target.value})}
                          className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700"
                          placeholder="info@sekolah.sch.id"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Jam Operasional</label>
                        <input 
                          type="text"
                          value={contact.opening_hours}
                          onChange={e => setContact({...contact, opening_hours: e.target.value})}
                          className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700"
                          placeholder="Senin - Jumat: 07:00 - 15:00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lokasi Map */}
                  <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                      <Globe className="text-emerald-600" size={24} /> Lokasi (Google Maps)
                    </h2>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Google Maps Embed URL (Hanya isi bagian src="")</label>
                      <input 
                        type="text"
                        value={contact.map_url}
                        onChange={e => setContact({...contact, map_url: e.target.value})}
                        className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-emerald-100 font-bold text-gray-700 text-xs"
                        placeholder="https://www.google.com/maps/embed?pb=..."
                      />
                    </div>
                    {contact.map_url && (
                      <div className="rounded-2xl overflow-hidden border-2 border-emerald-50 aspect-video">
                        <iframe src={contact.map_url} width="100%" height="100%" loading="lazy"></iframe>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Social Media */}
                  <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                      <Instagram className="text-pink-600" size={24} /> Media Sosial
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Facebook size={20} /></div>
                        <input 
                          type="text"
                          value={contact.facebook}
                          onChange={e => setContact({...contact, facebook: e.target.value})}
                          className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700 text-xs"
                          placeholder="Facebook URL"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-50 text-pink-600 rounded-xl"><Instagram size={20} /></div>
                        <input 
                          type="text"
                          value={contact.instagram}
                          onChange={e => setContact({...contact, instagram: e.target.value})}
                          className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-pink-100 font-bold text-gray-700 text-xs"
                          placeholder="Instagram URL"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Youtube size={20} /></div>
                        <input 
                          type="text"
                          value={contact.youtube}
                          onChange={e => setContact({...contact, youtube: e.target.value})}
                          className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-red-100 font-bold text-gray-700 text-xs"
                          placeholder="Youtube URL"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 hover:-translate-y-1"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Simpan Semua Perubahan
                  </button>
                  
                  <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl">
                    <h4 className="font-black uppercase tracking-widest text-[10px] mb-4 opacity-60 flex items-center gap-2">
                      <Clock size={14} /> Sinkronisasi Otomatis
                    </h4>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">
                      Perubahan yang Anda simpan di sini akan langsung memperbarui info kontak di:
                      <ul className="mt-3 space-y-2 list-disc pl-4 italic">
                        <li>Halaman Kontak Utama</li>
                        <li>Footer Seluruh Website</li>
                        <li>Topbar Navigasi Atas</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  </>
  )
}



