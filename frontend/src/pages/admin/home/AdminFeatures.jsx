import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, Building2, Megaphone, Trophy, Camera, LayoutGrid } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'

const ICON_OPTIONS = [
  { name: 'Building2', icon: Building2 },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Trophy', icon: Trophy },
  { name: 'Camera', icon: Camera },
  { name: 'LayoutGrid', icon: LayoutGrid },
]

export default function AdminFeatures() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchFeatures()
  }, [])

  async function fetchFeatures() {
    try {
      const { data, error } = await supabase
        .from('featured_menus')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      setFeatures(data || [])
    } catch (error) {
      console.error('Error fetching features:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (feature) => {
    setEditingId(feature.id)
    setEditForm(feature)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('featured_menus')
        .upsert(editForm)
      
      if (error) throw error
      setEditingId(null)
      fetchFeatures()
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Menu Unggulan</h1>
          <p className="text-gray-500 font-medium">Kelola 4 kotak menu yang muncul di bawah slider beranda.</p>
        </div>
        {!editingId && (
          <button 
            onClick={() => handleEdit({ id: 'new', title: '', description: '', icon_name: 'Building2', color: 'text-blue-600', path: '/', order_index: features.length })}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
          >
            <Plus size={18} /> Tambah Menu
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form for New Item */}
        {editingId === 'new' && (
          <div className="bg-white rounded-3xl p-8 border-2 border-blue-500 shadow-2xl scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={20} /></div>
               <h3 className="font-black text-xl uppercase italic">Menu Baru</h3>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Judul Menu</label>
                    <input 
                      type="text" 
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Path / Link</label>
                    <input 
                      type="text" 
                      value={editForm.path}
                      onChange={(e) => setEditForm({...editForm, path: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deskripsi Singkat</label>
                  <textarea 
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Warna Text (Tailwind)</label>
                    <input 
                      type="text" 
                      value={editForm.color}
                      onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                      placeholder="e.g. text-blue-600"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pilih Icon</label>
                    <select 
                      value={editForm.icon_name}
                      onChange={(e) => setEditForm({...editForm, icon_name: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    >
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt.name} value={opt.name}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={async () => {
                      const dataToSave = { ...editForm };
                      delete dataToSave.id; // remove 'new' id
                      const { error } = await supabase.from('featured_menus').insert(dataToSave);
                      if(error) toast.error(error.message);
                      else { setEditingId(null); fetchFeatures(); }
                    }}
                    className="flex-1 bg-green-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                  >
                    <Save size={16} /> Tambah Sekarang
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-400 p-3 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
            </div>
          </div>
        )}

        {features.map((feature) => (
          <div 
            key={feature.id} 
            className={`bg-white rounded-3xl p-8 border-2 transition-all ${editingId === feature.id ? 'border-blue-500 shadow-2xl' : 'border-gray-100 shadow-xl'}`}
          >
            {editingId === feature.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Judul Menu</label>
                    <input 
                      type="text" 
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Path / Link</label>
                    <input 
                      type="text" 
                      value={editForm.path}
                      onChange={(e) => setEditForm({...editForm, path: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deskripsi Singkat</label>
                  <textarea 
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Warna Text (Tailwind)</label>
                    <input 
                      type="text" 
                      value={editForm.color}
                      onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                      placeholder="e.g. text-blue-600"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pilih Icon</label>
                    <select 
                      value={editForm.icon_name}
                      onChange={(e) => setEditForm({...editForm, icon_name: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    >
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt.name} value={opt.name}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-green-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                  >
                    <Save size={16} /> Simpan
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-400 p-3 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl bg-gray-50 ${feature.color}`}>
                    {(() => {
                      const IconComp = ICON_OPTIONS.find(o => o.name === feature.icon_name)?.icon || LayoutGrid
                      return <IconComp size={32} />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">{feature.path}</p>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm">{feature.description}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleEdit(feature)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    onClick={async () => {
                      if((await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) {
                        await supabase.from('featured_menus').delete().eq('id', feature.id)
                        fetchFeatures()
                      }
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </>
  )
}





