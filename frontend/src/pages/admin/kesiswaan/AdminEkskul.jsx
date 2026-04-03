import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Save, X, Image as ImageIcon, Upload, Loader2, GripVertical, Rocket, LayoutGrid, FileText, Check } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminEkskul() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [ekskuls, setEkskuls] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [heroForm, setHeroForm] = useState({
    title: 'Ekstrakurikuler',
    content: 'Wadah Pengembangan Bakat and Minat Siswa SMP Negeri 112 Jakarta.',
    image_url: ''
  })

  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    image_url: '', 
    order_index: 0,
    coach: '',
    schedule_day: '',
    schedule_time: ''
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
        .eq('slug', 'ekstrakurikuler')
        .single()
      
      if (heroData) {
        setHeroForm({
          title: heroData.title || 'Ekstrakurikuler',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }

      // Fetch Ekskul
      const { data: ekskulData, error } = await supabase
        .from('ekskul')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      setEkskuls(ekskulData || [])
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHeroChange = (e) => {
    setHeroForm({ ...heroForm, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e, mode = 'ekskul') => {
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
          slug: 'ekstrakurikuler',
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

  const handleSubmitEkskul = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editingId) {
        const { error } = await supabase
          .from('ekskul')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('ekskul')
          .insert([formData])
        if (error) throw error
      }
      setIsModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Gagal menyimpan ekskul: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEkskul = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    try {
      const { error } = await supabase.from('ekskul').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message)
    }
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setFormData({ 
      name: item.name, 
      description: item.description, 
      image_url: item.image_url || '', 
      order_index: item.order_index,
      coach: item.coach || '',
      schedule_day: item.schedule_day || '',
      schedule_time: item.schedule_time || ''
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ 
      name: '', 
      description: '', 
      image_url: '', 
      order_index: ekskuls.length,
      coach: '',
      schedule_day: '',
      schedule_time: ''
    })
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
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
          <div className="bg-purple-600 text-white p-4 rounded-3xl shadow-2xl shadow-purple-100 ring-8 ring-purple-50 flex items-center justify-center">
            <Rocket size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Ekstrakurikuler</h1>
            <p className="text-gray-500 font-bold italic text-sm mt-1">Kelola Hero and Data Ekskul.</p>
          </div>
        </div>
        {activeTab === 'content' && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-100 active:scale-95"
          >
            <Plus size={20} /> Tambah Ekskul
          </button>
        )}
        {activeTab === 'hero' && (
          <button 
            onClick={handleSaveHero}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-100 active:scale-95 disabled:opacity-50"
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
            ${activeTab === 'hero' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <LayoutGrid size={16} /> Header Hero
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'content' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <FileText size={16} /> Data Ekskul
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
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Contoh: Ekstrakurikuler Unggulan"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul (Deskripsi Singkat)</label>
                  <textarea 
                    name="content"
                    value={heroForm.content}
                    onChange={handleHeroChange}
                    rows={4}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                    placeholder="Contoh: Wadah Pengembangan Bakat and Minat..."
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
                      className="flex items-center justify-center gap-3 p-5 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-900 transition-all shadow-xl active:scale-95"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ekskuls.map((item) => (
                <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-50 group hover:shadow-2xl transition-all duration-500 flex flex-col">
                  <div className="h-48 relative overflow-hidden bg-gray-100">
                     <img src={item.image_url || '/placeholder-ekskul.jpg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <div className="flex gap-2 w-full">
                          <button onClick={() => openEdit(item)} className="flex-1 bg-white/20 backdrop-blur-md text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-white/40 transition-all">Edit</button>
                          <button onClick={() => handleDeleteEkskul(item.id)} className="flex-1 bg-red-500/80 backdrop-blur-md text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-red-600 transition-all">Hapus</button>
                        </div>
                     </div>
                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-purple-600 shadow-sm border border-purple-100">
                        ORD: {item.order_index}
                     </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-purple-600 transition-colors uppercase leading-tight line-clamp-1">{item.name}</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-3 italic mb-6">
                      {item.description}
                    </p>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <span>{item.schedule_day || '-'}</span>
                       <span>{item.schedule_time || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {ekskuls.length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                   <Rocket className="mx-auto text-gray-200 mb-4" size={48} />
                   <p className="text-gray-400 font-bold italic uppercase tracking-widest text-[10px]">Belum ada data ekskul.</p>
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
                  {editingId ? 'Edit' : 'Tambah'} Ekskul
                </h2>
                <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest italic leading-none">Pengembangan Diri Siswa</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm border border-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitEkskul} className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 text-center mb-4">
                     {formData.image_url ? (
                        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-purple-50">
                           <img src={formData.image_url} className="w-full h-full object-cover" alt="Ekskul" />
                           <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-xl hover:scale-110 transition-transform">
                              <X size={20} />
                           </button>
                        </div>
                     ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-video bg-gray-50 rounded-[2rem] border-4 border-dashed border-gray-100 cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-all group">
                           {uploading ? <Loader2 className="animate-spin text-purple-600" size={40} /> : <ImageIcon className="text-gray-200 group-hover:text-purple-300 transition-colors" size={60} />}
                           <span className="mt-4 text-[10px] font-black uppercase text-gray-400 group-hover:text-purple-600 tracking-[0.2em]">Pilih Foto Ekskul</span>
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'ekskul')} />
                        </label>
                     )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Nama Ekstrakurikuler</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-purple-100 shadow-sm"
                      placeholder="Basket / Pramuka / Paskibra"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Deskripsi Kegiatan</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-medium text-gray-700 outline-none focus:ring-4 focus:ring-purple-100 shadow-sm resize-none"
                      placeholder="Jelaskan tujuan and kegiatan ekskul ini..."
                    />
                  </div>

                  <div className="col-span-2">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Pelatih / Pembina</label>
                     <input 
                       type="text"
                       value={formData.coach}
                       onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                       className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-purple-100 shadow-sm"
                       placeholder="Nama Pelatih"
                     />
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Hari Latihan</label>
                     <input 
                       type="text"
                       value={formData.schedule_day}
                       onChange={(e) => setFormData({ ...formData, schedule_day: e.target.value })}
                       className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-purple-100 shadow-sm"
                       placeholder="Sabtu"
                     />
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Jam Latihan</label>
                     <input 
                       type="text"
                       value={formData.schedule_time}
                       onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                       className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-purple-100 shadow-sm"
                       placeholder="10:00 - 12:00"
                     />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Urutan Tampil</label>
                    <input 
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                      className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-purple-100 shadow-sm"
                    />
                  </div>
               </div>
            </form>

            <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex gap-4">
              <button 
                type="submit"
                onClick={handleSubmitEkskul}
                disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                {saving ? 'Menyimpan...' : (editingId ? 'Simpan Ekskul' : 'Tambah Ekskul')}
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





