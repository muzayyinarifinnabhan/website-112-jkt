import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, ChevronRight, GraduationCap, MapPin, Phone, Home, UserCircle, Newspaper, Users, Info, Image as ImageIcon, FileText, Mail, Facebook, Instagram, Youtube, BookOpen, Award, Building, MessageSquare, Zap, Trophy, Calendar, Settings, Clock, Lock, Megaphone, CreditCard } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Maintenance from '../pages/public/Maintenance'

export default function PublicLayout() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedMobileMenu, setExpandedMobileMenu] = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [contact, setContact] = useState({
    address: 'Jl. A1 Teluk Gong, RT.9/RW.10, Pejagalan, Kec. Penjaringan, Jkt Utara, DKI Jakarta 14440',
    phone: '(021) 6603001',
    whatsapp: '+62 812-3456-7890',
    email: 'smpn112jakut@gmail.com',
    opening_hours: 'Senin - Jumat: 06:30 - 15:00 WIB',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.062828551406!2d106.77964647355325!3d-6.1222416599787125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6a1df8286aadb1%3A0xe104f647c0bc3538!2sSMP%20Negeri%20112%20Jakarta!5e0!3m2!1sen!2sid!4v1711275305140!5m2!1sen!2sid',
    facebook: '#',
    instagram: '#',
    youtube: '#'
  })
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchContact()
    fetchMaintenanceStatus()
  }, [])

  async function fetchMaintenanceStatus() {
    try {
      const { data } = await supabase
        .from('secondary_content')
        .select('content')
        .eq('slug', 'maintenance_mode')
        .single()
      
      if (data && data.content === 'true') {
        setMaintenanceMode(true)
      }
    } catch (e) {
      console.log('Maintenance mode check failed or not set')
    }
  }

  async function fetchContact() {
    try {
      const { data } = await supabase
        .from('school_profile')
        .select('content')
        .eq('section_name', 'contact')
        .single()

      if (data && data.content) {
        setContact(JSON.parse(data.content))
      }
    } catch (e) {
      console.log('Using default contact info')
    }
  }

  useEffect(() => {
    setMobileMenuOpen(false) // Tembak otomatis tutup jika route berubah
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (maintenanceMode) return <Maintenance />

  const menus = [
    { name: 'Beranda', path: '/', icon: Home },
    {
      name: 'Profil',
      path: '/profil',
      icon: UserCircle,
      submenu: [
        { name: 'Tentang Sekolah', path: '/profil/tentang-sekolah', icon: BookOpen },
        { name: 'Akreditasi', path: '/profil/akreditasi', icon: Award },
        { name: 'Fasilitas', path: '/profil/fasilitas', icon: Building },
        { name: 'Sambutan Kepala Sekolah', path: '/profil/sambutan', icon: MessageSquare },
        { name: 'Guru & Tendik', path: '/profil/guru', icon: Users },
      ]
    },
    { name: 'Berita', path: '/berita', icon: Newspaper },
    {
      name: 'Kesiswaan',
      path: '/kesiswaan',
      icon: Users,
      submenu: [
        { name: 'Ekstrakurikuler', path: '/kesiswaan/ekstrakurikuler', icon: Zap },
        { name: 'Prestasi', path: '/kesiswaan/prestasi', icon: Trophy },
        { name: 'OSIS & MPK', path: '/kesiswaan/osis', icon: Users },
        { name: 'Kegiatan Siswa', path: '/kesiswaan/kegiatan-siswa', icon: Calendar },
      ]
    },
    {
      name: 'Informasi',
      path: '/informasi',
      icon: Info,
      submenu: [
        { name: 'Pengumuman', path: '/informasi/pengumuman', icon: Megaphone },
        { name: 'Kurikulum', path: '/informasi/kurikulum', icon: BookOpen },
        { name: 'CBT', path: '/informasi/cbt', icon: Settings },
        { name: 'KJP/PIP', path: '/informasi/kjp', icon: CreditCard },
        { name: 'Agenda', path: '/informasi/agenda', icon: Clock },
        { name: 'Kontak', path: '/kontak', icon: Phone },
      ]
    },
    { name: 'Galeri', path: '/galeri', icon: ImageIcon },
    { name: 'SPMB', path: '/spmb', icon: FileText },
  ]

  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      
      {/* Topbar yang Responsif */}
      <div className="bg-primary-800 text-white text-[10px] md:text-xs py-2 px-4 relative z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-3 md:gap-4">
            {/* Alamat disingkat di mobile agar muat */}
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{contact.address.split(',')[0]}</span>
              <span className="sm:hidden">Penjaringan, Jkt Utara</span>
            </span>
            <span className="flex items-center">
              <Phone className="h-3 w-3 mr-1" /> {contact.phone}
            </span>
          </div>

          {/* Ikon sosial media tetap ada atau bisa disembunyikan di layar sangat kecil */}
          <div className="flex gap-4 items-center">
            <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary-200 transition-colors">
              <Facebook className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </a>
            <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary-200 transition-colors">
              <Instagram className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </a>
            <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-primary-200 transition-colors">
              <Youtube className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </a>
          </div>
        </div>
      </div>

      <header className={`sticky top-0 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) border-b h-20 ${mobileMenuOpen ? 'z-[10000]' : 'z-50'} ${isScrolled ? 'bg-white shadow-xl border-transparent' : 'bg-white/95 backdrop-blur-md shadow-sm border-gray-100'}`}>
        <div className="container mx-auto px-4 h-full flex justify-between items-center">

          <Link 
            to="/" 
            className="flex items-center gap-3 z-50 group tracking-tight transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu origin-left will-change-transform"
            style={{ 
              transform: isScrolled ? 'scale(0.85)' : 'scale(1)',
              backfaceVisibility: 'hidden',
              WebkitFontSmoothing: 'antialiased'
            }}
          >
            <div className="flex-shrink-0 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105 transform-gpu" style={{ perspective: '1px' }}>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-12 w-auto transform-gpu" 
              />
            </div>
            <div className="flex flex-col transform-gpu" style={{ backfaceVisibility: 'hidden', perspective: '1px' }}>
              <div className="font-black tracking-tight leading-none text-primary-700 text-2xl" style={{ backfaceVisibility: 'hidden' }}>SMPN 112</div>
              <div className="font-semibold tracking-widest uppercase text-gray-500 text-xs text-nowrap" style={{ backfaceVisibility: 'hidden' }}>Jakarta</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menus.map((m) => (
              m.submenu ? (
                <div key={m.name} className="relative group">
                  <button type="button" className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 border w-full text-left cursor-default ${location.pathname.startsWith(m.path) && m.path !== '/'
                    ? 'bg-primary-50 text-primary-600 shadow-sm border-primary-100'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50 border-transparent'
                    }`}>
                    <m.icon className="w-4 h-4" />
                    {m.name}
                    <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 min-w-[280px] z-50 transform origin-top group-hover:translate-y-0 translate-y-2">
                    {m.submenu.map(sub => (
                      <Link key={sub.name} to={sub.path} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group/item">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center group-hover/item:bg-primary-600 group-hover/item:text-white transition-colors">
                          <sub.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-col">
                          <span className="block font-semibold text-gray-800 text-sm group-hover/item:text-primary-600 transition-colors">{sub.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover/item:text-primary-600 transition-colors group-hover/item:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={m.name} to={m.path} className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 border ${location.pathname === m.path
                  ? 'bg-primary-50 text-primary-600 shadow-sm border-primary-100'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50 border-transparent'
                  }`}>
                  <m.icon className="w-4 h-4" />
                  {m.name}
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:hidden relative z-[1001]">
            <button
              className={`p-2 rounded-xl border border-transparent ${mobileMenuOpen ? 'bg-primary-50 text-primary-600' : 'text-gray-800'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <div className="flex items-center justify-center">
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </div>
            </button>
          </div>
        </div>
      </header>



      <main className="flex-grow">
        <Outlet context={{ contact }} />
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-gray-400 py-16 border-t border-gray-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* School Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white p-1 rounded-md">
                <img src="/logo.png" alt="Logo SMPN 112" className="h-12 w-auto" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg leading-tight text-nowrap">SMP Negeri 112 Jakarta</h4>
                <p className="text-xs text-gray-500 font-medium">Sasadu BerPIJAR</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Sekolah yang berkomitmen memberikan pendidikan berkualitas dengan mengutamakan karakter dan prestasi siswa.
            </p>
          </div>

          {/* Profil Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8">Profil</h4>
            <ul className="space-y-4">
              {[
                { name: 'Tentang Sekolah', path: '/profil/tentang-sekolah' },
                { name: 'Akreditasi', path: '/profil/akreditasi' },
                { name: 'Fasilitas', path: '/profil/fasilitas' },
                { name: 'Sambutan Kepala Sekolah', path: '/profil/sambutan' },
                { name: 'Guru & Tendik', path: '/profil/guru' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="flex items-center gap-2 hover:text-white transition-colors group">
                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-primary-500" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8">Informasi</h4>
            <ul className="space-y-4">
              {[
                { name: 'Pengumuman', path: '/informasi/pengumuman' },
                { name: 'Ekstrakurikuler', path: '/kesiswaan/ekstrakurikuler' },
                { name: 'Prestasi', path: '/kesiswaan/prestasi' },
                { name: 'KJP/PIP', path: '/informasi/kjp' },
                { name: 'Galeri', path: '/galeri' },
                { name: 'SPMB', path: '/spmb' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="flex items-center gap-2 hover:text-white transition-colors group">
                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-primary-500" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8">Kontak Kami</h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <Building className="h-6 w-6 text-gray-500 flex-shrink-0" />
                <span className="text-sm leading-relaxed">
                  {contact.address}
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="text-sm">{contact.phone}</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-gray-500" />
                <span className="text-sm">{contact.email}</span>
              </li>
              <li className="flex gap-4 pt-2">
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors text-white">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors text-white">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors text-white">
                  <Youtube className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SMP Negeri 112 Jakarta. All rights reserved.
          </p>
        </div>
      </footer>

      <div className={`fixed inset-0 bg-white/95 backdrop-blur-2xl z-[9999] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) lg:hidden overflow-y-auto ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`flex flex-col items-center justify-start min-h-full space-y-6 text-xl font-bold p-8 pt-32 pb-12 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${mobileMenuOpen ? 'translate-y-0 opacity-100 scale-100 blur-0' : '-translate-y-4 opacity-0 scale-95 blur-sm'}`}>
          {menus.map((m) => (
            <div key={m.name} className="w-full max-w-xs group">
              {m.submenu ? (
                <div className="w-full flex flex-col">
                  <button
                    onClick={() => setExpandedMobileMenu(expandedMobileMenu === m.name ? '' : m.name)}
                    className={`flex items-center gap-3 w-full justify-between p-4 rounded-2xl transition-all ${location.pathname.startsWith(m.path) ? 'text-primary-600 bg-primary-50 shadow-sm' : 'text-gray-800 active:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <m.icon className="w-6 h-6" /> {m.name}
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedMobileMenu === m.name ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === m.name ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col gap-2 pl-4 py-2 border-l-2 border-primary-100 ml-5">
                      {m.submenu.map(sub => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 p-3 rounded-xl text-base font-semibold transition-all ${location.pathname === sub.path ? 'text-primary-600 bg-primary-50' : 'text-gray-500 active:bg-gray-50'}`}
                        >
                          <sub.icon className="w-5 h-5" /> {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  to={m.path} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${location.pathname === m.path ? 'text-primary-600 bg-primary-50 shadow-sm' : 'text-gray-800 active:bg-gray-100'}`}
                >
                  <m.icon className="w-6 h-6" /> {m.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
