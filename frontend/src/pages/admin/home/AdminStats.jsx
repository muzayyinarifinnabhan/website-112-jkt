import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, Users, Trophy, Award, UserCircle, Star } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useToast, ToastContainer } from '../../../components/Toast'
import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'

const ICON_OPTIONS = [
  { name: 'Users', icon: Users },
  { name: 'Trophy', icon: Trophy },
  { name: 'Award', icon: Award },
  { name: 'UserCircle', icon: UserCircle },
  { name: 'Star', icon: Star },
]

export default function AdminStats() {
  const { toasts, toast, removeToast } = useToast()
  const { confirmState, showConfirm } = useConfirm()
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      setStats(data || [])
    } catch (error) {
      console.error('Error fetching statistics:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (stat) => {
    setEditingId(stat.id)
    setEditForm(stat)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('statistics')
        .upsert(editForm)
      
      if (error) throw error
      setEditingId(null)
      fetchStats()
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Statistik Sekolah</h1>
          <p className="text-gray-500 font-medium">Kelola angka statistik yang tampil di bagian bawah hero (Banner).</p>
        </div>
        {!editingId && (
          <button 
            onClick={() => handleEdit({ id: 'new', title: '', value: '', icon: 'Users', order_index: stats.length })}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
          >
            <Plus size={18} /> Tambah Statistik
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Form for New Item */}
        {editingId === 'new' && (
          <div className="bg-white rounded-[2rem] p-8 border-2 border-blue-500 shadow-2xl scale-[1.05]">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={20} /></div>
               <h3 className="font-black text-lg uppercase italic text-gray-900">Statistik Baru</h3>
            </div>
            <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Label</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nilai</label>
                  <input 
                    type="text" 
                    value={editForm.value}
                    onChange={(e) => setEditForm({...editForm, value: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pilih Icon</label>
                  <select 
                    value={editForm.icon}
                    onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.name} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={async () => {
                      const dataToSave = { ...editForm };
                      delete dataToSave.id;
                      const { error } = await supabase.from('statistics').insert(dataToSave);
                      if(error) toast.error(error.message);
                      else { setEditingId(null); fetchStats(); }
                    }}
                    className="flex-1 bg-green-600 text-white p-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-md"
                  >
                    Tambah Sekarang
                  </button>
                  <button onClick={handleCancel} className="bg-gray-100 text-gray-400 p-2 rounded-lg hover:bg-gray-200 transition-all">
                    <X size={16} />
                  </button>
                </div>
            </div>
          </div>
        )}

        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className={`bg-white rounded-[2rem] p-8 border-2 transition-all ${editingId === stat.id ? 'border-blue-500 shadow-2xl scale-[1.05]' : 'border-gray-100 shadow-xl'}`}
          >
            {editingId === stat.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Label (e.g. Total Siswa)</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nilai (e.g. 1,200+)</label>
                  <input 
                    type="text" 
                    value={editForm.value}
                    onChange={(e) => setEditForm({...editForm, value: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pilih Icon</label>
                  <select 
                    value={editForm.icon}
                    onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 rounded-lg border border-gray-100 font-bold text-xs"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.name} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-green-600 text-white p-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-md"
                  >
                    Simpan
                  </button>
                  <button onClick={handleCancel} className="bg-gray-100 text-gray-400 p-2 rounded-lg hover:bg-gray-200 transition-all">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                 <div className="p-4 rounded-full bg-blue-50 text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                    {(() => {
                      const IconComp = ICON_OPTIONS.find(o => o.name === stat.icon)?.icon || Star
                      return <IconComp size={28} />
                    })()}
                 </div>
                 <div className="text-3xl font-black text-gray-900 mb-2">{stat.value}</div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.title}</div>
                 
                 <div className="flex w-full gap-2 mt-6">
                    <button 
                      onClick={() => handleEdit(stat)}
                      className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button 
                      className="flex-1 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                      onClick={async () => {
                        if((await showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.'))) {
                          await supabase.from('statistics').delete().eq('id', stat.id)
                          fetchStats()
                        }
                      }}
                    >
                      <Trash2 size={14} /> Hapus
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





