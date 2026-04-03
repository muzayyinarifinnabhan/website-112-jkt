import { useState, useEffect } from 'react'
import { Users, BookOpen, Star, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast, ToastContainer } from '../../components/Toast'

export default function Dashboard() {
  const { toasts, toast, removeToast } = useToast()
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [ppdbOpen, setPpdbOpen] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('secondary_content')
        .select('*')
        .in('slug', ['maintenance_mode', 'ppdb_status'])
      
      if (error) throw error
      
      const maintenanceData = data?.find(item => item.slug === 'maintenance_mode')
      if (maintenanceData) setMaintenanceMode(maintenanceData.content === 'true')

      const ppdbData = data?.find(item => item.slug === 'ppdb_status')
      if (ppdbData) setPpdbOpen(ppdbData.content === 'true')

    } catch (e) {
      console.error(e)
    }
  }

  const toggleMaintenance = async () => {
    const newValue = !maintenanceMode
    setMaintenanceMode(newValue)
    try {
      const { error } = await supabase.from('secondary_content').upsert({ 
        slug: 'maintenance_mode', 
        title: 'Maintenance Mode',
        content: newValue.toString() 
      })
      if (error) throw error
      toast.success(`Mode Maintenance ${newValue ? 'Diaktifkan' : 'Dimatikan'}`)
    } catch(e) {
      setMaintenanceMode(!newValue)
      toast.error('Gagal mengubah pengaturan: ' + (e.message || 'Error'))
    }
  }

  const togglePpdb = async () => {
    const newValue = !ppdbOpen
    setPpdbOpen(newValue)
    try {
      const { error } = await supabase.from('secondary_content').upsert({ 
        slug: 'ppdb_status', 
        title: 'PPDB Status',
        content: newValue.toString() 
      })
      if (error) throw error
      toast.success(`Pendaftaran PPDB ${newValue ? 'Dibuka' : 'Ditutup'}`)
    } catch(e) {
      setPpdbOpen(!newValue)
      toast.error('Gagal mengubah pengaturan: ' + (e.message || 'Error'))
    }
  }

  const stats = [
    { label: 'Total Siswa', value: '1,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Guru & Staff', value: '85', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Prestasi', value: '150+', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Total Berita', value: '42', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Selamat datang di Panel Admin SMP Negeri 112 Jakarta</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-800 leading-none">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Aktivitas Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Berita Terbaru (Draft)</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(item => (
              <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1561525140-c2a4cc68e4bd?q=80&w=100&auto=format&fit=crop" alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Juara 1 Lomba Cerdas Cermat</h4>
                    <span className="text-xs text-gray-500">Oleh Admin Humas • 2 jam yang lalu</span>
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-800 text-sm font-semibold">Edit</button>
              </div>
            ))}
          </div>
        </div>

        {/* Status Sistem */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Status Sistem</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Kapasitas Storage</span>
                <span className="text-primary-600 font-bold">45%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">45GB dari 100GB terpakai</p>
            </div>
            
            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Pengaturan Cepat</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mode Maintenance</span>
                  <button
                    onClick={toggleMaintenance}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${maintenanceMode ? 'bg-primary-500' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">Pendaftaran PPDB Buka</span>
                  <button
                    onClick={togglePpdb}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${ppdbOpen ? 'bg-primary-500' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${ppdbOpen ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
