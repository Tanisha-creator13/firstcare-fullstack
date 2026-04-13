import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { MOCK_SESSIONS } from '../data/triageEngine'
import { apiDashboardStats, apiGetSessions } from '../api/client'
import { Activity, AlertTriangle, TrendingUp, List, Loader2 } from 'lucide-react'

const URGENCY_COLORS = {
  EMERGENCY: '#ef4444', URGENT: '#f97316', MONITOR: '#eab308', LOW_RISK: '#22c55e',
}
const URGENCY_LABELS = {
  EMERGENCY: 'Emergency', URGENT: 'Urgent', MONITOR: 'Monitor', LOW_RISK: 'Low Risk',
}
function badgeClass(cat) {
  return { EMERGENCY:'bg-red-100 text-red-700', URGENT:'bg-orange-100 text-orange-700',
    MONITOR:'bg-yellow-100 text-yellow-700', LOW_RISK:'bg-green-100 text-green-700' }[cat] || ''
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const usingRealApi = !!import.meta.env.VITE_API_URL

  useEffect(() => { if (user) loadData() }, [user])

  const buildMockStats = () => {
    const s = MOCK_SESSIONS
    const dist = {}
    s.forEach(x => { dist[x.category] = (dist[x.category] || 0) + 1 })
    setStats({
      total_sessions: s.length,
      latest_category: s[s.length - 1]?.category,
      avg_severity: +(s.reduce((a, x) => a + x.score, 0) / s.length / 10).toFixed(1),
      high_priority_count: s.filter(x => ['EMERGENCY','URGENT'].includes(x.category)).length,
      urgency_distribution: dist,
      severity_over_time: s.map(x => ({ date: x.date.slice(5), score: x.score })),
    })
    setSessions(s.map(x => ({ id: x.id, category: x.category, risk_score: x.score,
      severity: 5, duration: '1_2_days', symptom_summary: x.symptomSummary, timestamp: x.date })))
  }

  const loadData = async () => {
    setLoading(true)
    try {
      if (usingRealApi) {
        const [statsData, sessionsData] = await Promise.all([apiDashboardStats(), apiGetSessions()])
        setStats(statsData)
        setSessions(sessionsData)
      } else {
        await new Promise(r => setTimeout(r, 400))
        buildMockStats()
      }
    } catch { buildMockStats() }
    finally { setLoading(false) }
  }

  if (!user) return (
    <div className="min-h-screen bg-parchment flex items-center justify-center text-center px-4">
      <div>
        <p className="font-display text-2xl text-navy-900 mb-3">Sign in to view your dashboard</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-parchment flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-navy-900/30" />
    </div>
  )

  const pieData = Object.entries(stats?.urgency_distribution || {}).map(([cat, value]) => ({
    name: URGENCY_LABELS[cat] || cat, value, color: URGENCY_COLORS[cat] || '#888',
  }))
  const lineData = (stats?.severity_over_time || []).map((d, i) => ({ label:`#${i+1}`, score:d.score, date:d.date }))
  const statCards = [
    { label:'Total Assessments', value: stats?.total_sessions ?? 0, icon: List, color:'text-navy-600' },
    { label:'Last Urgency Level', value: URGENCY_LABELS[stats?.latest_category] || '—', icon: Activity, color:'text-sage-400' },
    { label:'Avg Risk Score', value: stats?.avg_severity != null ? `${stats.avg_severity}/10` : '—', icon: TrendingUp, color:'text-navy-500' },
    { label:'High Priority Cases', value: stats?.high_priority_count ?? 0, icon: AlertTriangle, color:'text-ember-500' },
  ]

  return (
    <div className="min-h-screen bg-parchment pb-16">
      <div className="bg-navy-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-cream/40 font-body text-sm tracking-widest uppercase mb-1">Dashboard</p>
          <h1 className="font-display text-3xl text-cream">Hello, {user.name.split(' ')[0]} 👋</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.label} className="card p-4">
              <div className={`${s.color} mb-2`}><s.icon size={20} /></div>
              <div className="font-display text-2xl text-navy-900 font-semibold">{s.value}</div>
              <div className="text-navy-600/50 font-body text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h2 className="font-display text-lg text-navy-900 mb-4">Urgency Distribution</h2>
            {pieData.length === 0 ? <p className="text-navy-600/30 font-body text-sm text-center py-12">No data yet</p> : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v,n)=>[v,n]} contentStyle={{fontFamily:'DM Sans',fontSize:12,borderRadius:12,border:'1px solid #ede8df'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {pieData.map(p => (
                    <div key={p.name} className="flex items-center gap-1.5 text-xs font-body text-navy-600">
                      <div className="w-2.5 h-2.5 rounded-full" style={{background:p.color}} />{p.name} ({p.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="card p-5">
            <h2 className="font-display text-lg text-navy-900 mb-4">Risk Score Over Time</h2>
            {lineData.length === 0 ? <p className="text-navy-600/30 font-body text-sm text-center py-12">No data yet</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData} margin={{top:5,right:10,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
                  <XAxis dataKey="date" tick={{fontSize:10,fontFamily:'DM Sans',fill:'#94939a'}} />
                  <YAxis tick={{fontSize:10,fontFamily:'DM Sans',fill:'#94939a'}} domain={[0,100]} />
                  <Tooltip contentStyle={{fontFamily:'DM Sans',fontSize:12,borderRadius:12,border:'1px solid #ede8df'}} />
                  <Line type="monotone" dataKey="score" stroke="#0f1729" strokeWidth={2} dot={{fill:'#4ecdc4',r:4}} activeDot={{r:6}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-lg text-navy-900 mb-4">Recent Sessions</h2>
          {sessions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-navy-600/30 font-body text-sm">No assessments yet.</p>
              <Link to="/assess" className="btn-primary mt-4 inline-flex">Start your first assessment</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="text-left text-xs text-navy-600/40 uppercase tracking-widest border-b border-parchment">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Symptoms</th>
                    <th className="pb-3 pr-4 font-medium">Urgency</th>
                    <th className="pb-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment">
                  {[...sessions].reverse().map(s => (
                    <tr key={s.id} className="hover:bg-parchment/50 transition-colors">
                      <td className="py-3 pr-4 text-navy-600/60 text-xs whitespace-nowrap">
                        {String(s.timestamp).slice(0,10)}
                      </td>
                      <td className="py-3 pr-4 text-navy-700 max-w-[200px] truncate">
                        {s.symptom_summary || <span className="text-navy-600/30 italic">Anonymous</span>}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass(s.category)}`}>
                          {URGENCY_LABELS[s.category]}
                        </span>
                      </td>
                      <td className="py-3"><span className="font-mono text-navy-900 font-medium">{s.risk_score}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
