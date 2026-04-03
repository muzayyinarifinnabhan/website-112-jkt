import { useState, useEffect } from 'react'
import { Save, FileText, Upload, Loader2, Check, Globe, Info, LayoutGrid, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { uploadImage } from '../../../lib/storage'

export default function AdminSecondary({ slug, title: defaultTitle }) {
  const { toasts, toast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: defaultTitle || '',
    content: '',
    image_url: '',
    file_url: '',
    extra_url: ''
  })

  useEffect(() => {
    fetchContent()
  }, [slug])

  async function fetchContent() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('secondary_content')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setFormData({
          title: data.title || defaultTitle || '',
          content: data.content || '',
          image_url: data.image_url || '',
          file_url: data.file_url || '',
          extra_url: data.extra_url || ''
        })
      }
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const publicUrl = await uploadImage(file, 'website')
      setFormData({ ...formData, image_url: publicUrl })
    } catch (error) {
      toast.error('Gagal mengunggah: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const { error } = await supabase
        .from('secondary_content')
        .upsert({ 
          slug, 
          ...formData, 
          updated_at: new Date().toISOString() 
        })
      
      if (error) throw error
      toast.info('Konten berhasil disimpan!')
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
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
          <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2x flex items-center justify-center">
            <FileText size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{defaultTitle || formData.title}</h1>
            <p className="text-gray-500 font-bold italic text-sm mt-1">Kelola Hero and Konten Halaman {slug}.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving || uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
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
            ${activeTab === 'hero' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <LayoutGrid size={16} /> Header Hero
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'content' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <FileText size={16} /> Data Konten
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
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Judul halaman..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul Hero (Deskripsi Singkat)</label>
                  <textarea 
                    value={formData.extra_url}
                    onChange={(e) => setFormData({ ...formData, extra_url: e.target.value })}
                    rows={3}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                    placeholder="Masukkan subjudul hero di sini..."
                  />
                </div>
                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                  <Info className="text-blue-500 mt-1 shrink-0" size={20} />
                  <p className="text-[11px] font-bold text-blue-700 italic leading-relaxed">
                    Subjudul hero ini bersifat dinamis and akan tampil tepat di bawah judul utama pada halaman publik.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Gambar Background Hero</label>
                <div className="relative group">
                  <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Hero BG" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
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
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
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
          <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">Isi Konten Utama</label>
                <textarea 
                  required
                  rows={15}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-8 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed resize-none"
                  placeholder="Masukkan detail konten kurikulum di sini..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">Link File Unduhan</label>
                  <input 
                    type="text"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100"
                    placeholder="URL file/dokumen"
                  />
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



