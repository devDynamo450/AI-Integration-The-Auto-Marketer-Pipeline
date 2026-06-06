import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(form.name, form.email, form.password)
    if (result.success) { toast.success('Welcome to EduDiscover! 🎓'); navigate('/recommendations') }
    else toast.error(result.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>
            <GraduationCap size={26} className="text-white"/>
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm">Start your unbiased college discovery journey</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4 border border-white/8">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type="text" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                placeholder="Rahul Sharma" className="input-field pl-10"/>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                placeholder="rahul@example.com" className="input-field pl-10"/>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type={showPwd?'text':'password'} required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                placeholder="Min. 6 characters" className="input-field pl-10 pr-10"/>
              <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 mt-2">
            {isLoading?<><Loader2 size={16} className="animate-spin"/>Creating Account…</>:'Create Free Account'}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:underline font-medium">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
