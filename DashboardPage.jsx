import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Heart, Calendar, BookOpen, TrendingUp, Sparkles, MessageCircle, MapPin, DollarSign } from 'lucide-react'
import api from '../lib/api'

const STATUS_COLORS = {
  planning:   { bg:'bg-slate-500/20', text:'text-slate-300', border:'border-slate-500/30' },
  applied:    { bg:'bg-blue-500/20',  text:'text-blue-300',  border:'border-blue-500/30' },
  accepted:   { bg:'bg-emerald-500/20',text:'text-emerald-300',border:'border-emerald-500/30'},
  rejected:   { bg:'bg-red-500/20',  text:'text-red-300',   border:'border-red-500/30' },
  waitlisted: { bg:'bg-amber-500/20', text:'text-amber-300', border:'border-amber-500/30' },
}

function QuickStatCard({ icon: Icon, label, value, color='text-primary-400', bg='bg-primary-500/10', border='border-primary-500/20' }) {
  return (
    <div className={`glass-card p-4 border ${border}`}>
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon size={16} className={color}/>
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/users/dashboard').then(r => r.data.data),
  })

  const student = data || user
  const savedColleges = data?.savedColleges || []
  const applications = data?.applicationTrack || []
  const upcoming = applications.filter(a => a.deadline && new Date(a.deadline) > new Date())
    .sort((a,b) => new Date(a.deadline)-new Date(b.deadline))

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-glow">
            {student?.name?.[0]?.toUpperCase()||'S'}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Hey, {student?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-slate-400 text-sm mt-0.5">Your college discovery dashboard</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <QuickStatCard icon={Heart} label="Saved Colleges" value={savedColleges.length} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20"/>
          <QuickStatCard icon={Calendar} label="Applications" value={applications.length} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20"/>
          <QuickStatCard icon={BookOpen} label="Upcoming Deadlines" value={upcoming.length} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20"/>
          <QuickStatCard icon={TrendingUp} label="Accepted" value={applications.filter(a=>a.status==='accepted').length} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20"/>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link to="/recommendations" className="glass-card p-5 flex items-center gap-4 border border-primary-500/20 hover:border-primary-500/40 hover:shadow-card-hover transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600/30 to-violet-600/30 flex items-center justify-center group-hover:shadow-glow transition-all">
            <Sparkles size={22} className="text-primary-400"/>
          </div>
          <div>
            <div className="font-semibold text-white mb-0.5">Run AI Match</div>
            <div className="text-xs text-slate-400">Get personalized recommendations</div>
          </div>
        </Link>
        <Link to="/chatbot" className="glass-card p-5 flex items-center gap-4 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-card-hover transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 flex items-center justify-center transition-all">
            <MessageCircle size={22} className="text-cyan-400"/>
          </div>
          <div>
            <div className="font-semibold text-white mb-0.5">Ask AI Counselor</div>
            <div className="text-xs text-slate-400">Get instant college guidance</div>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Saved Colleges */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Heart size={15} className="text-rose-400"/>Saved Colleges</h2>
            <Link to="/colleges" className="text-xs text-primary-400 hover:underline">+ Add more</Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
          ) : savedColleges.length===0 ? (
            <div className="text-center py-10">
              <Heart size={32} className="text-slate-700 mx-auto mb-3"/>
              <p className="text-slate-500 text-sm">No saved colleges yet</p>
              <Link to="/colleges" className="btn-outline mt-3 text-xs py-1.5 px-4">Browse Colleges</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {savedColleges.map(c=>(
                <Link key={c._id} to={`/colleges/${c.slug||c._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600/30 to-violet-600/30 flex items-center justify-center text-sm font-bold text-primary-300 flex-shrink-0">
                    {c.shortName?.[0]||c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate group-hover:text-primary-300 transition-colors">{c.name}</div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin size={10}/>{c.location?.city||'—'}</span>
                      {c.averageFees&&<span className="flex items-center gap-1"><DollarSign size={10}/>₹{(c.averageFees/100000).toFixed(1)}L/yr</span>}
                    </div>
                  </div>
                  <span className="badge-primary text-[10px] flex-shrink-0">{c.type}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4"><Calendar size={15} className="text-amber-400"/>Deadlines</h2>
          {upcoming.length===0 ? (
            <div className="text-center py-8">
              <Calendar size={28} className="text-slate-700 mx-auto mb-2"/>
              <p className="text-slate-500 text-sm">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0,5).map(app=>{
                const sc = STATUS_COLORS[app.status]||STATUS_COLORS.planning
                const days = Math.ceil((new Date(app.deadline)-new Date())/(1000*60*60*24))
                return (
                  <div key={app._id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-sm font-medium text-white truncate">{app.college?.name||'Unknown College'}</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`badge ${sc.bg} ${sc.text} border ${sc.border} text-[10px]`}>{app.status}</span>
                      <span className={`text-xs font-medium ${days<=7?'text-red-400':days<=14?'text-amber-400':'text-slate-400'}`}>
                        {days}d left
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
