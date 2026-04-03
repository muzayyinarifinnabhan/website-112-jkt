import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'

export default function AdminWhyUs() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const { data, error } = await supabase
        .from('why_us')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditForm(item)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('why_us')
        .upsert(editForm)
      
      if (error) throw error
      setEditingId(null)
      fetchItems()
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Mengapa Memilih Kami</h1>
          <p className="text-gray-500 font-medium">Kelola poin-poin keunggulan sekolah di halaman beranda.</p>
        </div>
        {!editingId && (
          <button 
            onClick={() => handleEdit({ id: 'new', title: '', description: '', order_index: items.length })}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
          >
            <Plus size={18} /> Tambah Poin
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Form for New Item */}
        {editingId === 'new' && (
          <div className="bg-white rounded-3xl p-8 border-2 border-blue-500 shadow-2xl scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={20} /></div>
               <h3 className="font-black text-xl uppercase italic">Keunggulan Baru</h3>
            </div>
            <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Judul Keunggulan</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deskripsi Penjelasan</label>
                  <textarea 
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm h-24"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      const dataToSave = { ...editForm };
                      delete dataToSave.id;
                      const { error } = await supabase.from('why_us').insert(dataToSave);
                      if(error) toast.error(error.message);
                      else { setEditingId(null); fetchItems(); }
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

        {items.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-3xl p-6 border-2 transition-all ${editingId === item.id ? 'border-blue-500 shadow-2xl scale-[1.02]' : 'border-gray-100 shadow-sm'}`}
          >
            {editingId === item.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Judul Keunggulan</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deskripsi Penjelasan</label>
                  <textarea 
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm h-24"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-green-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                  >
                    <Save size={16} /> Simpan Perubahan
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-800 leading-tight">{item.title}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    onClick={async () => {
                      if((await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) {
                        await supabase.from('why_us').delete().eq('id', item.id)
                        fetchItems()
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





