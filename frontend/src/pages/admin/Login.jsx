import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        navigate('/admin', { replace: true })
      }
    } catch (error) {
      console.error('Login error:', error.message)
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Email atau password salah.')
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Email belum dikonfirmasi. Harap konfirmasi atau buat ulang akun.')
      } else {
        setErrorMsg(`Kesalahan: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative animate-fade-in overflow-hidden">

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-primary-600 rounded-b-[40px] md:rounded-b-[100px] z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mb-8">
        <div className="flex justify-center">
          {/* Logo Sekolah Container */}
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/20 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo SMPN 112 Jakarta"
              className="w-16 h-16 object-contain"
              onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Logo" }}
            />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-sm uppercase tracking-tight">
          Login Admin
        </h2>
        <p className="mt-2 text-center text-sm text-primary-100 font-medium italic">
          SMP Negeri 112 Jakarta
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-[2rem] sm:px-10 border border-gray-100">

          {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-gray-700 ml-1">Email</label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-11 h-12 sm:text-sm border-gray-200 rounded-xl bg-gray-50 transition-all outline-none"
                  placeholder="admincontoh123@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-11 pr-12 h-12 sm:text-sm border-gray-200 rounded-xl bg-gray-50 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm font-bold text-primary-600 hover:text-primary-700 cursor-pointer transition-colors">
                Lupa password?
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black uppercase tracking-widest text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'Masuk Dashboard'}
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              KELOLA WEBSITE PUBLIC SMPN 112 Jakarta DISINI. &copy; {new Date().getFullYear()}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mt-1">
              Developer : Muzayyin Arifin Nabhan
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}