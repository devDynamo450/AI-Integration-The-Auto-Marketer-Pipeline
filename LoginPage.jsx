import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) { toast.success('Welcome back! 👋'); navigate('/dashboard') }
    else toast.error(result.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>
            <GraduationCap size={26} className="text-white"/>
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to your EduDiscover account</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4 border border-white/8">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                placeholder="you@example.com" className="input-field pl-10"/>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type={showPwd?'text':'password'} required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                placeholder="Your password" className="input-field pl-10 pr-10"/>
              <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
          </div>
          <div className="pt-1 text-xs text-slate-500">
            Demo: <span className="text-primary-400">admin@edudiscover.com</span> / <span className="text-primary-400">admin123</span>
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 mt-2">
            {isLoading?<><Loader2 size={16} className="animate-spin"/>Signing In…</>:'Sign In'}
          </button>
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:underline font-medium">Create one free</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
