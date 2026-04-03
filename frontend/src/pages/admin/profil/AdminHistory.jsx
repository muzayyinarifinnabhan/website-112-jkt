import { useState, useEffect } from 'react'
import { Save, X, History, Image as ImageIcon, Upload, Loader2, Edit2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { uploadImage } from '../../../lib/storage'

export default function AdminHistory() {
  const { toasts, toast, removeToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ content: '', image_url: '' })

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      const { data, error } = await supabase
        .from('school_profile')
        .select('*')
        .eq('section_name', 'history')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setProfile(data)
        setEditForm({ content: data.content, image_url: data.image_url })
      } else {
        // If not exists, create a placeholder structure
        setEditForm({ content: '', image_url: '' })
      }
    } catch (error) {
      console.error('Error fetching history:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      const publicUrl = await uploadImage(file);
      setEditForm({ ...editForm, image_url: publicUrl });
    } catch (error) {
      toast.error('Gagal mengunggah: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('school_profile')
        .upsert({ 
          section_name: 'history',
          content: editForm.content,
          image_url: editForm.image_url,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_name' });
      
      if (error) throw error;
      setIsEditing(false);
      fetchHistory();
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
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Sejarah Sekolah</h1>
            <p className="text-gray-500 font-medium italic">Ceritakan perjalanan and latar belakang SMPN 112 Jakarta.</p>
          </div>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-1"
          >
            <Edit2 size={18} /> Edit Konten
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
           {isEditing ? (
             <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-2 border-blue-500 animate-in fade-in zoom-in duration-300">
               <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 italic">Uraian Sejarah (Gunakan Paragraf Baru jika perlu)</label>
               <textarea 
                 value={editForm.content}
                 onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                 className="w-full h-[500px] p-6 bg-gray-50 rounded-3xl border border-gray-100 focus:ring-4 focus:ring-blue-100 outline-none font-medium leading-relaxed text-gray-700 text-lg scrollbar-hide"
                 placeholder="Tuliskan sejarah sekolah di sini..."
               />
             </div>
           ) : (
             <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-50 min-h-[400px]">
                <div className="prose prose-blue max-w-none">
                   {profile?.content ? (
                     profile.content.split('\n').map((para, i) => (
                       <p key={i} className="text-gray-600 text-lg leading-relaxed mb-4">{para}</p>
                     ))
                   ) : (
                     <p className="text-gray-400 italic">Belum ada konten sejarah. Silakan klik edit untuk menambahkan.</p>
                   )}
                </div>
             </div>
           )}
        </div>

        {/* Sidebar: Image & Actions */}
        <div className="space-y-8">
           {/* Image Preview / Upload */}
           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 overflow-hidden group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Gambar Ilustrasi</label>
              <div className="relative aspect-square rounded-3xl bg-gray-100 overflow-hidden mb-6 border-2 border-gray-50">
                 {editForm.image_url || profile?.image_url ? (
                   <img 
                     src={isEditing ? editForm.image_url : profile?.image_url} 
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                     alt="School History" 
                   />
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={48} strokeWidth={1} />
                      <span className="text-[10px] font-black uppercase mt-2 tracking-widest">No Image</span>
                   </div>
                 )}
                 {isEditing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <input 
                         type="file" 
                         accept="image/*" 
                         onChange={handleImageUpload} 
                         className="absolute inset-0 opacity-0 cursor-pointer z-10"
                       />
                       <div className="flex flex-col items-center gap-2 text-white">
                         {uploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                         <span className="text-[10px] font-black uppercase tracking-widest">{uploading ? 'Uploading...' : 'Ganti Foto'}</span>
                       </div>
                    </div>
                 )}
              </div>

              {isEditing && (
                 <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                    <button 
                      onClick={handleSave}
                      disabled={saving || uploading}
                      className="w-full bg-blue-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Simpan Perubahan
                    </button>
                    <button 
                      onClick={() => { setIsEditing(false); fetchHistory(); }}
                      className="w-full bg-gray-50 text-gray-400 p-4 rounded-xl font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={16} /> Batal
                    </button>
                 </div>
              )}
           </div>

           <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200">
              <h4 className="font-black uppercase tracking-widest text-[10px] mb-4 opacity-60 italic">Tips Guru Admin</h4>
              <p className="text-xs font-medium leading-[1.8] opacity-90">
                 Gunakan bahasa yang inspiratif and formal. Bapak bisa menceritakan kapan sekolah ini berdiri, siapa pendirinya, and bagaimana perjalanannya sampai menjadi sekolah hebat seperti sekarang.
              </p>
           </div>
        </div>
      </div>
    </div>
  </>
  )
}



