import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Bell, Check, X, Upload, Loader2, Search, LayoutGrid, FileText, Save, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminPengumuman() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [heroForm, setHeroForm] = useState({
    title: 'Pengumuman Terbaru',
    content: 'Informasi Resmi and Terkini Mengenai Seluruh Kegiatan Sekolah.',
    image_url: ''
  })

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    is_active: true,
    created_at: new Date().toISOString().split('T')[0]
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
        .eq('slug', 'pengumuman')
        .single()
      
      if (heroData) {
        setHeroForm({
          title: heroData.title || 'Pengumuman Terbaru',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHeroChange = (e) => {
    setHeroForm({ ...heroForm, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e, mode = 'announcement') => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const publicUrl = await uploadImage(file, 'website')
      if (mode === 'hero') {
        setHeroForm({ ...heroForm, image_url: publicUrl })
      } else {
        setFormData({ ...formData, image_url: publicUrl })
      }
    } catch (error) {
      toast.error('Gagal mengunggah: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveHero = async () => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('secondary_content')
        .upsert({
          slug: 'pengumuman',
          title: heroForm.title,
          content: heroForm.content,
          image_url: heroForm.image_url
        })
      
      if (error) throw error
      toast.success('Hero berhasil disimpan!')
    } catch (error) {
      toast.error('Gagal menyimpan Hero: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)

      const payload = { ...formData }
      if (payload.created_at && payload.created_at.length === 10) {
        const currentTime = new Date().toISOString().split('T')[1]
        payload.created_at = `${payload.created_at}T${currentTime}`
      }

      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([payload])
        if (error) throw error
      }
      setIsModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message)
    }
  }

  const toggleStatus = async (item) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)
      if (error) throw error
      fetchData()
    } catch (error) {
      toast.error('Gagal mengupdate status: ' + error.message)
    }
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      content: item.content,
      image_url: item.image_url || '',
      is_active: item.is_active,
      created_at: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      title: '',
      content: '',
      image_url: '',
      is_active: true,
      created_at: new Date().toISOString().split('T')[0]
    })
  }

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Memuat Data...</p>
    </div>
  )

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog {...confirmState} />
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 text-white p-4 rounded-3xl shadow-2xl shadow-blue-100 ring-8 ring-blue-50 flex items-center justify-center">
            <Bell size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Pengumuman</h1>
            <p className="text-gray-500 font-bold italic text-sm mt-1">Kelola Hero and Konten Pengumuman.</p>
          </div>
        </div>
        {activeTab === 'content' && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Plus size={20} /> Tambah Pengumuman
          </button>
        )}
        {activeTab === 'hero' && (
          <button 
            onClick={handleSaveHero}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
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
                    name="title"
                    value={heroForm.title}
                    onChange={handleHeroChange}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Contoh: Pengumuman Terbaru"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul (Deskripsi Singkat)</label>
                  <textarea 
                    name="content"
                    value={heroForm.content}
                    onChange={handleHeroChange}
                    rows={4}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                    placeholder="Contoh: Informasi Resmi and Terkini Mengenai Seluruh Kegiatan Sekolah."
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
                    <input 
                      type="file" 
                      id="hero-bg"
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'hero')} 
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
            <div className="relative mb-6">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Cari judul pengumuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredAnnouncements.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between group gap-4">
                  <div className="flex items-start gap-6">
                     <div className={`p-4 rounded-2xl shrink-0 ${item.is_active ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                        <Bell size={24} />
                     </div>
                     <div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg line-clamp-1 group-hover:text-blue-600 transition-colors uppercase">{item.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                             {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <button 
                            onClick={() => toggleStatus(item)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${
                              item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                             {item.is_active ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
                             {item.is_active ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button 
                      onClick={() => openEdit(item)}
                      className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all shadow-sm"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredAnnouncements.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                   <Bell className="mx-auto text-gray-200 mb-4" size={48} />
                   <p className="text-gray-400 font-bold italic uppercase tracking-widest text-[10px]">Tidak ada pengumuman ditemukan.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up border border-white">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                  {editingId ? 'Edit' : 'Tambah'} Pengumuman
                </h2>
                <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest italic leading-none">Informasi Publik Sekolah</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm border border-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 gap-6">
                  {formData.image_url && (
                    <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-xl ring-4 ring-blue-50 mb-4">
                       <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                       <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-xl hover:scale-110 transition-transform">
                          <X size={20} />
                       </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Judul Pengumuman</label>
                      <input 
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm"
                        placeholder="Contoh: Penerimaan Rapor Semester Ganjil"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Tanggal Publikasi</label>
                      <input 
                        required
                        type="date"
                        value={formData.created_at}
                        onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                        className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Isi Detail Pengumuman</label>
                       <textarea 
                         required
                         rows={5}
                         value={formData.content}
                         onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                         className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-medium text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm resize-none"
                         placeholder="Tuliskan detail pengumuman di sini..."
                       />
                    </div>

                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Unggah Gambar Pendukung (Opsional)</label>
                       <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <label className="flex flex-col items-center justify-center w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-gray-100 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm">
                             {uploading ? <Loader2 className="animate-spin text-blue-500" /> : <Upload className="text-gray-300" />}
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'announcement')} />
                          </label>
                          <p className="text-[11px] font-bold text-gray-500 italic max-w-[200px]">
                             {uploading ? 'Mengunggah...' : 'Pilih gambar dari perangkat Anda.'}
                          </p>
                       </div>
                    </div>
                  </div>
               </div>
            </form>

            <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex gap-4">
              <button 
                type="submit"
                onClick={handleSubmit}
                disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                {saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Pengumuman')}
              </button>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 bg-white text-gray-400 hover:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 shadow-sm transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  )
}





