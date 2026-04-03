import { AlertTriangle } from 'lucide-react'

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-yellow-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-soft">
          <AlertTriangle className="text-yellow-500 w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase">
          Sedang Pemeliharaan
        </h1>
        
        <p className="text-gray-500 mb-8 font-medium leading-relaxed">
          Mohon maaf, website SMP Negeri 112 Jakarta saat ini sedang dalam perbaikan dan peningkatan sistem. Silakan kembali beberapa saat lagi.
        </p>
        
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 inline-block">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
            Pusat Informasi & Sistem IT SMPN 112 Jakarta
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce-soft { animation: bounce-soft 3s infinite; }
      `}</style>
    </div>
  )
}
