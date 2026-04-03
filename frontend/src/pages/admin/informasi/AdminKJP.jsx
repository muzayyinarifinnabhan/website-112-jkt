import { useState, useEffect } from 'react'
import { 
  Plus, Trash2, Edit2, Save, X, CreditCard, 
  ClipboardCheck, FileText, Calendar, Users, Loader2, Info, Upload
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminKJP() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('kjp') // 'kjp' or 'pip'
  
  const [guides, setGuides] = useState([])
  const [secondaryContent, setSecondaryContent] = useState({
    title: 'KJP / PIP SMP Negeri 112 Jakarta',
    content: 'Layanan Bantuan Pendidikan Terintegrasi',
    image_url: '',
    file_url: '', // KJP PDF
    extra_url: ''  // PIP PDF
  })

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({ program: 'kjp', category: 'requirements', content: '', order_index: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const { data: guideData } = await supabase.from('kjp_pip_guides').select('*').order('order_index')
      setGuides(guideData || [])
      
      const { data: secData } = await supabase.from('secondary_content').select('*').eq('slug', 'kjp').single()
      if (secData) {
        setSecondaryContent({
          title: secData.title || 'KJP / PIP SMP Negeri 112 Jakarta',
          content: secData.content || 'Layanan Bantuan Pendidikan Terintegrasi',
          image_url: secData.image_url || '',
          file_url: secData.file_url || '',
          extra_url: secData.extra_url || ''
        })
      }
    } catch (error) {
      console.error('Error:', error.message)
      toast.error('Error Fetch: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSecondary = async () => {
    try {
      setSaving(true)
      await supabase.from('secondary_content').upsert({ slug: 'kjp', ...secondaryContent })
      toast.info('Konfigurasi Hero and PDF berhasil diperbarui!')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveItem = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await supabase.from('kjp_pip_guides').update(form).eq('id', editingItem.id)
      } else {
        await supabase.from('kjp_pip_guides').insert([form])
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error Save:', error.message)
      toast.error('Error Save: ' + error.message)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    await supabase.from('kjp_pip_guides').delete().eq('id', id)
    fetchData()
  }

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    setSaving(true)
    const url = await uploadImage(file)
    setSecondaryContent({ ...secondaryContent, [type]: url })
    setSaving(false)
  }

  if (loading) return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest animate-pulse">Memuat Dashboard KJP/PIP...</div>

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog {...confirmState} />
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-2">Manajemen KJP & PIP</h1>
          <p className="text-gray-500 font-medium text-xs italic tracking-widest uppercase">Kelola hero, persyaratan, dokumen, and alur pendaftaran bantuan siswa.</p>
        </div>
        <div className="flex bg-gray-100 p-2 rounded-3xl">
           <button 
             onClick={() => setActiveTab('kjp')}
             className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'kjp' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
           >
             KJP
           </button>
           <button 
             onClick={() => setActiveTab('pip')}
             className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'pip' ? 'bg-white text-emerald-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
           >
             PIP
           </button>
           <button 
             onClick={() => setActiveTab('extra')}
             className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'extra' ? 'bg-white text-orange-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Layanan & FAQ
           </button>
        </div>
      </div>

      {activeTab === 'extra' ? (
        <div className="space-y-12">
           {/* Jam Operasional & Kontak */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Jam Operasional */}
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-yellow-100">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Jam Operasional</h3>
                    <button 
                      onClick={() => { setForm({ program: 'system', category: 'operational', content: '', order_index: guides.filter(g => g.category === 'operational').length }); setEditingItem(null); setIsModalOpen(true); }}
                      className="bg-yellow-500 text-white p-2 rounded-xl hover:bg-yellow-600"
                    ><Plus size={18} /></button>
                 </div>
                 <div className="space-y-3">
                    {guides.filter(g => g.category === 'operational').map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group">
                         <span className="text-sm font-bold text-gray-700">{item.content}</span>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setForm(item); setEditingItem(item); setIsModalOpen(true); }} className="text-blue-500"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500"><Trash2 size={14} /></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Kontak Bantuan */}
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-purple-100">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Kontak Bantuan</h3>
                    <button 
                      onClick={() => { setForm({ program: 'system', category: 'contact', content: '', order_index: guides.filter(g => g.category === 'contact').length }); setEditingItem(null); setIsModalOpen(true); }}
                      className="bg-purple-500 text-white p-2 rounded-xl hover:bg-purple-600"
                    ><Plus size={18} /></button>
                 </div>
                 <div className="space-y-3">
                    {guides.filter(g => g.category === 'contact').map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group">
                         <span className="text-sm font-bold text-gray-700">{item.content}</span>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setForm(item); setEditingItem(item); setIsModalOpen(true); }} className="text-blue-500"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500"><Trash2 size={14} /></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* FAQ Section */}
           <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Pertanyaan Sering Diajukan (FAQ)</h3>
                 <button 
                   onClick={() => { setForm({ program: 'system', category: 'faq', content: '', sub_content: '', order_index: guides.filter(g => g.category === 'faq').length }); setEditingItem(null); setIsModalOpen(true); }}
                   className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                 ><Plus size={18} /> Tambah FAQ</button>
              </div>
              <div className="space-y-6">
                 {guides.filter(g => g.category === 'faq').map(item => (
                   <div key={item.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group relative">
                      <div className="flex justify-between items-start mb-4">
                         <div className="space-y-2">
                            <h4 className="font-black text-gray-900 text-lg tracking-tight">Q: {item.content}</h4>
                            <p className="text-gray-600 font-medium italic">A: {item.sub_content}</p>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => { setForm(item); setEditingItem(item); setIsModalOpen(true); }} className="text-blue-500 p-2 hover:bg-white rounded-lg"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 p-2 hover:bg-white rounded-lg"><Trash2 size={16} /></button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-12">
           {/* Hero & PDF Management Section */}
           <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-100 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                 <div className="p-3 bg-primary-600 text-white rounded-2xl">
                    <Upload size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Pengaturan Hero & PDF Panduan</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                 {/* Left: Hero Settings */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Judul Hero (KJP/PIP)</label>
                       <input 
                         type="text" value={secondaryContent.title} 
                         onChange={e => setSecondaryContent({...secondaryContent, title: e.target.value})}
                         className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-800"
                         placeholder="Contoh: KJP / PIP SMP Negeri 112 Jakarta"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Sub-judul Hero</label>
                       <textarea 
                         rows={2} value={secondaryContent.content} 
                         onChange={e => setSecondaryContent({...secondaryContent, content: e.target.value})}
                         className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-800 italic"
                         placeholder="Contoh: Layanan Bantuan Pendidikan Terintegrasi"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Background Hero (Upload/URL)</label>
                       <div className="flex gap-3">
                          <input 
                            type="text" value={secondaryContent.image_url} 
                            onChange={e => setSecondaryContent({...secondaryContent, image_url: e.target.value})}
                            className="flex-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-xs"
                            placeholder="Link Gambar Background..."
                          />
                          <div className="relative">
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'image_url')} />
                             <div className="bg-primary-50 text-primary-600 p-4 rounded-2xl hover:bg-primary-100"><Upload size={20} /></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Right: PDF Settings */}
                 <div className="space-y-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic ml-1">File Panduan KJP (PDF)</label>
                       <div className="flex gap-3">
                          <input 
                            type="text" value={secondaryContent.file_url} 
                            onChange={e => setSecondaryContent({...secondaryContent, file_url: e.target.value})}
                            className="flex-1 p-4 bg-white rounded-2xl border border-gray-200 font-mono text-xs"
                            placeholder="Link PDF KJP..."
                          />
                          <div className="relative">
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'file_url')} />
                             <div className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100"><Upload size={20} /></div>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic ml-1">File Panduan PIP (PDF)</label>
                       <div className="flex gap-3">
                          <input 
                            type="text" value={secondaryContent.extra_url} 
                            onChange={e => setSecondaryContent({...secondaryContent, extra_url: e.target.value})}
                            className="flex-1 p-4 bg-white rounded-2xl border border-gray-200 font-mono text-xs"
                            placeholder="Link PDF PIP..."
                          />
                          <div className="relative">
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'extra_url')} />
                             <div className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100"><Upload size={20} /></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="pt-4">
                       <button 
                         onClick={handleSaveSecondary} disabled={saving}
                         className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3"
                       >
                          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                          Simpan Semua Konfigurasi
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Content Management Sections */}
           <div className="grid grid-cols-1 gap-12">
             {[
               { key: 'requirements', title: 'Persyaratan Program', icon: ClipboardCheck },
               { key: 'documents', title: 'Dokumen yang Diperlukan', icon: FileText },
               { key: 'schedule', title: 'Jadwal Kegiatan', icon: Calendar },
               { key: 'flow', title: 'Cara Pendaftaran', icon: Users }
             ].map(cat => (
               <section key={cat.key} className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${activeTab === 'kjp' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                           <cat.icon size={24} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{cat.title}</h2>
                     </div>
                     <button 
                       onClick={() => { setEditingItem(null); setForm({ program: activeTab, category: cat.key, content: '', order_index: guides.filter(g => g.program === activeTab && g.category === cat.key).length }); setIsModalOpen(true); }}
                       className={`${activeTab === 'kjp' ? 'bg-blue-600' : 'bg-emerald-600'} text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg`}
                     >
                        <Plus size={16} strokeWidth={3} /> Tambah Item
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                     {guides.filter(g => g.program === activeTab && g.category === cat.key).map(item => (
                        <div key={item.id} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl group border border-transparent hover:border-gray-200 transition-all relative">
                           <div className={`mt-1 h-5 w-5 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-[10px] ${activeTab === 'kjp' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {item.order_index + 1}
                           </div>
                           <p className="flex-1 text-sm font-bold text-gray-700 leading-relaxed italic">{item.content}</p>
                           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingItem(item); setForm(item); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-white rounded-lg"><Edit2 size={14} /></button>
                              <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-red-600 hover:bg-white rounded-lg"><Trash2 size={14} /></button>
                           </div>
                        </div>
                     ))}
                     {guides.filter(g => g.program === activeTab && g.category === cat.key).length === 0 && (
                        <div className="col-span-full py-10 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Belum ada item untuk kategori ini.</div>
                     )}
                  </div>
               </section>
             ))}
           </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className={`p-8 text-white flex justify-between items-center ${activeTab === 'kjp' ? 'bg-blue-600' : activeTab === 'pip' ? 'bg-emerald-600' : 'bg-orange-600'}`}>
                 <h3 className="text-xl font-black uppercase tracking-tight">{editingItem ? 'Edit Item' : 'Tambah Item'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveItem} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">
                       {form.category === 'faq' ? 'Pertanyaan (Q)' : 'Isi Konten'}
                    </label>
                    <textarea 
                      required rows={3} value={form.content} 
                      onChange={e => setForm({...form, content: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none italic"
                      placeholder="Masukkan detail di sini..."
                    />
                 </div>
                 
                 {form.category === 'faq' && (
                    <div>
                       <label className="block text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 italic">Jawaban (A)</label>
                       <textarea 
                         required rows={4} value={form.sub_content} 
                         onChange={e => setForm({...form, sub_content: e.target.value})}
                         className="w-full p-4 bg-primary-50 border border-primary-100 rounded-xl font-bold text-gray-700 outline-none italic"
                         placeholder="Masukkan jawaban FAQ di sini..."
                       />
                    </div>
                 )}

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Urutan Tampil</label>
                    <input 
                      type="number" value={form.order_index} 
                      onChange={e => setForm({...form, order_index: parseInt(e.target.value)})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none"
                    />
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 p-5 rounded-xl font-black text-xs uppercase">Batal</button>
                    <button type="submit" className={`flex-[2] text-white p-5 rounded-xl font-black text-xs uppercase tracking-widest ${activeTab === 'kjp' ? 'bg-blue-600' : activeTab === 'pip' ? 'bg-emerald-600' : 'bg-orange-600'}`}>
                       {editingItem ? 'Simpan Perubahan' : 'Tambahkan'}
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





