import { useState, useEffect } from 'react'
import { Download, Loader2, Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function SPMB() {
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [requirements, setRequirements] = useState([])
  const [secondary, setSecondary] = useState({
    title: 'Penerimaan Siswa Baru',
    content: 'Informasi lengkap terkait pendaftaran PPDB dan Mutasi Siswa.',
    image_url: '',
    file_url: ''
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchSPMBData()
  }, [])

  async function fetchSPMBData() {
    try {
      setLoading(true)
      
      const { data: schData } = await supabase.from('spmb_schedules').select('*').order('order_index')
      setSchedules(schData || [])
      
      const { data: reqData } = await supabase.from('spmb_requirements').select('*').order('category, order_index')
      setRequirements(reqData || [])
      
      const { data: secData } = await supabase.from('secondary_content').select('*').eq('slug', 'spmb').single()
      if (secData) {
        setSecondary({
          title: secData.title || 'Penerimaan Siswa Baru',
          content: secData.content || '',
          image_url: secData.image_url || '',
          file_url: secData.extra_url || ''
        })
      }
    } catch (error) {
      console.error('Error fetching SPMB:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-xs italic">Memuat Informasi PPDB...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("${secondary.image_url && secondary.image_url.trim() !== '' ? secondary.image_url : 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80'}")` 
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative text-center text-white px-4">
          <div className="mb-6 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <img src="/logo.png" alt="Logo SMPN 112" className="h-14 w-14 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-xl uppercase text-white">
            {secondary.title}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow-lg max-w-3xl mx-auto italic">
            {secondary.content}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-16 max-w-5xl">
        <div className="space-y-24">
          
          {/* Berkas yang Harus Dibawa Section */}
          <section className="rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-blue-600 pt-6">
              <div className="bg-slate-50 rounded-t-[3rem] py-8 px-10">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center tracking-tight">Berkas yang Harus Dibawa</h2>
              </div>
            </div>
            <div className="bg-white p-10 md:p-14 pt-0 md:pt-0">
               <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-widest text-xs border-b pb-2">Dokumen Wajib</h3>
                  <ul className="space-y-4 text-gray-600 font-medium list-disc list-inside text-sm leading-relaxed italic">
                    {requirements.filter(r => r.category === 'document').map((item) => (
                      <li key={item.id}>{item.content}</li>
                    ))}
                    {requirements.filter(r => r.category === 'document').length === 0 && (
                      <li className="text-gray-400 italic">Daftar berkas belum tersedia.</li>
                    )}
                  </ul>
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                  <p className="text-xs text-orange-800 font-bold italic leading-relaxed">
                    Catatan: Pastikan semua dokumen asli dibawa untuk verifikasi saat pendaftaran.
                  </p>
                </div>
                {secondary.file_url && (
                  <div className="flex justify-center pt-4">
                    <a 
                      href={secondary.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-orange-600 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200 group"
                    >
                        <Download className="h-4 w-4 group-hover:animate-bounce" /> Unduh Panduan SPMB
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Jadwal Kegiatan SPMB Section */}
          <section className="rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
             <div className="bg-blue-600 pt-6">
                <div className="bg-slate-50 rounded-t-[3rem] py-8 px-10">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center tracking-tight">Jadwal Kegiatan SPMB</h2>
                </div>
             </div>
             <div className="bg-white overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50/50 border-b border-gray-100">
                       <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic">Tanggal</th>
                       <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic">Kegiatan</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {schedules.map((item) => (
                       <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                         <td className="px-10 py-6 text-sm font-bold text-gray-600 italic">{item.date_range}</td>
                         <td className="px-10 py-6 text-sm font-medium text-gray-700 italic">{item.activity}</td>
                       </tr>
                     ))}
                     {schedules.length === 0 && (
                       <tr>
                         <td colSpan={2} className="px-10 py-10 text-center text-gray-400 italic text-sm">Belum ada jadwal kegiatan saat ini.</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
             <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                <p className="text-xs text-gray-400 italic font-bold">
                  Jadwal dapat berubah sewaktu-waktu. Pantau terus pengumuman di situs resmi sekolah.
                </p>
             </div>
          </section>

          {/* Persyaratan Mutasi Section - Unified */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Mutasi Masuk */}
            <section className="rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
               <div className="bg-blue-600 pt-6">
                  <div className="bg-blue-50 rounded-t-[3rem] py-8 px-10">
                    <h2 className="text-2xl md:text-3xl font-black text-blue-900 text-center tracking-tight">Mutasi Masuk</h2>
                  </div>
               </div>
               <div className="bg-white overflow-hidden p-8">
                  <ul className="space-y-4">
                    {requirements.filter(r => r.category === 'mutasi_in').map((item, idx) => (
                      <li key={item.id} className="flex gap-4 items-start italic">
                        <span className="font-black text-blue-300 w-6">{idx + 1}.</span>
                        <span className="text-sm font-medium text-gray-700">{item.content}</span>
                      </li>
                    ))}
                    {requirements.filter(r => r.category === 'mutasi_in').length === 0 && (
                      <li className="text-gray-400 italic text-center py-4">Belum ada persyaratan.</li>
                    )}
                  </ul>
               </div>
            </section>

            {/* Mutasi Keluar */}
            <section className="rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
               <div className="bg-blue-600 pt-6">
                  <div className="bg-emerald-50 rounded-t-[3rem] py-8 px-10">
                    <h2 className="text-2xl md:text-3xl font-black text-emerald-900 text-center tracking-tight">Mutasi Keluar</h2>
                  </div>
               </div>
               <div className="bg-white overflow-hidden p-8">
                  <ul className="space-y-4">
                    {requirements.filter(r => r.category === 'mutasi_out').map((item, idx) => (
                      <li key={item.id} className="flex gap-4 items-start italic">
                        <span className="font-black text-emerald-300 w-6">{idx + 1}.</span>
                        <span className="text-sm font-medium text-gray-700">{item.content}</span>
                      </li>
                    ))}
                    {requirements.filter(r => r.category === 'mutasi_out').length === 0 && (
                      <li className="text-gray-400 italic text-center py-4">Belum ada persyaratan.</li>
                    )}
                  </ul>
               </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  )
}
