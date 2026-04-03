import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, Users, Upload, Loader2, Image as ImageIcon, LayoutGrid, FileText, ChevronDown } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

const CATEGORIES = [
  { value: 'kepala_sekolah', label: 'Kepala Sekolah & Wakil' },
  { value: 'guru', label: 'Guru' },
  { value: 'tendik', label: 'Tenaga Kependidikan' },
]

const EMPTY_FORM = {
  name: '',
  role: '',
  subject: '',
  category: 'guru',
  image_url: '',
  order_index: 0,
}

export default function AdminStaff() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')
  const [uploading, setUploading] = useState(false)
  // null = not editing, 'new' = adding new, id = editing existing
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [filterCategory, setFilterCategory] = useState('all')

  const [heroForm, setHeroForm] = useState({
    title: 'Guru & Tenaga Kependidikan',
    content: 'Mengenal Lebih Dekat Para Pendidik Profesional SMP Negeri 112 Jakarta.',
    image_url: ''
  })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const { data: heroData } = await supabase.from('secondary_content').select('*').eq('slug', 'guru').single()
      if (heroData) {
        setHeroForm({
          title: heroData.title || 'Guru & Tenaga Kependidikan',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }
      const { data: staffData, error } = await supabase.from('staff').select('*').order('order_index', { ascending: true })
      if (error) throw error
      setMembers(staffData || [])
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHeroChange = (e) => setHeroForm({ ...heroForm, [e.target.name]: e.target.value })

  const handleStartNew = () => {
    setEditingId('new')
    setEditForm({ ...EMPTY_FORM, order_index: members.length })
  }

  const handleEdit = (member) => {
    setEditingId(member.id)
    setEditForm({ ...member })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm(EMPTY_FORM)
  }

  const handleImageUpload = async (e, mode = 'staff') => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const publicUrl = await uploadImage(file, 'website')
      if (mode === 'hero') {
        setHeroForm(prev => ({ ...prev, image_url: publicUrl }))
      } else {
        setEditForm(prev => ({ ...prev, image_url: publicUrl }))
      }
    } catch (error) {
      toast.error('Gagal mengunggah foto: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveHero = async () => {
    try {
      setSaving(true)
      const { error } = await supabase.from('secondary_content').upsert({
        slug: 'guru',
        title: heroForm.title,
        content: heroForm.content,
        image_url: heroForm.image_url
      }, { onConflict: 'slug' })
      if (error) throw error
      toast.success('Hero berhasil disimpan!')
    } catch (error) {
      toast.error('Gagal menyimpan Hero: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveStaff = async () => {
    if (!editForm.name.trim()) return toast.info('Nama tidak boleh kosong.')
    try {
      setSaving(true)
      const payload = {
        name: editForm.name,
        role: editForm.role,
        subject: editForm.subject || null,
        category: editForm.category || 'guru',
        image_url: editForm.image_url || null,
        order_index: editForm.order_index || 0,
      }

      if (editingId === 'new') {
        // INSERT — do NOT include id
        const { error } = await supabase.from('staff').insert([payload])
        if (error) throw error
      } else {
        // UPDATE — include the existing id
        const { error } = await supabase.from('staff').update(payload).eq('id', editingId)
        if (error) throw error
      }

      setEditingId(null)
      setEditForm(EMPTY_FORM)
      fetchData()
    } catch (error) {
      toast.error('Error menyimpan staff: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    await supabase.from('staff').delete().eq('id', id)
    fetchData()
  }

  const filtered = filterCategory === 'all' ? members : members.filter(m => m.category === filterCategory)

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
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
          <div className="bg-emerald-600 text-white p-4 rounded-3xl shadow-2xl shadow-emerald-100 ring-8 ring-emerald-50">
            <Users size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Guru & Staff</h1>
            <p className="text-gray-500 font-bold italic text-sm">Kelola Hero dan Direktori Staff.</p>
          </div>
        </div>
        {activeTab === 'hero' ? (
          <button onClick={handleSaveHero} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Simpan Hero
          </button>
        ) : editingId == null ? (
          <button onClick={handleStartNew} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-100 active:scale-95">
            <Plus size={20} /> Tambah Staff
          </button>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-gray-100 rounded-[2rem] max-w-md mx-auto shadow-inner">
        {[{ key: 'hero', icon: <LayoutGrid size={16} />, label: 'Header Hero' }, { key: 'content', icon: <FileText size={16} />, label: 'Data Staff' }].map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setEditingId(null) }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.key ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'hero' ? (
        /* ─── HERO TAB ─── */
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Judul Hero</label>
                <input name="title" value={heroForm.title} onChange={handleHeroChange}
                  className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                  placeholder="Guru & Tenaga Kependidikan" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul</label>
                <textarea name="content" value={heroForm.content} onChange={handleHeroChange} rows={4}
                  className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
                  placeholder="Deskripsi singkat..." />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Gambar Background Hero</label>
              <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-gray-50 shadow-2xl">
                {heroForm.image_url ? (
                  <img src={heroForm.image_url} alt="Hero BG" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                    <ImageIcon size={48} /><span className="text-xs font-black uppercase tracking-widest">Belum Ada Gambar</span>
                  </div>
                )}
              </div>
              <input type="file" id="hero-bg" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} className="hidden" />
              <label htmlFor="hero-bg" className="flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-black transition-all shadow-xl">
                {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                {uploading ? 'Mengunggah...' : 'Ganti Gambar Hero'}
              </label>
            </div>
          </div>
        </div>
      ) : (
        /* ─── DATA STAFF TAB ─── */
        <div className="space-y-8">
          {/* Add New Form */}
          {editingId === 'new' && (
            <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-emerald-400 p-8 md:p-10">
              <h3 className="font-black text-xl uppercase text-emerald-700 mb-8 flex items-center gap-3">
                <div className="bg-emerald-600 text-white p-1.5 rounded-xl"><Plus size={20} /></div> Tambah Staff Baru
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-emerald-200 shadow-xl bg-gray-100 group">
                    {editForm.image_url ? (
                      <img src={editForm.image_url} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <ImageIcon size={36} /><span className="text-[10px] font-black uppercase mt-1">Foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'staff')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                    </div>
                  </div>
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Klik foto untuk ganti</label>
                </div>

                {/* Fields */}
                <div className="space-y-4 col-span-1 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Lengkap *</label>
                      <input type="text" value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-emerald-400 outline-none font-bold text-sm transition-all"
                        placeholder="cth: Budi Santoso, M.Pd" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jabatan / Role *</label>
                      <input type="text" value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-emerald-400 outline-none font-bold text-sm transition-all"
                        placeholder="cth: Kepala Sekolah" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mata Pelajaran</label>
                      <input type="text" value={editForm.subject || ''}
                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-emerald-400 outline-none font-bold text-sm transition-all"
                        placeholder="cth: Matematika, IPA, dll" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kategori</label>
                      <div className="relative">
                        <select value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-emerald-400 outline-none font-bold text-sm appearance-none transition-all">
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Urutan</label>
                      <input type="number" value={editForm.order_index}
                        onChange={(e) => setEditForm({ ...editForm, order_index: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-emerald-400 outline-none font-bold text-sm transition-all" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveStaff} disabled={saving}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Tambah Staff
                    </button>
                    <button onClick={handleCancel} className="bg-gray-100 text-gray-500 px-6 py-4 rounded-2xl hover:bg-gray-200 transition-all">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter by Category */}
          <div className="flex flex-wrap gap-3">
            {[{ value: 'all', label: 'Semua' }, ...CATEGORIES].map(c => (
              <button key={c.value} onClick={() => setFilterCategory(c.value)}
                className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${filterCategory === c.value ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-gray-500 border border-gray-200 hover:border-emerald-300'}`}>
                {c.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400 font-bold self-center">{filtered.length} orang</span>
          </div>

          {/* Staff Grid */}
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-8 md:p-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filtered.map((member) => (
                editingId === member.id ? (
                  /* Edit Inline Card */
                  <div key={member.id} className="bg-white rounded-[2rem] p-4 border-2 border-emerald-500 shadow-2xl col-span-2 sm:col-span-1">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-200 shadow-lg mx-auto mb-3 group">
                      <img src={editForm.image_url || '/placeholder-staff.png'} className="w-full h-full object-cover" alt="Edit" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'staff')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        {uploading ? <Loader2 className="animate-spin text-white" size={16} /> : <Upload className="text-white" size={16} />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Nama" className="w-full p-2 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs outline-none focus:border-emerald-400" />
                      <input type="text" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        placeholder="Jabatan" className="w-full p-2 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs outline-none focus:border-emerald-400" />
                      <input type="text" value={editForm.subject || ''} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        placeholder="Mata Pelajaran" className="w-full p-2 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs outline-none focus:border-emerald-400" />
                      <div className="relative">
                        <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full p-2 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs outline-none appearance-none">
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-1 pt-1">
                        <button onClick={handleSaveStaff} disabled={saving} className="flex-1 bg-emerald-600 text-white p-2 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1">
                          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Simpan
                        </button>
                        <button onClick={handleCancel} className="bg-gray-100 text-gray-400 p-2 rounded-lg hover:bg-gray-200"><X size={14} /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Display Card */
                  <div key={member.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-all group relative text-center p-4 flex flex-col items-center">
                    <div className="relative mb-3">
                      <img src={member.image_url || '/placeholder-staff.png'}
                        className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md" alt={member.name} />
                      <span className="absolute -top-1 -right-1 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border border-emerald-200">
                        {CATEGORIES.find(c => c.value === member.category)?.label?.split(' ')[0] || 'Guru'}
                      </span>
                    </div>
                    <h3 className="text-xs font-black text-gray-900 leading-tight mb-1 line-clamp-2">{member.name}</h3>
                    <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-tight mb-0.5 line-clamp-2">{member.role}</p>
                    {member.subject && <p className="text-gray-400 font-bold text-[9px] italic line-clamp-1">{member.subject}</p>}
                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]">
                      <button onClick={() => handleEdit(member)} className="bg-white/20 backdrop-blur-md text-white p-2.5 rounded-xl hover:bg-white/40 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="bg-red-500/80 text-white p-2.5 rounded-xl hover:bg-red-600 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <Users size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Belum ada staff di kategori ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}




