import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Save, X, Image as ImageIcon, Upload, Loader2, Calendar, Camera, LayoutGrid, FileText, Check } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminKegiatan() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [heroForm, setHeroForm] = useState({
    title: 'Kegiatan Siswa',
    content: 'Dinamika and Semangat Kebersamaan Siswa SMP Negeri 112 Jakarta.',
    image_url: ''
  })

  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    image_url: '', 
    activity_date: (new Date().toISOString().split('T')[0]) 
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
        .eq('slug', 'kegiatan-siswa')
        .single()
      
      if (heroData) {
        setHeroForm({
          title: heroData.title || 'Kegiatan Siswa',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }

      // Fetch Activities
      const { data, error } = await supabase
        .from('student_activities')
        .select('*')
        .order('activity_date', { ascending: false })
      
      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHeroChange = (e) => {
    setHeroForm({ ...heroForm, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e, mode = 'activity') => {
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
          slug: 'kegiatan-siswa',
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
      if (editingId) {
        const { error } = await supabase
          .from('student_activities')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('student_activities')
          .insert([{ ...formData }])
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
      const { error } = await supabase.from('student_activities').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message)
    }
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setFormData({ 
      title: item.title, 
      description: item.description, 
      image_url: item.image_url || '',
      activity_date: item.activity_date
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ title: '', description: '', image_url: '', activity_date: (new Date().toISOString().split('T')[0]) })
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
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
          <div className="bg-pink-600 text-white p-4 rounded-3xl shadow-2xl shadow-pink-100 ring-8 ring-pink-50 flex items-center justify-center">
            <Camera size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Kegiatan Siswa</h1>
            <p className="text-gray-500 font-bold italic text-sm mt-1">Kelola Hero and Galeri Kegiatan.</p>
          </div>
        </div>
        {activeTab === 'content' && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-pink-100 active:scale-95"
          >
            <Plus size={20} /> Tambah Momen
          </button>
        )}
        {activeTab === 'hero' && (
          <button 
            onClick={handleSaveHero}
            disabled={saving}
            className="bg-pink-600 hover:bg-pink-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-pink-100 active:scale-95 disabled:opacity-50"
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
            ${activeTab === 'hero' ? 'bg-white text-pink-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <LayoutGrid size={16} /> Header Hero
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'content' ? 'bg-white text-pink-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <FileText size={16} /> Galeri Data
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
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Contoh: Kegiatan Siswa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul (Deskripsi Singkat)</label>
                  <textarea 
                    name="content"
                    value={heroForm.content}
                    onChange={handleHeroChange}
                    rows={4}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                    placeholder="Contoh: Dinamika and Semangat Kebersamaan..."
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
                      className="flex items-center justify-center gap-3 p-5 bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-900 transition-all shadow-xl active:scale-95"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {activities.map((item) => (
                <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-50 group hover:shadow-2xl transition-all duration-500 flex flex-col">
                  <div className="h-48 relative overflow-hidden bg-gray-100">
                     <img src={item.image_url || '/placeholder-activity.jpg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                     <div className="absolute inset-0 bg-pink-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={() => openEdit(item)} className="bg-white p-2 rounded-lg text-pink-600 shadow-xl hover:scale-110 transition-transform"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="bg-white p-2 rounded-lg text-red-500 shadow-xl hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                     </div>
                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-[10px] font-black uppercase flex items-center gap-2">
                           <Calendar size={12} className="text-pink-400" />
                           {new Date(item.activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                     </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-sm font-black text-gray-900 mb-1 tracking-tight truncate uppercase">{item.title}</h3>
                    <p className="text-gray-400 text-[10px] font-medium leading-relaxed line-clamp-2 italic">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                   <Camera className="mx-auto text-gray-200 mb-4" size={48} />
                   <p className="text-gray-400 font-bold italic uppercase tracking-widest text-[10px]">Belum ada dokumentasi kegiatan.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up border border-white">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                  {editingId ? 'Edit' : 'Tambah'} Momen
                </h2>
                <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest italic leading-none">Dokumentasi Kegiatan Siswa</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm border border-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 text-center mb-4">
                     {formData.image_url ? (
                        <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-pink-50">
                           <img src={formData.image_url} className="w-full h-full object-cover" alt="Momen" />
                           <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-xl hover:scale-110 transition-transform">
                              <X size={20} />
                           </button>
                        </div>
                     ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-video bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100 cursor-pointer hover:bg-pink-50 hover:border-pink-200 transition-all group">
                           {uploading ? <Loader2 className="animate-spin text-pink-600" size={40} /> : <ImageIcon className="text-gray-200 group-hover:text-pink-300 transition-colors" size={60} />}
                           <span className="mt-4 text-[10px] font-black uppercase text-gray-400 group-hover:text-pink-600 tracking-[0.2em]">Pilih Foto Dokumentasi</span>
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'activity')} />
                        </label>
                     )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Judul Kegiatan</label>
                    <input 
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-pink-100 shadow-sm"
                      placeholder="Contoh: Lomba Kebersihan Kelas"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Tanggal</label>
                    <input 
                      required
                      type="date"
                      value={formData.activity_date}
                      onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                      className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-pink-100 shadow-sm"
                    />
                  </div>

                  <div className="col-span-1">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Deskripsi / Lokasi</label>
                     <textarea 
                       rows={2}
                       value={formData.description}
                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                       className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-medium text-gray-700 outline-none focus:ring-4 focus:ring-pink-100 shadow-sm resize-none"
                       placeholder="Detail atau lokasi kegiatan"
                     />
                  </div>
               </div>
            </form>

            <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex gap-4">
              <button 
                type="submit"
                onClick={handleSubmit}
                disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-3 bg-pink-600 hover:bg-pink-700 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-pink-900/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                {saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Momen')}
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





