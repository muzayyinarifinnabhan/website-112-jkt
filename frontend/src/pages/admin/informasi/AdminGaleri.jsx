import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Camera, Play, X, Upload, Loader2, Search, Filter } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminGaleri() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')

  const categories = ['Fasilitas', 'Kegiatan', 'Prestasi', 'Acara']

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'Kegiatan',
    is_video: false,
    video_url: '',
    video_type: 'url' // 'url' or 'file'
  })

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e, type) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const publicUrl = await uploadImage(file)
      if (type === 'image') {
        setFormData(prev => ({ ...prev, image_url: publicUrl }))
      } else {
        setFormData(prev => ({ ...prev, video_url: publicUrl }))
      }
    } catch (error) {
      toast.error('Gagal mengunggah: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.image_url) return toast.warning('Mohon unggah thumbnail terlebih dahulu')
    if (formData.is_video && !formData.video_url) return toast.warning('Mohon isi URL video atau unggah file video')

    try {
      setSaving(true)
      const { video_type, ...submitData } = formData
      if (editingId) {
        const { error } = await supabase
          .from('gallery')
          .update({ ...submitData, updated_at: new Date().toISOString() })
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('gallery')
          .insert([submitData])
        if (error) throw error
      }
      setIsModalOpen(false)
      resetForm()
      fetchItems()
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id)
      if (error) throw error
      fetchItems()
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message)
    }
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url,
      category: item.category,
      is_video: item.is_video,
      video_url: item.video_url || '',
      video_type: (item.video_url && item.video_url.includes('http') && !item.video_url.includes('youtu')) ? 'file' : 'url'
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      image_url: '',
      category: 'Kegiatan',
      is_video: false,
      video_url: '',
      video_type: 'url'
    })
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  if (loading) return <div className="p-8 text-center font-black text-gray-400 uppercase tracking-widest animate-pulse italic">Memuat Galeri...</div>

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} /><div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100">
              <Camera size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Galeri Sekolah</h1>
              <p className="text-gray-500 font-medium text-xs mt-2 italic">Kelola dokumentasi foto and video sekolah.</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true) }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} />
            Tambah Galeri
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari judul galeri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white rounded-3xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm transition-all" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory('Semua')}
              className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border
               ${activeCategory === 'Semua' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border
                  ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group flex flex-col h-full">
              <div className="relative aspect-video overflow-hidden bg-gray-900">
                <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg">
                    {item.category}
                  </span>
                  {item.is_video && (
                    <span className="bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <Play size={8} fill="white" /> Video
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm line-clamp-2 mb-2">{item.title}</h3>
                <p className="text-gray-400 text-[10px] font-medium line-clamp-2 mb-6 italic leading-relaxed">{item.description}</p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2.5 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner">
              <Camera className="mx-auto text-gray-200 mb-6" size={64} strokeWidth={1} />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Belum ada item galeri di kategori ini.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white">
              <div className="p-8 md:p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                    {editingId ? 'Edit' : 'Tambah'} Galeri
                  </h2>
                  <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest italic leading-none">Dokumentasi momen sekolah</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm border border-gray-100 transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-1">Judul Galeri</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                        placeholder="Judul momen dokumentasi..." />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-1">Kategori</label>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border shadow-sm
                             ${formData.category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-white hover:text-blue-500'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-1">Keterangan Singkat</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none shadow-sm"
                        placeholder="Deskripsi singkat momen..." />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-1">Media: Thumbnail (Wajib)</label>
                      <div className="relative aspect-video rounded-[2rem] bg-gray-50 border-4 border-dashed border-gray-100 overflow-hidden group flex items-center justify-center shadow-inner">
                        {formData.image_url ? (
                          <>
                            <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                              <label className="p-4 bg-white rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-xl">
                                {uploading ? <Loader2 className="animate-spin text-blue-600" /> : <Upload className="text-blue-600" />}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center cursor-pointer p-6 text-center hover:bg-blue-50/50 transition-all w-full h-full">
                            <div className="bg-white p-4 rounded-2xl shadow-xl mb-3 text-blue-100 group-hover:text-blue-600 transition-colors">
                              {uploading ? <Loader2 className="animate-spin" /> : <Camera size={32} />}
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                              {uploading ? 'Sedang mengunggah...' : 'Klik untuk unggah thumbnail'}
                            </p>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="p-8 bg-blue-50 rounded-[3rem] border border-blue-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Tandai sebagai Video?</label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, is_video: !formData.is_video })}
                          className={`w-14 h-8 rounded-full transition-all relative ${formData.is_video ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-all ${formData.is_video ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>

                      {formData.is_video && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex bg-white/50 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, video_type: 'url' })}
                              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.video_type === 'url' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                            >
                              YouTube URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, video_type: 'file' })}
                              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.video_type === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                            >
                              Upload File
                            </button>
                          </div>

                          {formData.video_type === 'url' ? (
                            <input
                              type="text"
                              value={formData.video_url}
                              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                              className="w-full p-4 bg-white rounded-xl border border-blue-50 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                              placeholder="https://youtube.com/watch?v=..." />
                          ) : (
                            <div className="relative">
                              <input
                                type="text"
                                readOnly
                                value={formData.video_url}
                                className="w-full p-4 pr-12 bg-white rounded-xl border border-blue-50 font-bold text-gray-700 outline-none text-xs truncate"
                                placeholder="Belum ada file video..." />
                              <label className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-3 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>

              <div className="p-8 md:p-10 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={saving || uploading}
                  className="flex-1 flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-blue-400/20 disabled:opacity-50 hover:-translate-y-1"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} strokeWidth={3} />}
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Terbitkan Galeri'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 md:px-10 bg-white text-gray-400 hover:text-gray-900 rounded-[2rem] font-black text-xs uppercase tracking-widest border border-gray-100 shadow-sm transition-all hover:bg-gray-50"
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




