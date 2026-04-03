import { useState, useEffect } from 'react'
import { Save, X, Award, Edit2, Plus, Trash2, Loader2, Upload, Image as ImageIcon, LayoutGrid, FileText } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { uploadImage } from '../../../lib/storage'

export default function AdminAkreditasi() {
  const { toasts, toast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')
  const [uploading, setUploading] = useState(false)

  const defaultDesc = `SMP Negeri 112 Jakarta telah meraih Akreditasi A dari Badan Akreditasi Nasional Pendidikan Anak Usia Dini, Dasar, dan Menengah (BAN-PDM). Akreditasi ini menunjukkan bahwa sekolah memenuhi standar nasional dalam hal kualitas pendidikan, manajemen sekolah, fasilitas, and prestasi siswa.\n\nProses akreditasi dilakukan secara berkala untuk memastikan sekolah terus meningkatkan mutu pendidikan. Kami berkomitmen untuk meningkatkan standar ini demi memberikan pendidikan terbaik bagi siswa.`
  
  const defaultDetails = [
    { id: 1, label: 'Tahun Akreditasi', value: '2022' },
    { id: 2, label: 'Peringkat', value: 'A' },
    { id: 3, label: 'Lembaga Akreditasi', value: 'BAN-PDM' },
    { id: 4, label: 'Nomor SK Akreditasi', value: '1857/BAN-SM/SK/2022' },
    { id: 5, label: 'Masa Berlaku', value: '2022 - 2027' }
  ];

  const [heroForm, setHeroForm] = useState({
    title: 'Akreditasi Sekolah',
    content: 'Mengenal Lebih Dekat Sekolah Berkarakter and Berprestasi',
    image_url: ''
  })

  const [contentForm, setContentForm] = useState({
    description: defaultDesc,
    details: defaultDetails
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
        .eq('slug', 'akreditasi')
        .single()
      
      if (heroData) {
        setHeroForm({
          title: heroData.title || 'Akreditasi Sekolah',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }

      // Fetch Content (Accreditation Details)
      const { data: dbData } = await supabase
        .from('school_profile')
        .select('content')
        .eq('section_name', 'accreditation')
        .single()
      
      if (dbData) {
        try {
          const parsed = JSON.parse(dbData.content)
          setContentForm({
            description: parsed.description || defaultDesc,
            details: parsed.details || defaultDetails
          })
        } catch (e) {
          console.error("Error parsing content:", e)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHeroChange = (e) => {
    setHeroForm({ ...heroForm, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const url = await uploadImage(file)
      setHeroForm({ ...heroForm, image_url: url })
    } catch (error) {
      toast.error('Upload gagal: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleAddField = () => {
    setContentForm({
      ...contentForm,
      details: [...contentForm.details, { id: Date.now(), label: '', value: '' }]
    })
  }

  const handleRemoveField = (id) => {
    setContentForm({
      ...contentForm,
      details: contentForm.details.filter(d => d.id !== id)
    })
  }

  const handleUpdateField = (id, key, value) => {
    setContentForm({
      ...contentForm,
      details: contentForm.details.map(d => d.id === id ? { ...d, [key]: value } : d)
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Save Hero
      const { error: heroErr } = await supabase
        .from('secondary_content')
        .upsert({
          slug: 'akreditasi',
          title: heroForm.title,
          content: heroForm.content,
          image_url: heroForm.image_url
        })
      
      if (heroErr) throw heroErr

      // Save Content
      const { error: contentErr } = await supabase
        .from('school_profile')
        .upsert({
          section_name: 'accreditation',
          content: JSON.stringify(contentForm),
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_name' })
      
      if (contentErr) throw contentErr

      toast.success('Berhasil disimpan!')
      fetchData()
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } finally {
      setSaving(false)
    }
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl shadow-slate-200 ring-8 ring-slate-50">
            <Award size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Akreditasi Sekolah</h1>
            <p className="text-gray-500 font-bold italic text-sm">Kelola Hero and Konten Detail Akreditasi.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
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
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'content' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <FileText size={16} /> Isi Konten
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
                    placeholder="Contoh: Akreditasi Sekolah"
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
                    placeholder="Contoh: Mengenal Lebih Dekat Sekolah Berkarakter..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Gambar Background Hero</label>
                <div className="relative group">
                  <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-gray-50 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
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
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="hero-bg"
                      className="flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-blue-600 transition-all shadow-xl active:scale-95"
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
          <div className="p-8 md:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Narasi Status Akreditasi</label>
              <textarea 
                value={contentForm.description}
                onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                rows={6}
                className="w-full p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-gray-700 leading-relaxed"
                placeholder="Tuliskan deskripsi akreditasi sekolah di sini..."
              />
            </div>

            {/* Details Table */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b-2 border-gray-100 pb-4 ml-2">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Tabel Detail Akreditasi</h3>
                <button 
                  onClick={handleAddField}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <Plus size={14} /> Tambah Baris
                </button>
              </div>

              <div className="grid gap-4">
                {contentForm.details.map((detail) => (
                  <div key={detail.id} className="group flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100">
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Label</label>
                      <input 
                        value={detail.label}
                        onChange={(e) => handleUpdateField(detail.id, 'label', e.target.value)}
                        className="w-full p-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800 text-sm"
                        placeholder="Contoh: Peringkat"
                      />
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nilai / Value</label>
                      <input 
                        value={detail.value}
                        onChange={(e) => handleUpdateField(detail.id, 'value', e.target.value)}
                        className="w-full p-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800 text-sm"
                        placeholder="Contoh: A (Sangat Baik)"
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveField(detail.id)}
                      className="mt-4 md:mt-0 p-4 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  )
}



