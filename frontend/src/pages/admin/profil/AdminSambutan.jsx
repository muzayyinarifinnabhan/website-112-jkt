import { useState, useEffect } from 'react'
import { Save, X, MessageSquare, Image as ImageIcon, Upload, Loader2, Edit2, LayoutGrid, FileText } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { uploadImage } from '../../../lib/storage'

export default function AdminSambutan() {
  const { toasts, toast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')
  const [uploading, setUploading] = useState(false)

  const [heroForm, setHeroForm] = useState({
    title: 'Sambutan Kepala Sekolah',
    content: 'Pesan dan Harapan Pemimpin Sekolah SMP Negeri 112 Jakarta.',
    image_url: ''
  })

  const [sambutanForm, setSambutanForm] = useState({
    title: '', // Headmaster's name
    content: '',
    image_url: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      
      // Fetch Hero
      const { data: heroData } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', 'sambutan')
        .single()
      
      if (heroData) {
        setHeroForm({
          title: heroData.title || 'Sambutan Kepala Sekolah',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }

      // Fetch Sambutan Content
      const { data: dbData } = await supabase
        .from('school_profile')
        .select('*')
        .eq('section_name', 'remarks')
        .single()
      
      if (dbData) {
        setSambutanForm({
          title: dbData.title || '',
          content: dbData.content || '',
          image_url: dbData.image_url || ''
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHeroChange = (e) => {
    setHeroForm({ ...heroForm, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e, formType) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const url = await uploadImage(file)
      if (formType === 'hero') {
        setHeroForm({ ...heroForm, image_url: url })
      } else {
        setSambutanForm({ ...sambutanForm, image_url: url })
      }
    } catch (error) {
      toast.error('Upload gagal: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Save Hero
      const { error: heroErr } = await supabase
        .from('secondary_content')
        .upsert({
          slug: 'sambutan',
          title: heroForm.title,
          content: heroForm.content,
          image_url: heroForm.image_url
        })
      
      if (heroErr) throw heroErr

      // Save Sambutan
      const { error: contentErr } = await supabase
        .from('school_profile')
        .upsert({
          section_name: 'remarks',
          title: sambutanForm.title,
          content: sambutanForm.content,
          image_url: sambutanForm.image_url,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_name' })
      
      if (contentErr) throw contentErr

      toast.success('Berhasil disimpan!')
      fetchData()
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Memuat Data...</p>
    </div>
  )

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-orange-500 text-white p-4 rounded-3xl shadow-2xl shadow-orange-100 ring-8 ring-orange-50">
            <MessageSquare size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Sambutan Kepala Sekolah</h1>
            <p className="text-gray-500 font-bold italic text-sm">Kelola Hero and Isi Sambutan Kepala Sekolah.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-100 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Simpan Semua
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-gray-100 rounded-[2rem] max-w-md mx-auto shadow-inner">
        <button 
          onClick={() => setActiveTab('hero')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'hero' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <LayoutGrid size={16} /> Header Hero
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'content' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <FileText size={16} /> Isi Sambutan
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
                    name="title"
                    value={heroForm.title}
                    onChange={handleHeroChange}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Contoh: Sambutan Kepala Sekolah"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul (Deskripsi Singkat)</label>
                  <textarea 
                    name="content"
                    value={heroForm.content}
                    onChange={handleHeroChange}
                    rows={4}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                    placeholder="Contoh: Pesan and Harapan Pemimpin Sekolah..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Gambar Background Hero</label>
                <div className="relative group">
                  <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-gray-50 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
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
                    <input 
                      type="file" 
                      id="hero-bg"
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'hero')} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="hero-bg"
                      className="flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-black transition-all shadow-xl active:scale-95"
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
          <div className="p-8 md:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nama Kepala Sekolah</label>
                  <input 
                    value={sambutanForm.title}
                    onChange={(e) => setSambutanForm({...sambutanForm, title: e.target.value})}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Contoh: Dwinanto Salip, S.Pd"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Isi Pesan Sambutan</label>
                  <textarea 
                    value={sambutanForm.content}
                    onChange={(e) => setSambutanForm({ ...sambutanForm, content: e.target.value })}
                    rows={10}
                    className="w-full p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed text-lg italic"
                    placeholder="Tuliskan kata-kata sambutan..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Foto Kepala Sekolah (Potret)</label>
                <div className="relative group">
                  <div className="aspect-[3/4] bg-gray-50 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
                    {sambutanForm.image_url ? (
                      <img src={sambutanForm.image_url} alt="Principal" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                        <ImageIcon size={48} />
                        <span className="text-xs font-black uppercase tracking-widest">Belum Ada Foto</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <input 
                      type="file" 
                      id="remarks-img"
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'content')} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="remarks-img"
                      className="flex items-center justify-center gap-3 p-5 bg-orange-50 text-orange-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-orange-100 transition-all shadow-sm active:scale-95 border border-orange-100"
                    >
                      {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                      {uploading ? 'Mengunggah...' : 'Unggah Foto Profile'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  )
}



