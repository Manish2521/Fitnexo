import React, { useState } from 'react'
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Download, TrendingUp, Users, RefreshCw } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const MONTHLY = [
  { m:'Apr', rev:160000, members:680 }, { m:'May', rev:175000, members:695 },
  { m:'Jun', rev:185000, members:710 }, { m:'Jul', rev:220000, members:730 },
  { m:'Aug', rev:198000, members:742 }, { m:'Sep', rev:215000, members:758 },
  { m:'Oct', rev:240000, members:772 }, { m:'Nov', rev:235000, members:790 },
  { m:'Dec', rev:260000, members:800 }, { m:'Jan', rev:245000, members:815 },
  { m:'Feb', rev:222000, members:830 }, { m:'Mar', rev:240820, members:847 },
]

const PIE_DATA = [
  { name:'Annual',      value:35, color:'#00c47d' },
  { name:'Premium 6M',  value:28, color:'#3b82f6' },
  { name:'Pro 3M',      value:22, color:'#7c3aed' },
  { name:'Standard',    value:15, color:'#f59e0b' },
]

const HEATMAP = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  count: Math.floor(Math.random() * 60 + 70),
}))

const KPI = [
  { label:'Total Revenue', value:'₹26.4L', change:'+8.3%', up:true,  accent:'border-l-primary-500' },
  { label:'New Members',   value:'38',     change:'+15%',  up:true,  accent:'border-l-blue-500' },
  { label:'Renewal Rate',  value:'82%',    change:'+4%',   up:true,  accent:'border-l-violet-500' },
  { label:'Avg/Member',    value:'₹2,840', change:'-2%',   up:false, accent:'border-l-amber-400' },
]

const SUMMARY_ROWS = MONTHLY.map((m, i) => ({
  month: `${m.m} ${i < 9 ? '2024' : '2025'}`,
  revenue: m.rev,
  newMembers: Math.floor(Math.random() * 20 + 10),
  renewals: Math.floor(Math.random() * 30 + 40),
  expired: Math.floor(Math.random() * 10 + 2),
  total: m.members,
}))

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'rev' ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Reports() {
  const { show } = useToast()
  const [period, setPeriod] = useState('year')

  const heatmapColor = (count) => {
    if (count < 90) return 'rgba(0,196,125,0.15)'
    if (count < 105) return 'rgba(0,196,125,0.4)'
    if (count < 120) return 'rgba(0,196,125,0.7)'
    return 'rgba(0,196,125,1)'
  }

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="page-header">
        <div><h1 className="page-title">Reports & Analytics</h1><p className="page-subtitle">Business performance overview</p></div>
        <div className="flex gap-2 flex-wrap">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="input w-auto py-2">
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button onClick={() => show('Generating PDF report...', 'info')} className="btn-secondary">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={() => show('Refreshing data...', 'info')} className="btn-ghost p-2.5">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map(k => (
          <div key={k.label} className={`stat-card border-l-4 ${k.accent}`}>
            <div className="text-xs text-gray-500 font-semibold mb-1">{k.label}</div>
            <div className="font-heading font-extrabold text-2xl text-gray-900 mb-1">{k.value}</div>
            <div className={`text-xs font-bold ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {k.up ? '▲' : '▼'} {k.change} vs last period
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Growth */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card card-body">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-heading font-bold text-gray-900">Monthly Revenue</h3><p className="text-xs text-gray-400 mt-0.5">Apr 2024 – Mar 2025</p></div>
            <span className="badge badge-green">₹26.4L total</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} barSize={20} margin={{ top:5, right:5, bottom:5, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rev" name="Revenue" fill="#00c47d" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-body">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-heading font-bold text-gray-900">Member Growth</h3><p className="text-xs text-gray-400 mt-0.5">Cumulative members</p></div>
            <span className="badge badge-blue">847 total</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY} margin={{ top:5, right:5, bottom:5, left:0 }}>
              <defs>
                <linearGradient id="mgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #e5e7eb', fontSize:11 }} />
              <Area type="monotone" dataKey="members" name="Members" stroke="#3b82f6" strokeWidth={2.5} fill="url(#mgGrad)" dot={false} activeDot={{ r:4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Pie Chart */}
        <div className="card card-body">
          <h3 className="font-heading font-bold text-gray-900 mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => [`${v}%`, 'Share']} contentStyle={{ borderRadius:8, border:'1px solid #e5e7eb', fontSize:11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PIE_DATA.map(p => (
              <div key={p.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <span className="text-xs text-gray-600 flex-1">{p.name}</span>
                <span className="text-xs font-bold text-gray-900">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="lg:col-span-2 card card-body">
          <h3 className="font-heading font-bold text-gray-900 mb-4">Attendance Heatmap — March 2025</h3>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs text-gray-400 font-semibold pb-1">{d}</div>
            ))}
            {/* spacer for start day */}
            {Array.from({ length: 6 }, (_, i) => <div key={`s${i}`} />)}
            {HEATMAP.map(d => (
              <div key={d.day} title={`${d.day} Mar: ${d.count} check-ins`}
                className="rounded-md cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
                style={{ aspectRatio:'1', background: heatmapColor(d.count) }} />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background:'rgba(0,196,125,0.15)' }} /> Low (&lt;90)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background:'rgba(0,196,125,0.4)' }} /> Medium</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background:'rgba(0,196,125,0.7)' }} /> High</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background:'rgba(0,196,125,1)' }} /> Peak (&gt;120)</div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-heading font-bold text-gray-900">Monthly Summary</h3>
          <button onClick={() => show('Exporting CSV...', 'info')} className="btn-secondary btn-sm">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Month</th><th>Revenue</th><th>New Members</th><th>Renewals</th><th>Expired</th><th>Total Members</th></tr></thead>
            <tbody>
              {SUMMARY_ROWS.map((r, i) => (
                <tr key={i}>
                  <td className="font-semibold text-gray-900">{r.month}</td>
                  <td className="font-bold text-primary-600">₹{r.revenue.toLocaleString('en-IN')}</td>
                  <td className="text-gray-600">+{r.newMembers}</td>
                  <td className="text-gray-600">{r.renewals}</td>
                  <td className="text-red-500">{r.expired}</td>
                  <td className="font-semibold text-gray-900">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
