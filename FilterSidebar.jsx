import { useState } from 'react'
import { SlidersHorizontal, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

const STATES = [
  'Delhi', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Uttar Pradesh',
  'Rajasthan', 'West Bengal', 'Gujarat', 'Telangana', 'Punjab',
  'Madhya Pradesh', 'Bihar', 'Andhra Pradesh', 'Kerala', 'Haryana',
]
const TYPES = ['IIT', 'NIT', 'IIIT', 'Central University', 'State University', 'Private', 'Deemed']
const EXAMS = ['JEE Advanced', 'JEE Mains', 'NEET', 'BITSAT', 'CAT', 'CLAT']
const TIERS = ['Tier 1', 'Tier 2', 'Tier 3']

const DEFAULT_FILTERS = {
  search: '',
  types: [],
  tiers: [],
  states: [],
  exams: [],
  minFees: 0,
  maxFees: 2000000,
  sort: '-aiRatingScore',
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/5 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {open ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
      </button>
      {open && children}
    </div>
  )
}

function MultiSelectPills({ options, selected, onChange, colorClass = 'bg-primary-500/15 text-primary-300 border-primary-500/30' }) {
  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val])
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`badge transition-all duration-150 ${
            selected.includes(opt)
              ? colorClass
              : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function FilterSidebar({ filters, onChange }) {
  const currentFilters = { ...DEFAULT_FILTERS, ...filters }
  const activeCount = [
    currentFilters.types.length,
    currentFilters.tiers.length,
    currentFilters.states.length,
    currentFilters.exams.length,
    currentFilters.minFees > 0 ? 1 : 0,
    currentFilters.maxFees < 2000000 ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const update = (key, val) => onChange({ ...currentFilters, [key]: val })
  const reset = () => onChange(DEFAULT_FILTERS)

  return (
    <aside className="glass-card p-5 space-y-5 sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary-400" />
          <h2 className="font-semibold text-white text-sm">AI Filters</h2>
          {activeCount > 0 && (
            <span className="badge-primary text-[10px] px-1.5 py-0.5">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={reset} className="btn-ghost py-1 px-2 text-xs text-slate-500 hover:text-white">
            <RotateCcw size={12} />Reset
          </button>
        )}
      </div>

      {/* Sort */}
      <Section title="Sort By">
        <select
          value={currentFilters.sort}
          onChange={e => update('sort', e.target.value)}
          className="input-field py-2 text-xs"
        >
          <option value="-aiRatingScore">AI Rating (High → Low)</option>
          <option value="averageFees">Fees (Low → High)</option>
          <option value="-averageFees">Fees (High → Low)</option>
          <option value="rankings.nirf">NIRF Rank (Best First)</option>
          <option value="-overallRating">Student Rating</option>
        </select>
      </Section>

      {/* Budget Range */}
      <Section title="Annual Budget (₹)">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>₹{(currentFilters.minFees / 100000).toFixed(0)}L</span>
            <span>₹{(currentFilters.maxFees / 100000).toFixed(0)}L</span>
          </div>
          <div className="space-y-2">
            <input
              type="range" className="range-slider"
              min={0} max={2000000} step={50000}
              value={currentFilters.maxFees}
              onChange={e => update('maxFees', Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            {[500000, 1000000, 2000000].map(val => (
              <button
                key={val}
                onClick={() => update('maxFees', val)}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
                  currentFilters.maxFees === val
                    ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                    : 'border-white/10 text-slate-500 hover:border-white/20'
                }`}
              >
                ₹{val / 100000}L
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* College Type */}
      <Section title="College Type">
        <MultiSelectPills
          options={TYPES}
          selected={currentFilters.types}
          onChange={val => update('types', val)}
        />
      </Section>

      {/* Tier */}
      <Section title="Tier">
        <MultiSelectPills
          options={TIERS}
          selected={currentFilters.tiers}
          onChange={val => update('tiers', val)}
          colorClass="bg-amber-500/15 text-amber-300 border-amber-500/30"
        />
      </Section>

      {/* States */}
      <Section title="Preferred States" defaultOpen={false}>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {STATES.map(state => (
            <label key={state} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
              <input
                type="checkbox"
                checked={currentFilters.states.includes(state)}
                onChange={() => {
                  const next = currentFilters.states.includes(state)
                    ? currentFilters.states.filter(s => s !== state)
                    : [...currentFilters.states, state]
                  update('states', next)
                }}
                className="w-3.5 h-3.5 rounded accent-indigo-500"
              />
              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{state}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Entrance Exams */}
      <Section title="Entrance Exams" defaultOpen={false}>
        <MultiSelectPills
          options={EXAMS}
          selected={currentFilters.exams}
          onChange={val => update('exams', val)}
          colorClass="bg-blue-500/15 text-blue-300 border-blue-500/30"
        />
      </Section>

      {/* Location Toggle */}
      <Section title="Location Preference" defaultOpen={false}>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs text-slate-400">In my preferred states only</span>
          <div className="relative">
            <input
              type="checkbox"
              className="toggle-input sr-only"
              id="locationToggle"
              checked={currentFilters.states.length > 0}
              readOnly
            />
            <label htmlFor="locationToggle" className="toggle-label" />
          </div>
        </label>
      </Section>
    </aside>
  )
}
