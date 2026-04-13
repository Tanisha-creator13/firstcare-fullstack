import { useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { LIBRARY, CATEGORIES } from '../data/library'

export default function Library() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [expanded, setExpanded] = useState(null)

  const filtered = LIBRARY.filter(item => {
    const matchCat = category === 'All' || item.category === category
    const matchQuery = item.condition.toLowerCase().includes(query.toLowerCase()) ||
      item.brief.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQuery
  })

  const toggle = (id) => setExpanded(expanded === id ? null : id)

  return (
    <div className="min-h-screen bg-parchment pb-16">
      {/* Header */}
      <div className="bg-navy-900 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-cream/40 font-body text-sm tracking-widest uppercase mb-1">Reference</p>
          <h1 className="font-display text-4xl text-cream mb-2">First Aid Library</h1>
          <p className="text-cream/40 font-body text-sm">20 conditions with step-by-step emergency guidance</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-600/40" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search conditions…"
            className="input-field pl-10"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-body font-medium border transition-all
                ${category === cat
                  ? 'bg-navy-900 text-cream border-navy-900'
                  : 'bg-white border-parchment text-navy-600 hover:border-navy-900/30'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-navy-600/40 font-body mb-4 uppercase tracking-widest">
          {filtered.length} condition{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="card overflow-hidden">
              {/* Card header */}
              <button
                onClick={() => toggle(item.id)}
                className="w-full text-left p-5 flex items-start gap-4 hover:bg-parchment/40 transition-colors"
              >
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg text-navy-900 leading-tight">{item.condition}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-body text-navy-600/40 bg-parchment px-2 py-0.5 rounded-full hidden sm:block">
                        {item.category}
                      </span>
                      {expanded === item.id
                        ? <ChevronUp size={16} className="text-navy-600/40" />
                        : <ChevronDown size={16} className="text-navy-600/40" />}
                    </div>
                  </div>
                  <p className="text-navy-600/60 font-body text-xs mt-1 leading-relaxed line-clamp-2">
                    {item.brief}
                  </p>
                </div>
              </button>

              {/* Expanded steps */}
              {expanded === item.id && (
                <div className="border-t border-parchment bg-parchment/30 px-5 py-4">
                  <p className="text-xs font-body text-navy-600/50 uppercase tracking-widest mb-3">Steps</p>
                  <ol className="space-y-3">
                    {item.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-navy-900 text-cream text-xs font-body font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="font-body text-sm text-navy-700 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-xl text-navy-900/40">No conditions found</p>
            <p className="font-body text-sm text-navy-600/30 mt-1">Try a different search term or category</p>
          </div>
        )}
      </div>
    </div>
  )
}
