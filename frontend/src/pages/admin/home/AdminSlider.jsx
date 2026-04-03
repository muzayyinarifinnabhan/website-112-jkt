import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
import { uploadImage } from '../../../lib/storage'

export default function AdminSlider() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchSliders()
  }, [])

  async function fetchSliders() {
    try {
      const { data, error } = await supabase
        .from('sliders')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      setSliders(data || [])
    } catch (error) {
      console.error('Error fetching sliders:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (slider) => {
    setEditingId(slider.id)
    setEditForm(slider)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const publicUrl = await uploadImage(file);
      setEditForm({ ...editForm, image_url: publicUrl });
    } catch (error) {
      toast.error('Gagal mengunggah gambar: ' + error.message + '\nPastikan bucket "website" sudah dibuat and diatur publik di Supabase Bapak.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('sliders')
        .upsert(editForm)
      
      if (error) throw error
      setEditingId(null)
      fetchSliders()
    } catch (error) {
      toast.error('Error saving: ' + error.message)
    }
  }

  if (loading) return <div className="p-8 text-center font-bold text-gray-400 uppercase tracking-widest">Loading...</div>

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog {...confirmState} />
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Slider Hero</h1>
          <p className="text-gray-500 font-medium">Kelola banner besar yang muncul di bagian atas halaman beranda.</p>
        </div>
        {!editingId && (
          <button 
            onClick={() => handleEdit({ id: 'new', title: '', subtitle: '', image_url: '', order_index: sliders.length, is_active: true })}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
          >
            <Plus size={18} /> Tambah Slider
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Form for New Item */}
        {editingId === 'new' && (
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-blue-500 shadow-2xl scale-[1.01]">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={20} /></div>
               <h3 className="font-black text-xl uppercase italic">Slider Baru</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Judul Hero (Banner)</label>
                    <input 
                      type="text" 
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sub-judul / Deskripsi Pendek</label>
                    <input 
                      type="text" 
                      value={editForm.subtitle}
                      onChange={(e) => setEditForm({...editForm, subtitle: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pilih Gambar dari Komputer</label>
                    <div className="relative">
                       <input 
                         type="file" 
                         accept="image/*"
                         onChange={handleImageUpload}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       />
                       <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center gap-3 text-gray-400 group-hover:border-blue-200 transition-colors">
                          {uploading ? (
                            <Loader2 className="animate-spin text-blue-600" size={24} />
                          ) : (
                            <Upload size={24} />
                          )}
                          <span className="text-xs font-bold uppercase tracking-widest">
                            {uploading ? 'Mengunggah...' : 'Klik untuk Unggah Gambar'}
                          </span>
                       </div>
                    </div>
                    {editForm.image_url && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center gap-2 overflow-hidden">
                           <ImageIcon size={14} className="text-blue-600 flex-shrink-0" />
                           <p className="text-[10px] font-bold text-blue-600 truncate">{editForm.image_url}</p>
                        </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-6">
                    <button 
                      onClick={async () => {
                        const dataToSave = { ...editForm };
                        delete dataToSave.id;
                        const { error } = await supabase.from('sliders').insert(dataToSave);
                        if(error) toast.error(error.message);
                        else { setEditingId(null); fetchSliders(); }
                      }}
                      className="flex-1 bg-green-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg"
                    >
                      <Save size={16} /> Tambah Sekarang
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="bg-gray-100 text-gray-400 p-4 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
            </div>
          </div>
        )}

        {sliders.map((slider) => (
          <div 
            key={slider.id} 
            className={`bg-white rounded-[2.5rem] overflow-hidden border-2 transition-all ${editingId === slider.id ? 'border-blue-500 shadow-2xl' : 'border-gray-100 shadow-xl'}`}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Image Preview / Input */}
              <div className="lg:w-1/3 h-56 lg:h-auto relative bg-slate-100 flex items-center justify-center overflow-hidden">
                {slider.image_url || editForm.image_url ? (
                  <img 
                    src={editingId === slider.id ? editForm.image_url : slider.image_url} 
                    alt="Slider Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImageIcon size={48} />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                   <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md ${slider.is_active ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                      {slider.is_active ? 'Active' : 'Inactive'}
                   </div>
                </div>
              </div>

              {/* Content / Form */}
              <div className="flex-1 p-8 md:p-10">
                {editingId === slider.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Judul Hero (Banner)</label>
                      <input 
                        type="text" 
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sub-judul / Deskripsi Pendek</label>
                      <input 
                        type="text" 
                        value={editForm.subtitle}
                        onChange={(e) => setEditForm({...editForm, subtitle: e.target.value})}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pilih Gambar dari Komputer</label>
                      <div className="relative">
                         <input 
                           type="file" 
                           accept="image/*"
                           onChange={handleImageUpload}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         />
                         <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center gap-3 text-gray-400 hover:border-blue-200 transition-colors">
                            {uploading ? (
                              <Loader2 className="animate-spin text-blue-600" size={24} />
                            ) : (
                              <Upload size={24} />
                            )}
                            <span className="text-xs font-bold uppercase tracking-widest">
                              {uploading ? 'Mengunggah...' : 'Ubah Gambar (Klik di sini)'}
                            </span>
                         </div>
                      </div>
                      {editForm.image_url && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center gap-2 overflow-hidden">
                             <ImageIcon size={14} className="text-blue-600 flex-shrink-0" />
                             <p className="text-[10px] font-bold text-blue-600 truncate">{editForm.image_url}</p>
                          </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editForm.is_active}
                            onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-xs font-bold text-gray-600 uppercase">Aktifkan Slider</span>
                       </label>
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Urutan:</label>
                          <input 
                            type="number" 
                            value={editForm.order_index}
                            onChange={(e) => setEditForm({...editForm, order_index: parseInt(e.target.value)})}
                            className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 w-16 text-center font-bold text-xs"
                          />
                       </div>
                    </div>

                    <div className="flex gap-2 pt-6">
                      <button 
                        onClick={handleSave}
                        className="flex-1 bg-green-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg"
                      >
                        <Save size={16} /> Simpan Perubahan
                      </button>
                      <button 
                        onClick={handleCancel}
                        className="bg-gray-100 text-gray-400 p-4 rounded-xl hover:bg-gray-200 transition-all"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                         <h3 className="text-2xl font-black text-gray-900 leading-tight">{slider.title}</h3>
                         <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xl">{slider.subtitle}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(slider)}
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          onClick={async () => {
                            if((await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) {
                              await supabase.from('sliders').delete().eq('id', slider.id)
                              fetchSliders()
                            }
                          }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center gap-4 text-gray-400">
                       <div className="text-[10px] font-bold uppercase tracking-[0.2em] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                         ORDER: #{slider.order_index}
                       </div>
                       <div className="text-[10px] font-bold uppercase tracking-[0.2em] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                         SOURCE: {slider.image_url ? 'CUSTOM URL' : 'EMPTY'}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
  )
}





