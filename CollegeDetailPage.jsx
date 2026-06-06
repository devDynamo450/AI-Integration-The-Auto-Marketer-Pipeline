import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Globe, Trophy, TrendingUp, Users, Star, DollarSign, BookOpen, ArrowLeft, CheckCircle, Zap } from 'lucide-react'
import api from '../lib/api'

function Stat({ icon: Icon, label, value, color='text-primary-400' }) {
  return (
    <div className="glass-card p-4 text-center">
      <Icon size={18} className={`${color} mx-auto mb-2`} />
      <div className="text-lg font-bold text-white">{value||'N/A'}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s=>(
        <div key={s} className={`w-3 h-3 rounded-sm ${s<=Math.round(value)? 'bg-amber-400':'bg-slate-700'}`}/>
      ))}
      <span className="text-xs text-slate-400 ml-1">{value?.toFixed(1)}</span>
    </div>
  )
}

export default function CollegeDetailPage() {
  const { slugOrId } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['college', slugOrId],
    queryFn: () => api.get(`/colleges/${slugOrId}`).then(r=>r.data.data),
  })
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', slugOrId],
    queryFn: () => api.get(`/reviews/college/${data?._id}?limit=5`).then(r=>r.data),
    enabled: !!data?._id,
  })

  if (isLoading) return (
    <div className="min-h-screen pt-24 px-4 max-w-5xl mx-auto">
      <div className="skeleton h-48 rounded-2xl mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-6">{[1,2,3,4].map(i=><div key={i} className="skeleton h-24 rounded-xl"/>)}</div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  )
  if (error||!data) return (
    <div className="min-h-screen pt-24 flex items-center justify-center text-slate-400">
      College not found. <Link to="/colleges" className="ml-2 text-primary-400 hover:underline">Go back</Link>
    </div>
  )

  const c = data
  const latestPlacements = c.placementData?.[c.placementData.length-1]

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 max-w-5xl mx-auto pb-16">
      <Link to="/colleges" className="btn-ghost mt-6 mb-4 inline-flex"><ArrowLeft size={15}/>Back to Colleges</Link>

      {/* Hero */}
      <div className="glass-card p-6 sm:p-8 mb-6 border border-primary-500/15">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600/40 to-violet-600/40 border border-primary-500/20 flex items-center justify-center text-2xl font-bold text-primary-300 flex-shrink-0">
            {c.shortName?.[0]||c.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-primary">{c.type}</span>
              <span className="badge-warning">{c.tier||'Tier 2'}</span>
              {c.accreditation&&<span className="badge bg-purple-500/15 text-purple-300 border border-purple-500/20">{c.accreditation}</span>}
              {c.isVerified&&<span className="badge-success flex items-center gap-1"><CheckCircle size={10}/>Verified</span>}
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">{c.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              {c.location?.city && <span className="flex items-center gap-1"><MapPin size={13}/>{c.location.city}, {c.location.state}</span>}
              {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-400 hover:underline"><Globe size={13}/>Website</a>}
              {c.establishedYear && <span>Est. {c.establishedYear}</span>}
            </div>
            {c.overallRating>0 && <div className="mt-3"><StarRating value={c.overallRating}/></div>}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Stat icon={DollarSign} label="Annual Fees" value={c.averageFees?`₹${(c.averageFees/100000).toFixed(1)}L`:null} color="text-emerald-400"/>
        <Stat icon={Trophy} label="NIRF Rank" value={c.rankings?.nirf?`#${c.rankings.nirf}`:null} color="text-amber-400"/>
        <Stat icon={TrendingUp} label="Avg Package" value={latestPlacements?.averagePackage?`${latestPlacements.averagePackage} LPA`:null} color="text-blue-400"/>
        <Stat icon={Users} label="Placement Rate" value={latestPlacements?.placementRate?`${latestPlacements.placementRate}%`:null} color="text-indigo-400"/>
      </div>

      {/* AI Summary */}
      {c.aiSummary && (
        <div className="glass-card p-5 mb-6 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-blue-400"/>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Summary</span>
            <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">Powered by Gemini</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{c.aiSummary}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="sm:col-span-2 space-y-6">
          {/* Courses */}
          {c.courses?.length>0 && (
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><BookOpen size={16} className="text-primary-400"/>Courses Offered</h2>
              <div className="space-y-2">
                {c.courses.map((course,i)=>(
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div>
                      <div className="text-sm font-medium text-white">{course.name}</div>
                      <div className="text-xs text-slate-500">{course.duration} years · {course.seats} seats</div>
                    </div>
                    {course.fees&&<div className="text-sm font-semibold text-emerald-400">₹{(course.fees/100000).toFixed(1)}L/yr</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placements */}
          {latestPlacements && (
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-blue-400"/>Placement Data ({latestPlacements.year})</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/15">
                  <div className="text-lg font-bold text-blue-400">{latestPlacements.averagePackage} LPA</div>
                  <div className="text-xs text-slate-500">Average Package</div>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/15">
                  <div className="text-lg font-bold text-emerald-400">{latestPlacements.highestPackage} LPA</div>
                  <div className="text-xs text-slate-500">Highest Package</div>
                </div>
                <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/15">
                  <div className="text-lg font-bold text-indigo-400">{latestPlacements.placementRate}%</div>
                  <div className="text-xs text-slate-500">Students Placed</div>
                </div>
              </div>
              {latestPlacements.topRecruiters?.length>0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-2">Top Recruiters</div>
                  <div className="flex flex-wrap gap-2">
                    {latestPlacements.topRecruiters.map(r=>(
                      <span key={r} className="badge-primary text-xs">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          <div className="glass-card p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Star size={16} className="text-amber-400"/>Student Reviews</h2>
            {reviewsData?.data?.length>0 ? (
              <div className="space-y-4">
                {reviewsData.data.map(rev=>(
                  <div key={rev._id} className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-600/30 flex items-center justify-center text-xs text-primary-300 font-bold">
                          {rev.author?.name?.[0]||'A'}
                        </div>
                        <span className="text-sm text-white font-medium">{rev.isAnonymous?'Anonymous':rev.author?.name}</span>
                        {rev.batch&&<span className="text-xs text-slate-500">Batch {rev.batch}</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {rev.sentimentLabel==='genuine'&&<span className="badge-success text-[10px]">✓ Verified Genuine</span>}
                        <StarRating value={rev.ratings?.overall}/>
                      </div>
                    </div>
                    {rev.title&&<div className="text-sm font-medium text-slate-200 mb-1">{rev.title}</div>}
                    {rev.pros&&<p className="text-xs text-emerald-400/80 mb-1">+ {rev.pros}</p>}
                    {rev.cons&&<p className="text-xs text-red-400/80">- {rev.cons}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-6">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {c.rankings&&Object.keys(c.rankings).some(k=>c.rankings[k]) && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm mb-3">Rankings</h3>
              {c.rankings.nirf&&<div className="flex justify-between py-1.5 border-b border-white/5 text-sm"><span className="text-slate-400">NIRF</span><span className="text-white font-medium">#{c.rankings.nirf}</span></div>}
              {c.rankings.qs&&<div className="flex justify-between py-1.5 border-b border-white/5 text-sm"><span className="text-slate-400">QS World</span><span className="text-white font-medium">#{c.rankings.qs}</span></div>}
              {c.rankings.outlook&&<div className="flex justify-between py-1.5 text-sm"><span className="text-slate-400">Outlook</span><span className="text-white font-medium">#{c.rankings.outlook}</span></div>}
            </div>
          )}
          {c.entranceExams?.length>0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm mb-3">Entrance Exams</h3>
              <div className="flex flex-wrap gap-2">{c.entranceExams.map(e=><span key={e} className="badge-primary">{e}</span>)}</div>
            </div>
          )}
          {c.facilities?.length>0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm mb-3">Facilities</h3>
              <div className="space-y-1.5">{c.facilities.map(f=><div key={f} className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle size={11} className="text-emerald-400"/>{f}</div>)}</div>
            </div>
          )}
          {c.approvedBy?.length>0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm mb-3">Approvals</h3>
              <div className="flex flex-wrap gap-2">{c.approvedBy.map(a=><span key={a} className="badge-success">{a}</span>)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
