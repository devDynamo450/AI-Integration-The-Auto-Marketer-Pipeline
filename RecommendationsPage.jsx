import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Sparkles, GraduationCap, MapPin, DollarSign, BookOpen, Loader2, AlertCircle } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import CollegeCard from '../components/CollegeCard'

const COURSES = ['Computer Science','Electronics','Mechanical','Civil','MBA','MBBS','Law','Design','Architecture','Data Science','AI & ML']
const STATES = ['Delhi','Maharashtra','Tamil Nadu','Karnataka','Uttar Pradesh','Rajasthan','West Bengal','Gujarat']

export default function RecommendationsPage() {
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    percentage12th: user?.academicProfile?.percentage12th || 75,
    budgetMax: user?.academicProfile?.budgetMax || 500000,
    preferredCourses: user?.academicProfile?.preferredCourses || [],
    preferredStates: user?.academicProfile?.preferredStates || [],
    preferredCollegeType: 'Any',
    jeeRank: '',
  })
  const [results, setResults] = useState(null)

  const mutation = useMutation({
    mutationFn: (data) => api.post('/recommendations', data).then(r => r.data),
    onSuccess: (data) => setResults(data.data),
  })

  const toggleCourse = (c) => setForm(f => ({ ...f, preferredCourses: f.preferredCourses.includes(c) ? f.preferredCourses.filter(x=>x!==c) : [...f.preferredCourses, c] }))
  const toggleState = (s) => setForm(f => ({ ...f, preferredStates: f.preferredStates.includes(s) ? f.preferredStates.filter(x=>x!==s) : [...f.preferredStates, s] }))

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({ ...form, jeeRank: form.jeeRank ? Number(form.jeeRank) : null })
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 max-w-6xl mx-auto pb-16">
      <div className="py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600/30 to-violet-600/30 flex items-center justify-center">
            <Sparkles size={20} className="text-primary-400" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white">AI Smart Match</h1>
        </div>
        <p className="text-slate-400 text-sm">Enter your profile and our ML model will rank colleges by compatibility</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2"><GraduationCap size={15} className="text-primary-400"/>Academic Profile</h2>
            
            <div>
              <label className="block text-xs text-slate-400 mb-2">12th Percentage: <span className="text-primary-400 font-semibold">{form.percentage12th}%</span></label>
              <input type="range" min={40} max={100} step={1} value={form.percentage12th}
                onChange={e=>setForm(f=>({...f,percentage12th:Number(e.target.value)}))}
                className="range-slider" />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>40%</span><span>100%</span></div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">JEE Rank (optional)</label>
              <input type="number" placeholder="e.g. 5000" value={form.jeeRank}
                onChange={e=>setForm(f=>({...f,jeeRank:e.target.value}))}
                className="input-field py-2 text-sm" />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Annual Budget: <span className="text-emerald-400 font-semibold">₹{(form.budgetMax/100000).toFixed(1)}L</span></label>
              <input type="range" min={50000} max={2000000} step={50000} value={form.budgetMax}
                onChange={e=>setForm(f=>({...f,budgetMax:Number(e.target.value)}))}
                className="range-slider" />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>₹0.5L</span><span>₹20L</span></div>
            </div>
          </div>

          <div className="glass-card p-5 space-y-3">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2"><BookOpen size={15} className="text-emerald-400"/>Preferred Courses</h2>
            <div className="flex flex-wrap gap-1.5">
              {COURSES.map(c=>(
                <button key={c} type="button" onClick={()=>toggleCourse(c)}
                  className={`badge transition-all ${form.preferredCourses.includes(c)?'badge-primary':'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 space-y-3">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2"><MapPin size={15} className="text-blue-400"/>Preferred States</h2>
            <div className="flex flex-wrap gap-1.5">
              {STATES.map(s=>(
                <button key={s} type="button" onClick={()=>toggleState(s)}
                  className={`badge transition-all ${form.preferredStates.includes(s)?'bg-blue-500/20 text-blue-300 border border-blue-500/30':'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2 mb-3"><DollarSign size={15} className="text-amber-400"/>College Type</h2>
            <select value={form.preferredCollegeType} onChange={e=>setForm(f=>({...f,preferredCollegeType:e.target.value}))} className="input-field py-2 text-sm">
              <option value="Any">Any Type</option>
              <option value="Government">Government Only</option>
              <option value="Private">Private Only</option>
              <option value="Deemed">Deemed University</option>
            </select>
          </div>

          <button type="submit" disabled={mutation.isLoading} className="btn-primary w-full justify-center py-3 text-base">
            {mutation.isLoading ? <><Loader2 size={18} className="animate-spin"/>Analyzing Profile…</> : <><Sparkles size={18}/>Get AI Recommendations</>}
          </button>

          {mutation.isError && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <AlertCircle size={15}/>{mutation.error?.response?.data?.message||'Something went wrong'}
            </div>
          )}
        </form>

        {/* Results */}
        <div className="lg:col-span-3">
          {!results && !mutation.isLoading && (
            <div className="glass-card p-16 text-center border border-dashed border-white/10">
              <Sparkles size={40} className="text-primary-400/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your AI Matches Await</h3>
              <p className="text-slate-500 text-sm">Fill in your profile and click "Get AI Recommendations" to see personalized college matches with compatibility percentages.</p>
            </div>
          )}
          {mutation.isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} className="glass-card p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="skeleton w-12 h-12 rounded-xl"/>
                    <div className="flex-1 space-y-2"><div className="skeleton h-4 rounded w-3/4"/><div className="skeleton h-3 rounded w-1/2"/></div>
                    <div className="skeleton w-16 h-16 rounded-full"/>
                  </div>
                  <div className="flex gap-2"><div className="skeleton h-5 rounded-full w-20"/><div className="skeleton h-5 rounded-full w-16"/></div>
                  <div className="grid grid-cols-3 gap-2">{[1,2,3].map(j=><div key={j} className="skeleton h-14 rounded-xl"/>)}</div>
                </div>
              ))}
            </div>
          )}
          {results && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">{results.length} Matched Colleges</h2>
                <span className="badge-primary text-xs">Sorted by Match %</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {results.map((c,i)=>(
                  <div key={c._id} className="relative">
                    {i<3&&<div className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[10px] font-bold text-white shadow">#{i+1}</div>}
                    <CollegeCard college={c} matchPercentage={c.matchPercentage} matchReasons={c.matchReasons}/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
