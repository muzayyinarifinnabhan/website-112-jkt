import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Calendar, MapPin, Clock, X, Check, Loader2, Search, LayoutGrid, FileText, Save, Image as ImageIcon, Upload } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminAgenda() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [agendas, setAgendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [heroForm, setHeroForm] = useState({
    title: 'Agenda Kegiatan',
    content: 'Jadwal and Rencana Kegiatan Akademik serta Non-Akademik.',
    image_url: ''
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: ''
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
        .eq('slug', 'agenda')
        .single()
      
      if (heroData) {
        setHeroForm({
          title: heroData.title || 'Agenda Kegiatan',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }

      const { data, error } = await supabase
        .from('agenda')
        .select('*')
        .order('event_date', { ascending: false })
      
      if (error) throw error
      setAgendas(data || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHeroChange = (e) => {
    setHeroForm({ ...heroForm, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e, mode = 'agenda') => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const publicUrl = await uploadImage(file, 'website')
      if (mode === 'hero') {
        setHeroForm({ ...heroForm, image_url: publicUrl })
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
          slug: 'agenda',
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
          .from('agenda')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('agenda')
          .insert([formData])
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
      const { error } = await supabase.from('agenda').delete().eq('id', id)
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
      description: item.description || '',
      event_date: item.event_date,
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      location: item.location || ''
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      location: ''
    })
  }

  const filteredAgendas = agendas.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Memuat Data Agenda...</p>
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
          <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-center">
            <Calendar size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Agenda Sekolah</h1>
            <p className="text-gray-500 font-bold italic text-sm mt-1">Kelola Hero and Jadwal Kegiatan.</p>
          </div>
        </div>
        {activeTab === 'content' && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Plus size={20} /> Tambah Agenda
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
          <FileText size={16} /> Data Agenda
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
                    placeholder="Contoh: Agenda Kegiatan"
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
                    placeholder="Contoh: Jadwal and Rencana Kegiatan Akademik serta Non-Akademik."
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
                placeholder="Cari judul agenda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAgendas.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group gap-4 relative overflow-hidden">
                   <div className="flex gap-4">
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl flex flex-col items-center justify-center min-w-[60px]">
                         <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                            {new Date(item.event_date).toLocaleDateString('id-ID', { month: 'short' })}
                         </span>
                         <span className="text-xl font-black leading-none">
                            {new Date(item.event_date).getDate()}
                         </span>
                      </div>
                      <div className="flex-1">
                         <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                         <div className="flex items-center gap-3 mt-1 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                            <Clock size={12} /> {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5) || 'Selesai'}
                         </div>
                      </div>
                   </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => openEdit(item)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 p-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredAgendas.length === 0 && (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                   <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
                   <p className="text-gray-400 font-bold italic uppercase tracking-widest text-[10px]">Tidak ada agenda ditemukan.</p>
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
                  {editingId ? 'Edit' : 'Tambah'} Agenda
                </h2>
                <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest italic">Jadwalkan kegiatan baru</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm border border-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
               <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Judul Acara / Kegiatan</label>
                    <input 
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm"
                      placeholder="Nama kegiatan..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Tanggal Kegiatan</label>
                       <input 
                         type="date"
                         required
                         value={formData.event_date}
                         onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                         className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm"
                       />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Mulai</label>
                      <input 
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Selesai</label>
                      <input 
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Tempat / Lokasi</label>
                    <input 
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm"
                      placeholder="Gedung Olahraga / Aula..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Deskripsi Singkat</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm resize-none"
                      placeholder="Informasi tambahan kegiatan..."
                    />
                  </div>
               </div>
            </form>

            <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex gap-4">
              <button 
                type="submit"
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                {saving ? 'Menyimpan...' : 'Simpan Agenda'}
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





