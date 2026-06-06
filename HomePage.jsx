import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Search, Shield, TrendingUp, MessageCircle, ArrowRight, Star, Users, BookOpen, Zap } from 'lucide-react'

const STATS = [
  { icon: BookOpen, value: '10,000+', label: 'Colleges Indexed' },
  { icon: Users, value: '50,000+', label: 'Students Helped' },
  { icon: Star, value: '99.2%', label: 'Accuracy Rate' },
  { icon: Shield, value: '100%', label: 'Ad-Free' },
]

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Smart Match',
    desc: 'Input your marks, budget & preferences. Our ML model generates a personalized match percentage for every college.',
    color: 'from-indigo-500/20 to-violet-500/20',
    border: 'border-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: MessageCircle,
    title: 'AI Career Counselor',
    desc: 'Ask anything — "Best CS college in UP under ₹5L?" — and get instant, data-grounded answers from our NLP chatbot.',
    color: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Shield,
    title: 'Verified Reviews',
    desc: 'Our sentiment model flags fake promotional reviews. Only genuine student experiences are featured on each college page.',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: TrendingUp,
    title: 'Real Placement Data',
    desc: 'Actual package data, placement rates, and top recruiters — not numbers inflated by marketing departments.',
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
]

const TOP_COLLEGES = [
  { name: 'IIT Bombay', type: 'IIT', nirf: 3, avgPkg: '28 LPA', slug: 'indian-institute-of-technology-bombay' },
  { name: 'IIT Delhi', type: 'IIT', nirf: 2, avgPkg: '27.5 LPA', slug: 'indian-institute-of-technology-delhi' },
  { name: 'BITS Pilani', type: 'Deemed', nirf: 22, avgPkg: '22 LPA', slug: 'bits-pilani' },
  { name: 'NIT Trichy', type: 'NIT', nirf: 8, avgPkg: '15 LPA', slug: 'national-institute-of-technology-trichy' },
  { name: 'VIT Vellore', type: 'Private', nirf: 11, avgPkg: '8 LPA', slug: 'vit-vellore' },
  { name: 'DTU Delhi', type: 'State', nirf: 36, avgPkg: '12 LPA', slug: 'delhi-technological-university' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [heroQuery, setHeroQuery] = useState('')

  const handleHeroSearch = (e) => {
    e.preventDefault()
    if (heroQuery.trim()) {
      navigate(`/colleges?aiSearch=1&q=${encodeURIComponent(heroQuery.trim())}`)
    }
  }

  return (
    <div className="pt-16">
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-screen flex items-center px-4 sm:px-6">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-600/8 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-accent-500/5 rounded-full blur-2xl animate-float"
            style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center py-24">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/25 bg-primary-500/10 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles size={14} />
            The Unbiased AI College Discovery Platform
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-white leading-[1.1] mb-6 animate-slide-up">
            Find Your{' '}
            <span className="text-gradient">Perfect College</span>
            <br />
            <span className="text-slate-300">With AI Precision</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 animate-fade-in leading-relaxed">
            No ads. No paid rankings. Just pure, AI-powered college recommendations
            based on your actual academic profile, budget, and goals.
          </p>

          {/* Hero AI Search Bar */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto mb-8 animate-slide-up">
            <div className="glass-card p-1.5 flex gap-2 border border-primary-500/20 shadow-glow">
              <div className="flex items-center gap-2 px-2 flex-shrink-0">
                <Zap size={16} className="text-primary-400"/>
                <span className="text-xs font-semibold text-primary-400 hidden sm:block">AI Search</span>
              </div>
              <input
                type="text"
                value={heroQuery}
                onChange={e => setHeroQuery(e.target.value)}
                placeholder='Try "Best CS college in Delhi under ₹3L" or "IIT with AI program"'
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
              />
              <button type="submit" className="btn-primary py-2 px-4 text-sm flex-shrink-0">
                <Search size={15}/>Search
              </button>
            </div>
          </form>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/recommendations" className="btn-primary text-base px-8 py-3">
              <Sparkles size={18} />
              Get AI Recommendations
              <ArrowRight size={16} />
            </Link>
            <Link to="/colleges" className="btn-outline text-base px-8 py-3">
              <Search size={18} />
              Explore All Colleges
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto animate-fade-in">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="glass-card p-4 text-center">
                <Icon size={20} className="text-primary-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              AI Features that{' '}
              <span className="text-gradient">Actually Help</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built for students, not advertisers. Every feature is designed to give you honest, actionable insights.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, border, iconColor }) => (
              <div key={title} className={`glass-card p-6 border ${border} hover:shadow-card-hover transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Top Colleges Preview ──────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-surface-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display font-bold text-3xl text-white mb-2">Top Ranked Colleges</h2>
              <p className="text-slate-400 text-sm">By NIRF rankings — no bias, no paid promotions</p>
            </div>
            <Link to="/colleges" className="btn-outline hidden sm:inline-flex">
              View All <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOP_COLLEGES.map((c, i) => (
              <Link key={c.slug} to={`/colleges/${c.slug}`}
                className="glass-card p-4 flex items-center gap-3 hover:border-primary-500/30 hover:shadow-card-hover transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))' }}>
                  <span className="text-primary-300 text-sm">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
                    {c.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{c.type} · NIRF #{c.nirf}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold text-emerald-400">{c.avgPkg}</div>
                  <div className="text-[10px] text-slate-600">avg pkg</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 border border-primary-500/20 glow-primary">
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            Ready to Find Your Dream College?
          </h2>
          <p className="text-slate-400 mb-8">
            Create a free account, enter your profile, and let our AI do the rest.
          </p>
          <Link to="/register" className="btn-primary text-base px-10 py-3">
            <Sparkles size={18} />
            Start Your AI Journey — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <p className="text-slate-600 text-sm">
          © 2026 EduDiscover · Built with ❤️ · No ads, ever.
        </p>
      </footer>
    </div>
  )
}
