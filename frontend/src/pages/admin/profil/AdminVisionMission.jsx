import { useState, useEffect } from 'react'
import { Save, X, Eye, Target, Loader2, Edit2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'

export default function AdminVisionMission() {
  const { toasts, toast, removeToast } = useToast()
  const [vision, setVision] = useState('')
  const [mission, setMission] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchVisionMission()
  }, [])

  async function fetchVisionMission() {
    try {
      const { data } = await supabase
        .from('school_profile')
        .select('*')
        .in('section_name', ['vision', 'mission'])
      
      if (data) {
        const v = data.find(d => d.section_name === 'vision')
        const m = data.find(d => d.section_name === 'mission')
        setVision(v?.content || '')
        setMission(m?.content || '')
      }
    } catch (error) {
      console.error('Error fetching v/m:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error: vErr } = await supabase
        .from('school_profile')
        .upsert({ section_name: 'vision', content: vision }, { onConflict: 'section_name' });
      
      const { error: mErr } = await supabase
        .from('school_profile')
        .upsert({ section_name: 'mission', content: mission }, { onConflict: 'section_name' });
      
      if (vErr || mErr) throw vErr || mErr;
      
      setIsEditing(false);
      fetchVisionMission();
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-400 uppercase tracking-widest">Loading...</div>

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200">
            <Target size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Visi & Misi</h1>
            <p className="text-gray-500 font-medium italic">Tujuan and arah masa depan SMPN 112 Jakarta.</p>
          </div>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-1"
          >
            <Edit2 size={18} /> Edit Visi Misi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Vision Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
           <div className="flex items-center gap-3 mb-6">
              <Eye className="text-indigo-600" size={24} />
              <h3 className="text-xl font-black text-gray-900 uppercase italic">Visi Sekolah</h3>
           </div>
           {isEditing ? (
             <textarea 
               value={vision}
               onChange={(e) => setVision(e.target.value)}
               className="w-full p-6 bg-gray-50 rounded-3xl border border-gray-100 focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-indigo-900 text-2xl h-40 scrollbar-hide italic text-center"
               placeholder="Tuliskan visi sekolah..."
             />
           ) : (
             <p className="text-2xl font-black text-indigo-900 italic text-center py-6 leading-relaxed">
               {vision || 'Visi belum ditentukan.'}
             </p>
           )}
        </div>

        {/* Mission Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
           <div className="flex items-center gap-3 mb-6">
              <Target className="text-emerald-500" size={24} />
              <h3 className="text-xl font-black text-gray-900 uppercase italic">Misi Sekolah</h3>
           </div>
           {isEditing ? (
             <textarea 
               value={mission}
               onChange={(e) => setMission(e.target.value)}
               className="w-full p-6 bg-gray-50 rounded-3xl border border-gray-100 focus:ring-4 focus:ring-emerald-100 outline-none font-medium text-gray-700 text-lg h-[400px] scrollbar-hide"
               placeholder="Tuliskan misi sekolah (satu baris per poin)..."
             />
           ) : (
             <div className="space-y-4 py-4">
                {mission ? mission.split('\n').map((point, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-emerald-200 transition-colors">
                     <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">
                        {i + 1}
                     </span>
                     <p className="text-gray-700 font-medium leading-relaxed">{point}</p>
                  </div>
                )) : (
                  <p className="text-gray-400 italic">Misi belum ditentukan.</p>
                )}
             </div>
           )}
        </div>

        {isEditing && (
           <div className="flex gap-4 animate-in slide-in-from-bottom-8 duration-500">
             <button 
               onClick={handleSave}
               disabled={saving}
               className="flex-1 bg-blue-600 text-white p-6 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 disabled:opacity-50"
             >
               {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
               Simpan Visi & Misi Sekarang
             </button>
             <button 
               onClick={() => { setIsEditing(false); fetchVisionMission(); }}
               className="bg-white text-gray-400 px-10 rounded-[1.5rem] font-black text-sm uppercase tracking-widest border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
             >
               <X size={20} /> Batal
             </button>
           </div>
        )}
      </div>
    </div>
  </>
  )
}



