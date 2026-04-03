import { useState, useEffect } from 'react'
import { Save, X, School, Edit2, Loader2, Image as ImageIcon, Upload, LayoutGrid, FileText } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { uploadImage } from '../../../lib/storage'

export default function AdminIdentitas() {
  const { toasts, toast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')
  const [uploading, setUploading] = useState(false)

  const DEFAULT_CONTENT = `Nama Sekolah: SMP NEGERI 112 JAKARTA
NPSN: 20101569
Tingkat Pendidikan: SMP
Status Sekolah: Negeri
Alamat: JL. A. MUTHALIB JALUR 20
Kode Pos: 14450
Kelurahan: Pejagalan
Kecamatan: Penjaringan
Kota/Kabupaten: Kota Jakarta Utara
Provinsi: Prov. D.K.I. Jakarta
`

  const [heroForm, setHeroForm] = useState({
    title: 'Tentang SMP Negeri 112 Jakarta',
    content: 'Mengenal Lebih Dekat Sekolah Berkarakter and Berprestasi',
    image_url: ''
  })

  const [identitasForm, setIdentitasForm] = useState({
    title: 'Identitas Satuan Pendidikan',
    content: DEFAULT_CONTENT,
    image_url: ''
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
        .eq('slug', 'tentang-sekolah')
        .single()
      
      if (heroData) {
        setHeroForm({
          title: heroData.title || 'Tentang SMP Negeri 112 Jakarta',
          content: heroData.content || '',
          image_url: heroData.image_url || ''
        })
      }

      // Fetch Identitas
      const { data: dbData } = await supabase
        .from('school_profile')
        .select('*')
        .eq('section_name', 'identitas')
        .single()
      
      if (dbData) {
        setIdentitasForm({
          title: dbData.title || 'Identitas Satuan Pendidikan',
          content: dbData.content || DEFAULT_CONTENT,
          image_url: dbData.image_url || ''
        })
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

  const handleImageUpload = async (e, formType) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const url = await uploadImage(file)
      if (formType === 'hero') {
        setHeroForm({ ...heroForm, image_url: url })
      } else {
        setIdentitasForm({ ...identitasForm, image_url: url })
      }
    } catch (error) {
      toast.error('Upload gagal: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Save Hero
      const { error: heroErr } = await supabase
        .from('secondary_content')
        .upsert({
          slug: 'tentang-sekolah',
          title: heroForm.title,
          content: heroForm.content,
          image_url: heroForm.image_url
        })
      
      if (heroErr) throw heroErr

      // Save Identitas
      const { error: contentErr } = await supabase
        .from('school_profile')
        .upsert({
          section_name: 'identitas',
          title: identitasForm.title,
          content: identitasForm.content,
          image_url: identitasForm.image_url,
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
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
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
          <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
            <School size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Tentang Sekolah</h1>
            <p className="text-gray-500 font-bold italic text-sm">Kelola Hero and Konten Identitas Sekolah.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
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
            ${activeTab === 'hero' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <LayoutGrid size={16} /> Header Hero
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
            ${activeTab === 'content' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <FileText size={16} /> Identitas
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
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Contoh: Tentang SMP Negeri 112 Jakarta"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subjudul (Deskripsi Singkat)</label>
                  <textarea 
                    name="content"
                    value={heroForm.content}
                    onChange={handleHeroChange}
                    rows={4}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-gray-700 leading-relaxed"
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
                      onChange={(e) => handleImageUpload(e, 'hero')} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="hero-bg"
                      className="flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-black transition-all shadow-xl active:scale-95"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Judul Konten</label>
                  <input 
                    value={identitasForm.title}
                    onChange={(e) => setIdentitasForm({...identitasForm, title: e.target.value})}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-black text-gray-800"
                    placeholder="Contoh: Identitas Satuan Pendidikan"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Informasi Detail (Format: Label: Nilai)</label>
                  <textarea 
                    value={identitasForm.content}
                    onChange={(e) => setIdentitasForm({ ...identitasForm, content: e.target.value })}
                    rows={10}
                    className="w-full p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-mono text-gray-700 leading-relaxed text-sm"
                    placeholder="Nama Sekolah: SMPN 112..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Foto / Logo Sekolah</label>
                <div className="relative group">
                  <div className="aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
                    {identitasForm.image_url ? (
                      <img src={identitasForm.image_url} alt="School Photo" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                        <ImageIcon size={48} />
                        <span className="text-xs font-black uppercase tracking-widest">Belum Ada Foto</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <input 
                      type="file" 
                      id="identitas-img"
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'content')} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="identitas-img"
                      className="flex items-center justify-center gap-3 p-5 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-indigo-100 transition-all shadow-sm active:scale-95 border border-indigo-100"
                    >
                      {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                      {uploading ? 'Mengunggah...' : 'Unggah Foto Sekolah'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
              <h4 className="font-black uppercase tracking-widest text-[10px] mb-4 opacity-60 italic">Tips Format Identitas</h4>
              <p className="text-xs font-medium leading-[1.8] opacity-90">
                 Gunakan format "Label: Nilai". Contoh: "NPSN: 20101569".<br/><br/>
                 Sistem otomatis mengatur tata letaknya jika formatnya diikuti dengan garis baru.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  )
}



