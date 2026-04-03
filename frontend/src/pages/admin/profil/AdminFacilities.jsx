import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, LayoutGrid, Upload, Loader2, Info, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminFacilities() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // States
  const [facilities, setFacilities] = useState([])
  const [secondaryContent, setSecondaryContent] = useState({
    title: 'Fasilitas Sekolah',
    content: 'Sarana dan Prasarana Penunjang Kegiatan Belajar Mengajar.',
    image_url: ''
  })

  // Modal/Form States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', image_url: '', order_index: 0 })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      
      // Fetch Facilities
      const { data: facData } = await supabase.from('facilities').select('*').order('order_index')
      setFacilities(facData || [])
      
      // Fetch Hero Content
      const { data: secData } = await supabase.from('secondary_content').select('*').eq('slug', 'fasilitas').single()
      if (secData) {
        setSecondaryContent({
          title: secData.title || 'Fasilitas Sekolah',
          content: secData.content || 'Sarana dan Prasarana Penunjang Kegiatan Belajar Mengajar.',
          image_url: secData.image_url || ''
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSecondary = async () => {
    try {
      setSaving(true)
      await supabase.from('secondary_content').upsert({ slug: 'fasilitas', ...secondaryContent })
      toast.success('Pembaruan Hero Berhasil!')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveItem = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editingItem) {
        const { error } = await supabase.from('facilities').update(form).eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('facilities').insert([form])
        if (error) throw error
      }
      setIsModalOpen(false)
      setForm({ name: '', description: '', image_url: '', order_index: facilities.length })
      fetchData()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    try {
      await supabase.from('facilities').delete().eq('id', id)
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleFileUpload = async (e, target) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadImage(file)
      if (target === 'hero') {
        setSecondaryContent({ ...secondaryContent, image_url: url })
      } else {
        setForm({ ...form, image_url: url })
      }
    } catch (error) {
      toast.error('Upload gagal: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest animate-pulse italic">Menyiapkan Data Fasilitas...</div>

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog {...confirmState} />
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
         <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg relative z-10">
            <LayoutGrid size={24} />
         </div>
         <div className="relative z-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Manajemen Fasilitas</h1>
            <p className="text-gray-500 font-medium text-xs italic tracking-widest uppercase mt-1">Kelola Hero and Daftar Sarana Prasarana Sekolah.</p>
         </div>
      </div>

      {/* Hero & Background Management */}
      <section className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
           <ImageIcon className="text-blue-600" size={24} />
           <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Pengaturan Hero Background</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Judul Header</label>
                <input 
                  type="text" value={secondaryContent.title}
                  onChange={e => setSecondaryContent({...secondaryContent, title: e.target.value})}
                  className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Sub-judul / Deskripsi</label>
                <textarea 
                  rows={2} value={secondaryContent.content}
                  onChange={e => setSecondaryContent({...secondaryContent, content: e.target.value})}
                  className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 italic"
                />
              </div>
           </div>
           <div className="space-y-6">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Hero Background Image</label>
              <div className="relative h-40 w-full bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group">
                 {secondaryContent.image_url ? (
                    <img src={secondaryContent.image_url} className="w-full h-full object-cover" alt="Hero Preview" />
                 ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                       <ImageIcon size={32} strokeWidth={1} />
                       <span className="text-[10px] font-black uppercase mt-2">Belum ada gambar</span>
                    </div>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'hero')} />
                    <button className="bg-white text-gray-900 px-6 py-2 rounded-xl font-black text-[10px] uppercase">Ganti Gambar</button>
                 </div>
              </div>
              <button 
                onClick={handleSaveSecondary} disabled={saving}
                className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Konfigurasi Hero
              </button>
           </div>
        </div>
      </section>

      {/* List of Facilities */}
      <section className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
           <div className="flex items-center gap-3">
              <LayoutGrid className="text-gray-900" size={24} />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Daftar Fasilitas Sekolah</h2>
           </div>
           <button 
             onClick={() => { setEditingItem(null); setForm({ name: '', description: '', image_url: '', order_index: facilities.length }); setIsModalOpen(true); }}
             className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl"
           >
              <Plus size={16} strokeWidth={3} /> Tambah Fasilitas
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {facilities.map((fac) => (
              <div key={fac.id} className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 group relative">
                 <div className="h-40 bg-gray-200 overflow-hidden relative">
                    {fac.image_url && <img src={fac.image_url} alt={fac.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => { setEditingItem(fac); setForm(fac); setIsModalOpen(true); }} className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-blue-600 shadow-lg hover:bg-white"><Edit2 size={14} /></button>
                       <button onClick={() => handleDeleteItem(fac.id)} className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-red-600 shadow-lg hover:bg-white"><Trash2 size={14} /></button>
                    </div>
                 </div>
                 <div className="p-6">
                    <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight mb-2">{fac.name}</h4>
                    <p className="text-[11px] text-gray-500 font-bold italic line-clamp-2 leading-relaxed">{fac.description}</p>
                 </div>
              </div>
           ))}
           {facilities.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400 font-bold italic text-xs uppercase tracking-widest">Belum ada daftar fasilitas.</div>
           )}
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-tight">{editingItem ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveItem} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Nama Fasilitas</label>
                    <input 
                      type="text" required value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100"
                      placeholder="Contoh: Perpustakaan Digital"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Deskripsi Singkat</label>
                    <textarea 
                      required rows={3} value={form.description} 
                      onChange={e => setForm({...form, description: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 italic"
                      placeholder="Jelaskan sarana prasarana ini..."
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Foto Fasilitas</label>
                    <div className="flex gap-4">
                       <input 
                         type="text" value={form.image_url} 
                         onChange={e => setForm({...form, image_url: e.target.value})}
                         className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-xl font-mono text-[10px]"
                         placeholder="Link Gambar / URL..."
                       />
                       <div className="relative">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'item')} />
                          <div className="bg-gray-100 p-4 rounded-xl text-gray-600 hover:bg-gray-200"><Upload size={20} /></div>
                       </div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Urutan Tampil</label>
                    <input 
                      type="number" value={form.order_index} 
                      onChange={e => setForm({...form, order_index: parseInt(e.target.value)})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none"
                    />
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
                    {editingItem ? 'Simpan Perubahan' : 'Tambahkan Sekarang'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  </>
  )
}





