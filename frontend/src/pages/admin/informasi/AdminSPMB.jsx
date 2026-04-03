import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, Calendar, FileText, Upload, Loader2, Download, Info, CheckCircle2, LayoutGrid, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminSPMB() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // States for different sections
  const [schedules, setSchedules] = useState([])
  const [requirements, setRequirements] = useState([])
  const [activeTab, setActiveTab] = useState('hero')
  const [secondaryContent, setSecondaryContent] = useState({
    title: 'Penerimaan Siswa Baru',
    content: 'Informasi lengkap terkait pendaftaran PPDB dan Mutasi Siswa.',
    image_url: '',
    extra_url: ''
  })

  // Modal/Form States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isReqModalOpen, setIsReqModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [editingReq, setEditingReq] = useState(null)
  
  const [scheduleForm, setScheduleForm] = useState({ date_range: '', activity: '', order_index: 0 })
  const [reqForm, setReqForm] = useState({ category: 'document', content: '', order_index: 0 })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      
      // Fetch Schedules
      const { data: schData } = await supabase.from('spmb_schedules').select('*').order('order_index')
      setSchedules(schData || [])
      
      // Fetch Requirements
      const { data: reqData } = await supabase.from('spmb_requirements').select('*').order('category, order_index')
      setRequirements(reqData || [])
      
      // Fetch Secondary Content
      const { data: secData } = await supabase.from('secondary_content').select('*').eq('slug', 'spmb').single()
      if (secData) {
        setSecondaryContent({
          title: secData.title || 'Penerimaan Siswa Baru',
          content: secData.content || '',
          image_url: secData.image_url || '',
          extra_url: secData.extra_url || ''
        })
      }
    } catch (error) {
      console.error('Error fetching SPMB data:', error.message)
      toast.error('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Secondary Content Save
  const handleSaveSecondary = async () => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('secondary_content')
        .upsert({ 
          slug: 'spmb', 
          title: secondaryContent.title,
          content: secondaryContent.content,
          image_url: secondaryContent.image_url,
          extra_url: secondaryContent.extra_url,
          updated_at: new Date().toISOString() 
        }, { onConflict: 'slug' })
      
      if (error) throw error
      toast.success('Informasi utama berhasil diperbarui!')
    } catch (error) {
      toast.error('Gagal: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Schedule Actions
  const handleSaveSchedule = async (e) => {
    e.preventDefault()
    try {
      if (editingSchedule) {
        const { error } = await supabase.from('spmb_schedules').update(scheduleForm).eq('id', editingSchedule.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('spmb_schedules').insert([scheduleForm])
        if (error) throw error
      }
      setIsScheduleModalOpen(false)
      setEditingSchedule(null)
      setScheduleForm({ date_range: '', activity: '', order_index: 0 })
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteSchedule = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    try {
      await supabase.from('spmb_schedules').delete().eq('id', id)
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Requirement Actions
  const handleSaveReq = async (e) => {
    e.preventDefault()
    try {
      if (editingReq) {
        const { error } = await supabase.from('spmb_requirements').update(reqForm).eq('id', editingReq.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('spmb_requirements').insert([reqForm])
        if (error) throw error
      }
      setIsReqModalOpen(false)
      setEditingReq(null)
      setReqForm({ category: 'document', content: '', order_index: 0 })
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteReq = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    try {
      await supabase.from('spmb_requirements').delete().eq('id', id)
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const publicUrl = await uploadImage(file)
      setSecondaryContent({ ...secondaryContent, extra_url: publicUrl })
    } catch (error) {
      toast.error('Upload gagal: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleHeroImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const publicUrl = await uploadImage(file, 'website')
      setSecondaryContent({ ...secondaryContent, image_url: publicUrl })
    } catch (error) {
      toast.info('Upload gambar gagal: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse italic">Menyiapkan Data PPDB...</div>

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog {...confirmState} />
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 text-white p-4 rounded-3xl shadow-2xl shadow-blue-100">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Manajemen PPDB & Mutasi</h1>
            <p className="text-gray-500 font-bold italic text-sm mt-1">Kelola Hero, Jadwal, dan Persyaratan SPMB.</p>
          </div>
        </div>
        {activeTab === 'hero' && (
          <button 
            onClick={handleSaveSecondary}
            disabled={saving || uploading}
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
          onClick={() => setActiveTab('data')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'data' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <FileText size={16} /> Data SPMB
        </button>
      </div>

      {activeTab === 'hero' ? (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Judul Hero (Headline)</label>
                <input 
                  value={secondaryContent.title}
                  onChange={(e) => setSecondaryContent({...secondaryContent, title: e.target.value})}
                  className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                  placeholder="Contoh: Penerimaan Siswa Baru"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul (Deskripsi Singkat)</label>
                <textarea 
                  value={secondaryContent.content}
                  onChange={(e) => setSecondaryContent({...secondaryContent, content: e.target.value})}
                  rows={4}
                  className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                  placeholder="Deskripsi singkat di bawah judul..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">URL File Panduan SPMB (PDF)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="text"
                    value={secondaryContent.extra_url}
                    onChange={(e) => setSecondaryContent({...secondaryContent, extra_url: e.target.value})}
                    className="flex-1 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700 text-xs"
                    placeholder="https://... atau upload file di bawah"
                  />
                  <div className="relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
                    <button className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50">
                      {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                    </button>
                  </div>
                </div>
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
                  <input type="file" id="hero-bg" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Section 2: Jadwal Kegiatan */}
      <section className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
           <div className="flex items-center gap-3">
              <Calendar className="text-orange-600" size={24} />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Jadwal Kegiatan SPMB</h2>
           </div>
           <button 
             onClick={() => { setEditingSchedule(null); setScheduleForm({ date_range: '', activity: '', order_index: schedules.length }); setIsScheduleModalOpen(true); }}
             className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
           >
              <Plus size={16} strokeWidth={3} /> Tambah Jadwal
           </button>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">
                    <th className="px-6 py-4">Urutan</th>
                    <th className="px-6 py-4">Tanggal / Rentang Waktu</th>
                    <th className="px-6 py-4">Nama Kegiatan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {schedules.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                       <td className="px-6 py-5 font-black text-orange-600 text-xs">{item.order_index}</td>
                       <td className="px-6 py-5 font-bold text-gray-800 text-sm tracking-tight">{item.date_range}</td>
                       <td className="px-6 py-5 font-medium text-gray-600 text-sm">{item.activity}</td>
                       <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => { setEditingSchedule(item); setScheduleForm({ date_range: item.date_range, activity: item.activity, order_index: item.order_index }); setIsScheduleModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                             <button onClick={() => handleDeleteSchedule(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {schedules.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-bold italic text-xs uppercase tracking-widest">Belum ada jadwal yang diatur.</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </section>

      {/* Section 3: Persyaratan (Requirements) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Requirement Columns */}
        {[
          { key: 'document', title: 'Berkas Wajib', icon: FileText, color: 'blue' },
          { key: 'mutasi_in', title: 'Mutasi Masuk', icon: CheckCircle2, color: 'indigo' },
          { key: 'mutasi_out', title: 'Mutasi Keluar', icon: X, color: 'emerald' }
        ].map((section) => (
          <section key={section.key} className={`${section.key === 'mutasi_out' ? 'lg:col-span-2' : ''} bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100`}>
             <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                <div className="flex items-center gap-3">
                   <section.icon className={`text-${section.color}-600`} size={24} />
                   <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{section.title}</h2>
                </div>
                <button 
                  onClick={() => { setEditingReq(null); setReqForm({ category: section.key, content: '', order_index: requirements.filter(r => r.category === section.key).length }); setIsReqModalOpen(true); }}
                  className={`bg-${section.color}-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-${section.color}-700 transition-all shadow-lg`}
                >
                   <Plus size={16} strokeWidth={3} /> Tambah
                </button>
             </div>

             <div className="space-y-4">
                {requirements.filter(r => r.category === section.key).map((item) => (
                   <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl group border border-transparent hover:border-gray-200 transition-all">
                      <div className={`mt-1 h-2 w-2 rounded-full bg-${section.color}-400 flex-shrink-0`}></div>
                      <p className="flex-1 text-sm font-bold text-gray-700 leading-relaxed italic">{item.content}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingReq(item); setReqForm({ category: item.category, content: item.content, order_index: item.order_index }); setIsReqModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-white rounded-lg transition-all"><Edit2 size={14} /></button>
                         <button onClick={() => handleDeleteReq(item.id)} className="p-1.5 text-red-600 hover:bg-white rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                   </div>
                ))}
                {requirements.filter(r => r.category === section.key).length === 0 && (
                   <p className="text-center py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Belum ada daftar persyaratan.</p>
                )}
             </div>
          </section>
        ))}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-orange-600 p-8 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-tight">{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
                 <button onClick={() => setIsScheduleModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveSchedule} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Tanggal / Rentang Waktu</label>
                    <input 
                      type="text" required value={scheduleForm.date_range} 
                      onChange={e => setScheduleForm({...scheduleForm, date_range: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                      placeholder="Contoh: 19 Mei - 10 Juni 2025"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Nama Kegiatan</label>
                    <input 
                      type="text" required value={scheduleForm.activity} 
                      onChange={e => setScheduleForm({...scheduleForm, activity: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                      placeholder="Contoh: Pendaftaran Online"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Urutan Tampil</label>
                    <input 
                      type="number" value={scheduleForm.order_index} 
                      onChange={e => setScheduleForm({...scheduleForm, order_index: parseInt(e.target.value)})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                    />
                 </div>
                 <button type="submit" className="w-full bg-orange-600 text-white p-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-700 transition-all shadow-lg active:scale-95">
                    {editingSchedule ? 'Perbarui Jadwal' : 'Tambahkan Sekarang'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Requirement Modal */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-tight">{editingReq ? 'Edit Persyaratan' : 'Tambah Persyaratan'}</h3>
                 <button onClick={() => setIsReqModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveReq} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Kategori</label>
                    <select 
                      value={reqForm.category}
                      onChange={e => setReqForm({...reqForm, category: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none appearance-none"
                    >
                       <option value="document">Berkas Wajib</option>
                       <option value="mutasi_in">Mutasi Masuk</option>
                       <option value="mutasi_out">Mutasi Keluar</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Isi Persyaratan</label>
                    <textarea 
                      required rows={4} value={reqForm.content} 
                      onChange={e => setReqForm({...reqForm, content: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none italic"
                      placeholder="Contoh: Fotokopi Akta Kelahiran (2 lembar)"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Urutan Tampil</label>
                    <input 
                      type="number" value={reqForm.order_index} 
                      onChange={e => setReqForm({...reqForm, order_index: parseInt(e.target.value)})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none"
                    />
                 </div>
                 <button type="submit" className="w-full bg-gray-900 text-white p-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95">
                    {editingReq ? 'Simpan Perubahan' : 'Tambahkan ke Daftar'}
                 </button>
              </form>
           </div>
        </div>
      )}
        </div>
      )}
    </div>
  </>
  )
}





