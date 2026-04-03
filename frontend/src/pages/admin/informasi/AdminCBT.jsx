import { useState, useEffect } from 'react'
import { 
  Plus, Trash2, Edit2, Save, X, MonitorPlay, 
  CheckCircle2, XCircle, Lightbulb, Loader2, Info, LayoutGrid, Image as ImageIcon, Upload, Search, Hash
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminCBT() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')
  
  // States for different sections
  const [guides, setGuides] = useState([])
  const [secondaryContent, setSecondaryContent] = useState({
    title: 'Sistem CBT',
    content: 'Computer Based Test - Platform Ujian Online Mandiri.',
    image_url: '',
    extra_url: ''
  })
  const [portalContent, setPortalContent] = useState({
    title: 'Portal Ujian Online',
    content: 'Kelola pelaksanaan ujian mandiri Anda secara transparan and efisien melalui platform resmi sekolah.'
  })

  // Modal/Form States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({ type: 'tata_cara', content: '', order_index: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      
      // Fetch Guides
      const { data: guideData } = await supabase.from('cbt_guides').select('*').order('type, order_index')
      setGuides(guideData || [])
      
      // Fetch Secondary Content
      const { data: secData } = await supabase.from('secondary_content').select('*').eq('slug', 'cbt').single()
      if (secData) {
        setSecondaryContent({
          title: secData.title || 'Sistem CBT',
          content: secData.content || '',
          image_url: secData.image_url || '',
          extra_url: secData.extra_url || ''
        })
      }

      // Fetch Portal Card Content
      const { data: portData } = await supabase.from('secondary_content').select('*').eq('slug', 'cbt_portal').single()
      if (portData) {
        setPortalContent({
          title: portData.title || 'Portal Ujian Online',
          content: portData.content || ''
        })
      }
    } catch (error) {
      console.error('Error fetching CBT data:', error.message)
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
      setSecondaryContent({ ...secondaryContent, image_url: publicUrl })
    } catch (error) {
      toast.error('Gagal mengunggah: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveSecondary = async () => {
    try {
      setSaving(true)
      
      // Save Hero content
      const { error: heroErr } = await supabase
        .from('secondary_content')
        .upsert({ 
          slug: 'cbt', 
          ...secondaryContent, 
          updated_at: new Date().toISOString() 
        })
      
      if (heroErr) throw heroErr

      // Save Portal Card content
      const { error: portErr } = await supabase
        .from('secondary_content')
        .upsert({ 
          slug: 'cbt_portal', 
          title: portalContent.title,
          content: portalContent.content,
          updated_at: new Date().toISOString() 
        })

      if (portErr) throw portErr

      toast.success('Informasi CBT berhasil diperbarui!')
    } catch (error) {
      toast.error('Gagal: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveItem = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        const { error } = await supabase.from('cbt_guides').update(form).eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('cbt_guides').insert([form])
        if (error) throw error
      }
      setIsModalOpen(false)
      setEditingItem(null)
      setForm({ type: 'tata_cara', content: '', order_index: 0 })
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    try {
      await supabase.from('cbt_guides').delete().eq('id', id)
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Memuat Data CBT...</p>
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
            <MonitorPlay size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Manajemen CBT</h1>
            <p className="text-gray-500 font-bold italic text-sm mt-1">Kelola Hero, Portal and Panduan CBT.</p>
          </div>
        </div>
        <button 
          onClick={handleSaveSecondary}
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
          onClick={() => setActiveTab('data')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'data' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <Hash size={16} /> Data & Panduan
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
                    value={secondaryContent.title}
                    onChange={(e) => setSecondaryContent({...secondaryContent, title: e.target.value})}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Contoh: Sistem CBT"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul Hero (Deskripsi Singkat)</label>
                  <textarea 
                    value={secondaryContent.content}
                    onChange={(e) => setSecondaryContent({...secondaryContent, content: e.target.value})}
                    rows={4}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                    placeholder="Contoh: Computer Based Test - Platform Ujian Mandiri Sekolah."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Gambar Background Hero</label>
                <div className="relative group">
                  <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                    {secondaryContent.image_url ? (
                      <img src={secondaryContent.image_url} alt="Hero BG" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
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

              {/* Portal Card Settings */}
              <div className="pt-10 border-t border-gray-100 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                     <LayoutGrid size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 uppercase tracking-tight leading-none text-lg">Pusat Isi Kartu Portal</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Bagian kotak putih di halaman publik</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Judul Kartu Portal</label>
                    <input 
                      value={portalContent.title}
                      onChange={(e) => setPortalContent({...portalContent, title: e.target.value})}
                      className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                      placeholder="Contoh: Portal Ujian Online"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Deskripsi Kartu Portal</label>
                    <textarea 
                      value={portalContent.content}
                      onChange={(e) => setPortalContent({...portalContent, content: e.target.value})}
                      rows={3}
                      className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                      placeholder="Deskripsi kartu portal..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            {/* Portal Config */}
            <div className="bg-blue-50/30 p-8 rounded-[2rem] border border-blue-50 space-y-6">
              <div className="flex items-center gap-3 border-b border-blue-50 pb-4">
                 <Info className="text-blue-600" size={20} />
                 <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Konfigurasi Portal CBT</h2>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-1">URL Portal CBT (Link ke Aplikasi Ujian)</label>
                <input 
                  type="url"
                  value={secondaryContent.extra_url}
                  onChange={(e) => setSecondaryContent({...secondaryContent, extra_url: e.target.value})}
                  className="w-full p-5 bg-white rounded-2xl border border-blue-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm shadow-sm"
                  placeholder="https://cbt.example.com"
                />
              </div>
            </div>

            {/* Guides Section */}
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Daftar Panduan & Aturan</h3>
                  <button 
                    onClick={() => { setEditingItem(null); setForm({ type: 'tata_cara', content: '', order_index: guides.length }); setIsModalOpen(true); }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg"
                  >
                     <Plus size={16} strokeWidth={3} /> Tambah Panduan
                  </button>
               </div>

               <div className="grid grid-cols-1 gap-12">
                  {[
                    { key: 'tata_cara', title: 'Tata Cara Pelaksanaan', icon: CheckCircle2, color: 'emerald', bg: 'bg-emerald-50 text-emerald-600' },
                    { key: 'larangan', title: 'Yang Tidak Diperbolehkan', icon: XCircle, color: 'red', bg: 'bg-red-50 text-red-600' },
                    { key: 'tips', title: 'Tips Sukses Ujian', icon: Lightbulb, color: 'orange', bg: 'bg-orange-50 text-orange-600' }
                  ].map((section) => (
                    <div key={section.key} className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 ${section.bg} rounded-xl`}>
                             <section.icon size={18} />
                          </div>
                          <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">{section.title}</h4>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {guides.filter(g => g.type === section.key).map((item) => (
                             <div key={item.id} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl group border border-transparent hover:border-gray-200 transition-all relative overflow-hidden">
                                <p className="flex-1 text-sm font-bold text-gray-700 leading-relaxed italic line-clamp-2">{item.content}</p>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => { setEditingItem(item); setForm({ type: item.type, content: item.content, order_index: item.order_index }); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-white rounded-lg transition-all"><Edit2 size={14} /></button>
                                   <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-red-600 hover:bg-white rounded-lg transition-all"><Trash2 size={14} /></button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Edit2 size={20} className="text-blue-400" />
                    <h3 className="text-xl font-black uppercase tracking-tight">{editingItem ? 'Edit Panduan' : 'Tambah Panduan'}</h3>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveItem} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Kategori Panduan</label>
                    <select 
                      value={form.type}
                      onChange={e => setForm({...form, type: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none appearance-none"
                    >
                       <option value="tata_cara">Tata Cara Pelaksanaan (Hijau)</option>
                       <option value="larangan">Yang Tidak Diperbolehkan (Merah)</option>
                       <option value="tips">Tips Sukses Ujian (Kuning)</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Isi Konten / Teks Panduan</label>
                    <textarea 
                      required rows={4} value={form.content} 
                      onChange={e => setForm({...form, content: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none italic"
                      placeholder="Masukkan teks panduan di sini..."
                    />
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 p-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Batal</button>
                    <button type="submit" className="flex-[2] bg-blue-600 text-white p-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl active:scale-95">
                       {editingItem ? 'Simpan Perubahan' : 'Tambahkan Sekarang'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  </>
  )
}





