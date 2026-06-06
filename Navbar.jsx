import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { GraduationCap, Sparkles, LayoutDashboard, MessageCircle, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navLinks = [
    { to: '/colleges', label: 'Explore' },
    { to: '/recommendations', label: 'AI Match', icon: <Sparkles size={14} />, auth: true },
    { to: '/chatbot', label: 'Counselor', icon: <MessageCircle size={14} />, auth: true },
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} />, auth: true },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-glow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg leading-none">EduDiscover</span>
              <span className="block text-xs text-slate-500 leading-none -mt-0.5">AI-Powered</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{user?.name?.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="btn-ghost text-slate-500 hover:text-red-400">
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Sign In</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/5 space-y-1 animate-fade-in">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null
              return (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to) ? 'bg-primary-500/15 text-primary-400' : 'text-slate-400 hover:text-white'
                  }`}>
                  {link.icon}{link.label}
                </Link>
              )
            })}
            <div className="pt-2 flex gap-2">
              {isAuthenticated
                ? <button onClick={handleLogout} className="btn-ghost w-full justify-center text-red-400">Sign Out</button>
                : <>
                  <Link to="/login" className="btn-outline flex-1 justify-center" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Register</Link>
                </>
              }
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
