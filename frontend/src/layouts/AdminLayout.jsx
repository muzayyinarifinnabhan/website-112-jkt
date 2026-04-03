import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Newspaper, Image as ImageIcon, Menu, X, Settings, Users, 
  ChevronDown, Home, School, BookOpen, GraduationCap, Info, FileText, Bell, Calendar, Phone, Clock
} from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { supabase } from '../lib/supabase'

export default function AdminLayout() {
  const { isSidebarOpen, toggleSidebar } = useUIStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [openGroups, setOpenGroups] = useState(['Dashboard'])
  const [userEmail, setUserEmail] = useState('Admin')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName) 
        : [...prev, groupName]
    )
  }

  const menuGroups = [
    {
      name: 'Main',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      name: 'Beranda',
      icon: Home,
      items: [
        { name: 'Slider Hero', path: '/admin/home/slider' },
        { name: 'Menu Unggulan', path: '/admin/home/features' },
        { name: 'Mengapa Memilih', path: '/admin/home/why-us' },
        { name: 'Statistik', path: '/admin/home/stats' },
      ]
    },
    {
      name: 'Profil Sekolah',
      icon: School,
      items: [
        { name: 'Identitas Sekolah', path: '/admin/profil/identitas' },
        { name: 'Sejarah Sekolah', path: '/admin/profil/history' },
        { name: 'Visi & Misi', path: '/admin/profil/vision-mission' },
        { name: 'Akreditasi', path: '/admin/profil/akreditasi' },
        { name: 'Fasilitas', path: '/admin/profil/facilities' },
        { name: 'Sambutan Kepala', path: '/admin/profil/sambutan' },
        { name: 'Guru & Staff', path: '/admin/profil/staff' },
      ]
    },
    {
      name: 'Kesiswaan',
      icon: GraduationCap,
      items: [
        { name: 'Ekstrakurikuler', path: '/admin/kesiswaan/ekskul' },
        { name: 'Prestasi', path: '/admin/kesiswaan/prestasi' },
        { name: 'OSIS & MPK', path: '/admin/kesiswaan/osis' },
        { name: 'Kegiatan Siswa', path: '/admin/kesiswaan/kegiatan' },
      ]
    },
    {
      name: 'Informasi',
      icon: Info,
      items: [
        { name: 'Pengumuman', path: '/admin/informasi/pengumuman', icon: Bell },
        { name: 'Berita', path: '/admin/informasi/berita', icon: Newspaper },
        { name: 'Galeri', path: '/admin/informasi/galeri', icon: ImageIcon },
        { name: 'Kontak', path: '/admin/informasi/kontak', icon: Phone },
        { name: 'Agenda', path: '/admin/informasi/agenda', icon: Clock },
        { name: 'Kurikulum', path: '/admin/informasi/kurikulum' },
        { name: 'Sistem CBT', path: '/admin/informasi/cbt' },
        { name: 'KJP / PIP', path: '/admin/informasi/kjp' },
      ]
    },
    {
      name: 'PPDB / Mutasi',
      icon: FileText,
      items: [
        { name: 'Jadwal & Persyaratan', path: '/admin/spmb' },
      ]
    },
    {
      name: 'Sistem',
      items: [
        { name: 'Pengguna', path: '/admin/users', icon: Users },
        { name: 'Pengaturan', path: '/admin/settings', icon: Settings },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 shadow-2xl transition-all duration-500 flex flex-col fixed h-full z-40 overflow-hidden`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center justify-center border-b border-slate-800 bg-slate-950/50 backdrop-blur-md">
          {isSidebarOpen ? (
            <div className="flex flex-col items-center">
               <span className="text-xl font-black text-white tracking-tighter uppercase">Admin Panel</span>
               <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">Control Center</span>
            </div>
          ) : (
            <span className="text-2xl font-black text-blue-500 uppercase">AP</span>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide">
          <div className="px-4 space-y-6">
            {menuGroups.map((group) => (
              <div key={group.name} className="space-y-1">
                {group.icon ? (
                  // Group with Sub-items
                  <>
                    <button 
                      onClick={() => isSidebarOpen && toggleGroup(group.name)}
                      className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group
                        ${openGroups.includes(group.name) ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}
                    >
                      <group.icon className={`h-5 w-5 ${openGroups.includes(group.name) ? 'text-blue-400' : 'text-slate-400'} group-hover:text-blue-300 transition-colors`} />
                      {isSidebarOpen && (
                        <>
                          <span className={`ml-3 font-bold text-sm ${openGroups.includes(group.name) ? 'text-white' : 'text-slate-400'}`}>
                            {group.name}
                          </span>
                          <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-300 ${openGroups.includes(group.name) ? 'rotate-180 text-blue-400' : 'text-slate-500'}`} />
                        </>
                      )}
                    </button>
                    
                    {isSidebarOpen && openGroups.includes(group.name) && (
                      <ul className="mt-1 ml-4 border-l border-slate-700 pl-4 space-y-1 animate-slide-down">
                        {group.items.map((item) => {
                          const isActive = location.pathname === item.path
                          return (
                            <li key={item.path}>
                              <Link
                                to={item.path}
                                className={`block py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-300
                                  ${isActive 
                                    ? 'text-blue-400 bg-blue-400/10' 
                                    : 'text-slate-500 hover:text-slate-200 hover:translate-x-1'}`}
                              >
                                {item.name}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  // Simple Items (Dashboard, Users, etc)
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={`flex items-center p-3 rounded-xl transition-all duration-300 group
                              ${isActive 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'}`}
                          >
                            <item.icon className={`h-5 w-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                            {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Profile Info at Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-white text-xs font-black uppercase tracking-tight truncate max-w-[120px]">{userEmail}</span>
                  <span className="text-slate-500 text-[10px] font-bold">Administrator</span>
                </div>
              )}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-500 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <header className="h-20 bg-white shadow-sm flex items-center px-8 sticky top-0 z-30 border-b border-gray-100">
          <button 
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-all border border-gray-100 shadow-sm"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="ml-6">
             <h2 className="text-lg font-black text-gray-800 tracking-tight">
               {menuGroups.flatMap(g => g.items).find(i => i.path === location.pathname)?.name || 'Dashboard'}
             </h2>
          </div>

          <div className="ml-auto flex items-center space-x-6">
            <div className="flex flex-col items-end mr-2">
               <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">SMP Negeri 112 Jakarta</span>
               <span className="text-[10px] font-bold text-green-500">System Online</span>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <button 
              onClick={handleLogout}
              className="text-xs font-black px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-red-600 transition-colors uppercase tracking-widest shadow-lg"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-x-hidden bg-[#F8FAFC]">
          <div className="animate-fade-in max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
