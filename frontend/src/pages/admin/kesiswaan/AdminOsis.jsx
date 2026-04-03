import { useState, useEffect } from 'react'
import { Save, X, Eye, Target, Image as ImageIcon, Upload, Loader2, Edit2, Shield, Plus, Trash2, Camera, LayoutGrid, FileText, Check, Users, Pencil } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminOsis() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [activeTab, setActiveTab] = useState('hero')
  const [vision, setVision] = useState('')
  const [mission, setMission] = useState({ content: '', image_url: '' })
  const [members, setMembers] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [heroForm, setHeroForm] = useState({
    title: 'OSIS & MPK',
    content: 'Wadah Kepemimpinan and Aspirasi Siswa SMP Negeri 112 Jakarta.',
    image_url: ''
  })

  const [isEditing, setIsEditing] = useState(null) // 'vision' or 'mission'
  const [editForm, setEditForm] = useState({ content: '', image_url: '' })
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [editingActivityId, setEditingActivityId] = useState(null)
  const [memberForm, setMemberForm] = useState({ name: '', position: '', type: 'OSIS', image_url: '', order_index: 0 })
  const [activityForm, setActivityForm] = useState({ title: '', description: '', image_url: '', activity_date: new Date().toISOString().split('T')[0] })

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
        .eq('slug', 'osis')
        .single()

      if (heroData) {
        setHeroForm({
          title: heroData.title || 'OSIS & MPK',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }

      const { data: infoData } = await supabase.from('osis_info').select('*')
      const v = infoData?.find(d => d.section_name === 'vision')
      const m = infoData?.find(d => d.section_name === 'mission')

      if (v) setVision(v.content)
      if (m) setMission({ content: m.content, image_url: m.image_url })

      const { data: memberData } = await supabase
        .from('osis_members')
        .select('*')
        .order('order_index', { ascending: true })

      setMembers(memberData || [])

      const { data: actData } = await supabase
        .from('student_activities')
        .select('*')
        .order('activity_date', { ascending: false })

      setActivities(actData || [])
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHeroChange = (e) => {
    setHeroForm({ ...heroForm, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e, mode = 'member') => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const publicUrl = await uploadImage(file, 'website')
      if (mode === 'hero') {
        setHeroForm({ ...heroForm, image_url: publicUrl })
      } else if (mode === 'vision' || mode === 'mission') {
        setEditForm({ ...editForm, image_url: publicUrl })
      } else if (mode === 'activity') {
        setActivityForm({ ...activityForm, image_url: publicUrl })
      } else {
        setMemberForm({ ...memberForm, image_url: publicUrl })
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
          slug: 'osis',
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

  const startEdit = (type) => {
    setIsEditing(type)
    if (type === 'vision') {
      setEditForm({ content: vision, image_url: '' })
    } else {
      setEditForm({ content: mission.content, image_url: mission.image_url })
    }
  }

  const handleSaveInfo = async () => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('osis_info')
        .upsert({
          section_name: isEditing,
          content: editForm.content,
          image_url: isEditing === 'mission' ? editForm.image_url : null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_name' })

      if (error) throw error
      setIsEditing(null)
      fetchData()
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMemberSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editingMemberId) {
        const { error } = await supabase
          .from('osis_members')
          .update(memberForm)
          .eq('id', editingMemberId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('osis_members')
          .insert([memberForm])
        if (error) throw error
      }
      setIsMemberModalOpen(false)
      resetMemberForm()
      fetchData()
    } catch (error) {
      toast.error('Gagal menyimpan member: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMember = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    try {
      const { error } = await supabase.from('osis_members').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message)
    }
  }

  const openEditMember = (member) => {
    setEditingMemberId(member.id)
    setMemberForm({
      name: member.name,
      position: member.position,
      type: member.type,
      image_url: member.image_url || '',
      order_index: member.order_index
    })
    setIsMemberModalOpen(true)
  }

  const resetMemberForm = () => {
    setEditingMemberId(null)
    setMemberForm({ name: '', position: '', type: 'OSIS', image_url: '', order_index: members.length + 1 })
  }

  const handleActivitySubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editingActivityId) {
        const { error } = await supabase
          .from('student_activities')
          .update(activityForm)
          .eq('id', editingActivityId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('student_activities')
          .insert([activityForm])
        if (error) throw error
      }
      setIsActivityModalOpen(false)
      resetActivityForm()
      fetchData()
    } catch (error) {
      toast.error('Gagal menyimpan galeri: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteActivity = async (id) => {
    if (!(await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) return
    try {
      const { error } = await supabase.from('student_activities').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message)
    }
  }

  const openEditActivity = (act) => {
    setEditingActivityId(act.id)
    setActivityForm({
      title: act.title,
      description: act.description,
      image_url: act.image_url || '',
      activity_date: act.activity_date
    })
    setIsActivityModalOpen(true)
  }

  const resetActivityForm = () => {
    setEditingActivityId(null)
    setActivityForm({ title: '', description: '', image_url: '', activity_date: new Date().toISOString().split('T')[0] })
  }

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
              <Shield size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">OSIS & MPK</h1>
              <p className="text-gray-500 font-bold italic text-sm mt-1">Kelola Hero, Visi, Misi and Struktur.</p>
            </div>
          </div>
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
            <FileText size={16} /> Organisasi
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
                      placeholder="Contoh: OSIS & MPK Center"
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
                      placeholder="Contoh: Wadah Kepemimpinan and Aspirasi..."
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
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
              {/* Visi & Misi Management */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visi OSIS */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 relative group overflow-hidden">
                  <div className="flex justify-between items-center mb-8 text-blue-600">
                    <div className="flex items-center gap-4">
                      <Eye size={32} />
                      <h2 className="text-2xl font-black uppercase tracking-tight">Visi OSIS</h2>
                    </div>
                    <button onClick={() => startEdit('vision')} className="bg-gray-50 text-blue-600 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit2 size={18} /></button>
                  </div>
                  {isEditing === 'vision' ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <textarea value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} className="w-full h-40 p-6 bg-gray-50 rounded-3xl border border-gray-100 outline-none font-bold text-gray-700 uppercase leading-relaxed" />
                      <div className="flex gap-2">
                        <button onClick={handleSaveInfo} disabled={saving} className="flex-1 bg-blue-600 text-white p-4 rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-100">{saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Simpan Visi'}</button>
                        <button onClick={() => setIsEditing(null)} className="bg-gray-100 text-gray-400 p-4 rounded-xl font-black text-xs uppercase">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 font-black text-xl leading-relaxed uppercase italic">{vision || 'Belum ada visi.'}</p>
                  )}
                </div>

                {/* Misi OSIS */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 group overflow-hidden">
                  <div className="flex justify-between items-center mb-8 text-emerald-600">
                    <div className="flex items-center gap-4">
                      <Target size={32} />
                      <h2 className="text-2xl font-black uppercase tracking-tight">Misi OSIS</h2>
                    </div>
                    <button onClick={() => startEdit('mission')} className="bg-gray-50 text-emerald-600 p-3 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Edit2 size={18} /></button>
                  </div>
                  {isEditing === 'mission' ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <textarea value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} className="w-full h-40 p-6 bg-gray-50 rounded-3xl border border-gray-100 outline-none font-medium text-gray-700 leading-relaxed" placeholder="Enter per baris..." />
                      <div className="flex gap-2">
                        <button onClick={handleSaveInfo} disabled={saving} className="flex-1 bg-emerald-600 text-white p-4 rounded-xl font-black text-xs uppercase shadow-lg shadow-emerald-100">{saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Simpan Misi'}</button>
                        <button onClick={() => setIsEditing(null)} className="bg-gray-100 text-gray-400 p-4 rounded-xl font-black text-xs uppercase">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {mission.content ? mission.content.split('\n').map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm font-bold text-gray-600"><span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">{idx + 1}</span>{item}</li>
                      )) : <li className="text-gray-400 italic">Belum ada misi.</li>}
                    </ul>
                  )}
                </div>
              </div>

              {/* Members Section */}
              <div className="bg-gray-50/50 rounded-[3rem] p-8 md:p-12 border border-gray-100 space-y-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-purple-600">
                    <Users size={32} />
                    <h2 className="text-2xl font-black uppercase tracking-tight">Struktur Pengurus</h2>
                  </div>
                  <button onClick={() => { resetMemberForm(); setIsMemberModalOpen(true); }} className="bg-purple-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-purple-100 flex items-center gap-2 transition-all active:scale-95"><Plus size={18} /> Tambah Pengurus</button>
                </div>

                <div className="space-y-12">
                  {['OSIS', 'MPK'].map(type => (
                    <div key={type}>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4"><div className="h-px bg-gray-200 flex-1"></div> {type} <div className="h-px bg-gray-200 flex-1"></div></h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {members.filter(m => m.type === type).map(m => (
                          <div key={m.id} className="relative group/card bg-white rounded-3xl p-4 text-center shadow-sm border border-transparent hover:border-purple-200 transition-all hover:shadow-xl">
                            <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl overflow-hidden mb-3 border-2 border-white ring-1 ring-gray-100">
                              {m.image_url ? <img src={m.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Users size={24} /></div>}
                            </div>
                            <h4 className="text-[10px] font-black uppercase text-gray-900 line-clamp-1">{m.name}</h4>
                            <p className="text-[8px] font-bold text-purple-600 uppercase mt-0.5">{m.position}</p>
                            <div className="absolute inset-0 bg-purple-600/90 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2 px-2">
                              <button onClick={() => openEditMember(m)} className="p-2 bg-white text-purple-600 rounded-lg hover:scale-110 transition-transform"><Pencil size={12} /></button>
                              <button onClick={() => handleDeleteMember(m.id)} className="p-2 bg-white text-red-500 rounded-lg hover:scale-110 transition-transform"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities Section */}
              <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 space-y-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-pink-600">
                    <Camera size={32} />
                    <h2 className="text-2xl font-black uppercase tracking-tight">Galeri Dokumentasi</h2>
                  </div>
                  <button onClick={() => { resetActivityForm(); setIsActivityModalOpen(true); }} className="bg-pink-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-pink-100 flex items-center gap-2 transition-all active:scale-95"><Plus size={18} /> Tambah Galeri</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activities.map(act => (
                    <div key={act.id} className="relative group/gal bg-gray-50 rounded-[2.5rem] overflow-hidden border border-transparent hover:border-pink-100 hover:shadow-2xl transition-all duration-500">
                      <div className="h-48 relative overflow-hidden bg-gray-200">
                        {act.image_url ? <img src={act.image_url} className="w-full h-full object-cover transform group-hover/gal:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={48} strokeWidth={1} /></div>}
                        <div className="absolute inset-0 bg-pink-600/80 opacity-0 group-hover/gal:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button onClick={() => openEditActivity(act)} className="p-4 bg-white text-pink-600 rounded-2xl hover:scale-110 transition-all shadow-xl"><Pencil size={24} /></button>
                          <button onClick={() => handleDeleteActivity(act.id)} className="p-4 bg-white text-red-500 rounded-2xl hover:scale-110 transition-all shadow-xl"><Trash2 size={24} /></button>
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="font-black text-gray-900 uppercase tracking-tight mb-1 line-clamp-1">{act.title}</h4>
                        <p className="text-[10px] font-black text-pink-600 uppercase italic">{new Date(act.activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Member Modal */}
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMemberModalOpen(false)}></div>
            <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-slide-up border border-white">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 text-purple-600">
                <h2 className="text-xl font-black uppercase tracking-tight">{editingMemberId ? 'Edit' : 'Tambah'} Pengurus</h2>
                <button onClick={() => setIsMemberModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleMemberSubmit} className="p-8 space-y-6">
                <div className="text-center">
                  {memberForm.image_url ? (
                    <div className="relative w-24 h-24 mx-auto rounded-3xl overflow-hidden ring-4 ring-purple-50 group">
                      <img src={memberForm.image_url} className="w-full h-full object-cover" />
                      <button onClick={() => setMemberForm({ ...memberForm, image_url: '' })} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={24} /></button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 mx-auto bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-all">
                      <Upload size={24} />
                      <span className="text-[8px] font-black uppercase mt-1">Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'member')} />
                    </label>
                  )}
                </div>
                <div className="space-y-4">
                  <input required placeholder="Nama Lengkap" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Jabatan" value={memberForm.position} onChange={e => setMemberForm({ ...memberForm, position: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 text-sm" />
                    <select value={memberForm.type} onChange={e => setMemberForm({ ...memberForm, type: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 text-sm">
                      <option value="OSIS">OSIS</option>
                      <option value="MPK">MPK</option>
                    </select>
                  </div>
                  <input type="number" placeholder="Order Index" value={memberForm.order_index} onChange={e => setMemberForm({ ...memberForm, order_index: parseInt(e.target.value) })} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={saving || uploading} className="flex-1 bg-purple-600 text-white p-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-purple-900/10 transition-all active:scale-95">{saving ? 'Menyimpan...' : 'Simpan Pengurus'}</button>
                  <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-6 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Activity Modal */}
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsActivityModalOpen(false)}></div>
            <div className="relative bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up border border-white">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 text-pink-600">
                <h2 className="text-xl font-black uppercase tracking-tight">{editingActivityId ? 'Edit' : 'Tambah'} Galeri</h2>
                <button onClick={() => setIsActivityModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleActivitySubmit} className="p-8 space-y-6">
                <div className="text-center">
                  {activityForm.image_url ? (
                    <div className="relative aspect-video mx-auto rounded-3xl overflow-hidden ring-4 ring-pink-50 group shadow-2xl">
                      <img src={activityForm.image_url} className="w-full h-full object-cover" />
                      <button onClick={() => setActivityForm({ ...activityForm, image_url: '' })} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={40} /></button>
                    </div>
                  ) : (
                    <label className="aspect-video w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 cursor-pointer hover:bg-pink-50 hover:border-pink-200 transition-all group">
                      <Upload size={40} className="group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black uppercase mt-2 tracking-widest text-gray-400 group-hover:text-pink-600">Upload Foto Galeri</span>
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'activity')} />
                    </label>
                  )}
                </div>
                <div className="space-y-4">
                  <input required placeholder="Judul Dokumentasi" value={activityForm.title} onChange={e => setActivityForm({ ...activityForm, title: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" />
                  <textarea rows={3} placeholder="Keterangan singkat..." value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium text-gray-600 resize-none" />
                  <input type="date" value={activityForm.activity_date} onChange={e => setActivityForm({ ...activityForm, activity_date: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={saving || uploading} className="flex-1 bg-pink-600 text-white p-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-pink-900/10 transition-all active:scale-95">{saving ? 'Menyimpan...' : 'Simpan Galeri'}</button>
                  <button type="button" onClick={() => setIsActivityModalOpen(false)} className="px-6 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}





