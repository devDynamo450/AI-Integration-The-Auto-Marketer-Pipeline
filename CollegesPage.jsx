import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Search, Sparkles, SlidersHorizontal, Zap, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import CollegeCard, { CollegeCardSkeleton } from '../components/CollegeCard'
import FilterSidebar from '../components/FilterSidebar'
import { useDebounce } from '../hooks/useDebounce'

function buildQS(filters, page) {
  const p = new URLSearchParams()
  if (filters.search) p.set('search', filters.search)
  if (filters.types?.length) p.set('type', filters.types.join(','))
  if (filters.tiers?.length) p.set('tier', filters.tiers.join(','))
  if (filters.states?.length) p.set('state', filters.states.join(','))
  if (filters.exams?.length) p.set('exam', filters.exams.join(','))
  if (filters.maxFees < 2000000) p.set('maxFees', filters.maxFees)
  if (filters.sort) p.set('sort', filters.sort)
  p.set('page', page)
  p.set('limit', 12)
  return p.toString()
}

export default function CollegesPage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: '', types: [], tiers: [], states: [], exams: [],
    minFees: 0, maxFees: 2000000, sort: '-aiRatingScore',
  })
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiSearchMode, setAiSearchMode] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const debouncedSearch = useDebounce(filters.search, 500)

  // Handle homepage search redirect
  useEffect(() => {
    const fromAI = searchParams.get('aiSearch')
    const q = searchParams.get('q')
    if (fromAI && q) {
      setAiSearchMode(true)
      setAiQuery(q)
      aiSearchMutation.mutate(q)
    }
  }, []) // eslint-disable-line

  const qs = buildQS({ ...filters, search: debouncedSearch }, page)

  // Regular filtered query
  const { data, isLoading: normalLoading } = useQuery({
    queryKey: ['colleges', qs],
    queryFn: () => api.get(`/colleges?${qs}`).then(r => r.data),
    keepPreviousData: true,
    enabled: !aiSearchMode,
  })

  // Gemini AI Search
  const aiSearchMutation = useMutation({
    mutationFn: (q) => api.get(`/colleges/ai-search?q=${encodeURIComponent(q)}`).then(r => r.data),
  })

  const handleAiSearch = (e) => {
    e.preventDefault()
    if (aiQuery.trim().length < 3) return
    aiSearchMutation.mutate(aiQuery.trim())
  }

  const handleFilterChange = useCallback((f) => { setFilters(f); setPage(1) }, [])

  const colleges = aiSearchMode
    ? (aiSearchMutation.data?.data || [])
    : (data?.data || [])

  const loading = aiSearchMode ? aiSearchMutation.isLoading : normalLoading
  const total = aiSearchMode
    ? (aiSearchMutation.data?.count || 0)
    : (data?.total || 0)

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="py-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">Explore Colleges</h1>
            <p className="text-slate-400 text-sm mt-1">
              {loading ? 'Searching…' : `${total.toLocaleString()} college${total !== 1 ? 's' : ''} found`}
              {aiSearchMode && aiSearchMutation.data && (
                <span className="ml-2 badge-primary text-[10px]">
                  <Zap size={8} className="inline mr-1"/>AI Result
                </span>
              )}
            </p>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-outline py-2 sm:hidden"
            >
              <SlidersHorizontal size={15}/>Filters
            </button>
          </div>
        </div>

        {/* Dual Search Bar */}
        <div className="glass-card p-1 flex gap-1 border border-white/10">
          {/* Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/5 flex-shrink-0">
            <button
              onClick={() => { setAiSearchMode(false); aiSearchMutation.reset() }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all ${
                !aiSearchMode ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search size={13}/> Filter
            </button>
            <button
              onClick={() => setAiSearchMode(true)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all ${
                aiSearchMode ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={13}/> AI
            </button>
          </div>

          {aiSearchMode ? (
            /* AI Search Input */
            <form onSubmit={handleAiSearch} className="flex flex-1 gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder='e.g. "Best CS college in Tamil Nadu under ₹5L" or "IIT with good placements"'
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none px-3"
              />
              {aiQuery && (
                <button type="button" onClick={() => { setAiQuery(''); aiSearchMutation.reset() }}
                  className="p-2 text-slate-500 hover:text-slate-300">
                  <X size={14}/>
                </button>
              )}
              <button type="submit" disabled={aiQuery.length < 3 || aiSearchMutation.isLoading}
                className="btn-primary py-2 px-4 text-xs disabled:opacity-40 flex-shrink-0">
                {aiSearchMutation.isLoading
                  ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Searching…</>
                  : <><Sparkles size={13}/>Search</>
                }
              </button>
            </form>
          ) : (
            /* Regular Filter Search */
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input
                type="text"
                placeholder="Search by name, city, type…"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none pl-9 pr-4 py-2.5"
              />
            </div>
          )}
        </div>

        {/* AI Search Suggestions */}
        {aiSearchMode && !aiSearchMutation.data && !aiSearchMutation.isLoading && (
          <div className="flex flex-wrap gap-2">
            {[
              'Best placement colleges in Maharashtra',
              'Government college under 2 lakh fees',
              'Top NITs for Computer Science',
              'Private college with NAAC A++ rating',
            ].map(s => (
              <button key={s} onClick={() => { setAiQuery(s); setTimeout(() => aiSearchMutation.mutate(s), 0) }}
                className="text-xs px-3 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-400 hover:bg-primary-500/10 transition-all">
                <Sparkles size={10} className="inline mr-1"/>{s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6 pb-12">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} sm:block w-64 flex-shrink-0 ${aiSearchMode ? 'opacity-40 pointer-events-none' : ''}`}>
          <FilterSidebar filters={filters} onChange={handleFilterChange} />
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* AI Search error */}
          {aiSearchMutation.isError && (
            <div className="glass-card p-4 mb-4 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <X size={16}/>{aiSearchMutation.error?.response?.data?.message || 'AI search failed. Please try again.'}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => <CollegeCardSkeleton key={i} />)}
            </div>
          ) : colleges.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="text-5xl mb-4">{aiSearchMode ? '🔍' : '🎓'}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {aiSearchMode ? 'No AI results found' : 'No colleges found'}
              </h3>
              <p className="text-slate-400 text-sm">
                {aiSearchMode ? 'Try rephrasing your query or be more specific' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {colleges.map(c => <CollegeCard key={c._id} college={c} />)}
              </div>
              {!aiSearchMode && data?.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-outline py-2 px-4 disabled:opacity-40">← Prev</button>
                  <span className="flex items-center px-4 text-slate-400 text-sm">{page} / {data.pages}</span>
                  <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data?.pages}
                    className="btn-outline py-2 px-4 disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
