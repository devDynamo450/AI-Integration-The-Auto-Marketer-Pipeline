import { Link } from 'react-router-dom'
import { MapPin, Trophy, DollarSign, BookOpen, Heart, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'

// ─── AI Match Percentage Gauge (SVG) ─────────────────────────────────────────
function MatchGauge({ percentage, size = 72 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getColor = (pct) => {
    if (pct >= 80) return '#10b981'    // green
    if (pct >= 60) return '#6366f1'    // indigo
    if (pct >= 40) return '#f59e0b'    // amber
    return '#f87171'                    // red
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6"
        />
        {/* Fill */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="match-ring"
          style={{ filter: `drop-shadow(0 0 6px ${getColor(percentage)}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-white leading-none">{percentage}%</span>
        <span className="text-[9px] text-slate-500 leading-none mt-0.5">match</span>
      </div>
    </div>
  )
}

// ─── Tier Badge ───────────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  const classes = {
    'Tier 1': 'badge-tier1',
    'Tier 2': 'badge-tier2',
    'Tier 3': 'badge-tier3',
  }
  return <span className={classes[tier] || 'badge-tier3'}>{tier || 'Tier 3'}</span>
}

// ─── Type Badge ───────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const gov = ['IIT', 'NIT', 'IIIT', 'Central University', 'State University']
  const isGov = gov.includes(type)
  return (
    <span className={`badge ${isGov ? 'badge-success' : 'badge-primary'}`}>{type}</span>
  )
}

// ─── Main College Card ────────────────────────────────────────────────────────
export default function CollegeCard({ college, matchPercentage, matchReasons }) {
  const { isAuthenticated, user, toggleSaveCollege } = useAuthStore()
  const [saved, setSaved] = useState(() => {
    if (!user) return false
    const ids = user.savedColleges?.map(c => typeof c === 'object' ? c._id : c) || []
    return ids.includes(college._id)
  })
  const [saving, setSaving] = useState(false)

  const latestPlacement = college.placementData?.[college.placementData.length - 1]

  const handleSave = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to save colleges')
      return
    }
    setSaving(true)
    try {
      const newSaved = await toggleSaveCollege(college._id)
      setSaved(newSaved)
      toast.success(newSaved ? 'College saved!' : 'Removed from saved')
    } catch {
      toast.error('Failed to save college')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Link to={`/colleges/${college.slug || college._id}`} className="block">
      <div className="college-card group animate-slide-up">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* College Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600/30 to-violet-600/30 
                            border border-primary-500/20 flex items-center justify-center flex-shrink-0 text-xl font-bold text-primary-300">
              {college.shortName ? college.shortName[0] : college.name[0]}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm leading-tight truncate group-hover:text-primary-300 transition-colors">
                {college.name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} className="text-slate-500 flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate">
                  {college.location?.city}, {college.location?.state}
                </span>
              </div>
            </div>
          </div>

          {/* Match Gauge or Save Button */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {matchPercentage != null && <MatchGauge percentage={matchPercentage} size={68} />}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                saved ? 'text-rose-400 bg-rose-500/10' : 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Type & Tier Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <TypeBadge type={college.type} />
          <TierBadge tier={college.tier} />
          {college.accreditation && (
            <span className="badge bg-purple-500/15 text-purple-300 border border-purple-500/20">
              {college.accreditation}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white/[0.03] rounded-xl p-2.5 text-center border border-white/5">
            <DollarSign size={12} className="text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-semibold text-white">
              ₹{college.averageFees ? `${(college.averageFees / 100000).toFixed(1)}L` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-600">per year</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-2.5 text-center border border-white/5">
            <TrendingUp size={12} className="text-blue-400 mx-auto mb-1" />
            <div className="text-xs font-semibold text-white">
              {latestPlacement?.placementRate ? `${latestPlacement.placementRate}%` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-600">placed</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-2.5 text-center border border-white/5">
            <Trophy size={12} className="text-amber-400 mx-auto mb-1" />
            <div className="text-xs font-semibold text-white">
              {college.rankings?.nirf ? `#${college.rankings.nirf}` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-600">NIRF</div>
          </div>
        </div>

        {/* Avg Package */}
        {latestPlacement?.averagePackage && (
          <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-xs text-slate-400">Avg. Package: </span>
            <span className="text-xs font-semibold text-emerald-400">{latestPlacement.averagePackage} LPA</span>
          </div>
        )}

        {/* AI Match Reasons */}
        {matchReasons?.length > 0 && (
          <div className="space-y-1 border-t border-white/5 pt-3">
            {matchReasons.slice(0, 2).map((reason, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-primary-400 text-xs">✓</span>
                <span className="text-xs text-slate-400">{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Overall Rating */}
        {college.overallRating > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <div key={s} className={`w-2 h-2 rounded-full ${s <= Math.round(college.overallRating) ? 'bg-amber-400' : 'bg-slate-700'}`} />
              ))}
              <span className="text-xs text-slate-500 ml-1">{college.overallRating.toFixed(1)}</span>
            </div>
            {college.reviewCount > 0 && (
              <span className="text-xs text-slate-600">{college.reviewCount} reviews</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
export function CollegeCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 rounded-lg w-3/4" />
          <div className="skeleton h-3 rounded w-1/2" />
        </div>
        <div className="skeleton w-16 h-16 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-5 rounded-full w-20" />
        <div className="skeleton h-5 rounded-full w-16" />
        <div className="skeleton h-5 rounded-full w-24" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
      <div className="skeleton h-8 rounded-lg" />
    </div>
  )
}
