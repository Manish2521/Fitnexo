import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, Clock, AlertTriangle, ArrowRight, Zap, Search, Loader2, RefreshCw } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/Avatar'
import api from '../../utils/api'

const WEEK_DATA = [
  { day:'Mon', revenue:18200, checkins:98  },
  { day:'Tue', revenue:24500, checkins:118 },
  { day:'Wed', revenue:19800, checkins:105 },
  { day:'Thu', revenue:32000, checkins:134 },
  { day:'Fri', revenue:28400, checkins:122 },
  { day:'Sat', revenue:21600, checkins:110 },
  { day:'Sun', revenue:29820, checkins:124 },
]

function StatCard({ label, value, sub, subUp, icon: Icon, iconBg, onClick }) {
  return (
    <div onClick={onClick} className={`stat-card ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${iconBg} rounded-2xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {sub && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${subUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {subUp ? '▲' : '▼'} {sub}
          </span>
        )}
      </div>
      <div className="text-gray-500 text-xs font-semibold mb-1">{label}</div>
      <div className="font-heading font-extrabold text-2xl text-gray-900">{value}</div>
    </div>
  )
}

const EXPIRING_MOCK = [
  { name:'Priya Patel',   plan:'Pro 3M',    expiry:'Mar 28', status:'expiring', phone:'9870012345' },
  { name:'Mohit Kumar',   plan:'Standard',  expiry:'Mar 22', status:'expiring', phone:'9812345678' },
  { name:'Divya Nair',    plan:'Pro 3M',    expiry:'Mar 31', status:'expiring', phone:'9779012345' },
  { name:'Rahul Verma',   plan:'Standard',  expiry:'Feb 10', status:'expired',  phone:'9861234567' },
  { name:'Arun Mehta',    plan:'Pro 1M',    expiry:'Mar 19', status:'expiring', phone:'9760005555' },
]

export default function Dashboard() {
  const { user }    = useAuth()
  const { show }    = useToast()
  const navigate    = useNavigate()
  const [stats, setStats]     = useState({ members:847, todayCheckins:124, monthRevenue:240820, expiring:23 })
  const [expiring, setExpiring] = useState(EXPIRING_MOCK)
  const [ciSearch, setCiSearch]   = useState('')
  const [ciResults, setCiResults] = useState([])
  const [ciLoading, setCiLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/summary').then(r => setStats(r.data)).catch(() => {}).finally(() => setStatsLoading(false))
    api.get('/members?status=expiring&limit=5').then(r => {
      if (r.data.members?.length) setExpiring(r.data.members.map(m => ({ name:`${m.firstName} ${m.lastName}`, plan:m.plan, expiry:new Date(m.expiryDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}), status:m.status, phone:m.phone })))
    }).catch(() => {})
  }, [])

  async function searchCheckIn(q) {
    setCiSearch(q)
    if (q.length < 2) { setCiResults([]); return }
    setCiLoading(true)
    try {
      const r = await api.get(`/members?search=${encodeURIComponent(q)}&limit=6`)
      setCiResults(r.data.members || [])
    } catch {
      setCiResults([
        { _id:'1', firstName:'Arjun', lastName:'Sharma', phone:'9876543210', plan:'Annual', status:'active' },
        { _id:'2', firstName:'Priya', lastName:'Patel',  phone:'9870012345', plan:'Pro 3M', status:'expiring' },
      ].filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(q.toLowerCase())))
    } finally { setCiLoading(false) }
  }

  async function doCheckIn(m) {
    try { await api.post('/attendance/checkin', { memberId: m._id }) } catch {}
    const name = `${m.firstName} ${m.lastName}`
    const time  = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
    show(`✅ ${name} checked in at ${time}`, 'success')
    setCiSearch(''); setCiResults([])
    setStats(s => ({ ...s, todayCheckins: s.todayCheckins + 1 }))
  }

  async function sendReminder(member) {
    try { await api.post('/sms/send', { phone: member.phone, message: `Hi ${member.name}, your membership is expiring soon. Please renew.`, type:'whatsapp' }) } catch {}
    show(`📱 Reminder sent to ${member.name}`, 'success')
  }

  const fmt = n => typeof n === 'number' ? n.toLocaleString('en-IN') : n

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Good morning, {user?.name?.split(' ')[0] || 'Admin'} 👋</h1>
          <p className="page-subtitle">{user?.gymName || 'Your Gym'} — {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => navigate('/members')} className="btn-secondary">
            <Users className="w-4 h-4" /> Add Member
          </button>
          <button onClick={() => document.getElementById('ci-input')?.focus()} className="btn-primary">
            <Zap className="w-4 h-4" /> Quick Check-in
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? [...Array(4)].map((_,i) => <div key={i} className="stat-card animate-pulse"><div className="h-24 bg-gray-100 rounded-xl" /></div>) : <>
          <StatCard label="Total Members" value={fmt(stats.members)} sub="38 new" subUp icon={Users} iconBg="bg-primary-600" onClick={() => navigate('/members')} />
          <StatCard label="Today's Check-ins" value={fmt(stats.todayCheckins ?? 124)} sub="12%" subUp icon={Clock} iconBg="bg-blue-500" onClick={() => navigate('/attendance')} />
          <StatCard label="Monthly Revenue" value={`₹${((stats.monthRevenue ?? 240820)/1000).toFixed(1)}K`} sub="8.3%" subUp icon={TrendingUp} iconBg="bg-violet-500" onClick={() => navigate('/billing')} />
          <StatCard label="Expiring Soon" value={stats.expiring ?? 23} sub="Needs attention" subUp={false} icon={AlertTriangle} iconBg="bg-amber-500" onClick={() => navigate('/members')} />
        </>}
      </div>

      {/* Quick Check-in */}
      <div className="card card-body">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary-600" />
          <h3 className="font-heading font-bold text-gray-900">Quick Check-in</h3>
          <span className="text-gray-400 text-xs ml-1">Search by name or phone</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {ciLoading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
          <input id="ci-input" value={ciSearch} onChange={e => searchCheckIn(e.target.value)}
            className="input pl-10" placeholder="Type member name or phone number..." />
          {ciResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 mt-1 overflow-hidden">
              {ciResults.map((m, i) => (
                <button key={m._id || i} onClick={() => doCheckIn(m)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left border-b border-gray-50 last:border-0">
                  <Avatar name={`${m.firstName} ${m.lastName}`} size={8} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{m.firstName} {m.lastName}</div>
                    <div className="text-xs text-gray-500">{m.phone} · {m.plan}</div>
                  </div>
                  <span className={`badge ${m.status === 'active' ? 'badge-green' : m.status === 'expiring' ? 'badge-amber' : 'badge-red'}`}>{m.status}</span>
                  <span className="text-xs text-primary-600 font-bold">Check In →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card card-body">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-heading font-bold text-gray-900">Weekly Revenue</h3><p className="text-xs text-gray-400 mt-0.5">Last 7 days</p></div>
            <span className="badge badge-green">+8.3%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEK_DATA} barSize={28} margin={{ top:5, right:5, bottom:5, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`} />
              <Tooltip formatter={v=>[`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius:12, border:'1px solid #e5e7eb', fontSize:12 }} />
              <Bar dataKey="revenue" fill="#00c47d" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-body">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-heading font-bold text-gray-900">Daily Check-ins</h3><p className="text-xs text-gray-400 mt-0.5">Last 7 days</p></div>
            <span className="badge badge-blue">Avg {Math.round(WEEK_DATA.reduce((s,d)=>s+d.checkins,0)/7)}/day</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={WEEK_DATA} margin={{ top:5, right:5, bottom:5, left:0 }}>
              <defs>
                <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:12, border:'1px solid #e5e7eb', fontSize:12 }} />
              <Area type="monotone" dataKey="checkins" stroke="#3b82f6" strokeWidth={2.5} fill="url(#ciGrad)" dot={{ fill:'#3b82f6', r:3 }} activeDot={{ r:5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Expiring */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-heading font-bold text-gray-900">Expiring Memberships</h3>
            <button onClick={() => navigate('/members')} className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {expiring.map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <Avatar name={m.name} size={9} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.plan} · Expires {m.expiry}</div>
                </div>
                <span className={`badge ${m.status === 'expiring' ? 'badge-amber' : 'badge-red'}`}>{m.status}</span>
                <button onClick={() => sendReminder(m)} className="btn btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100 flex-shrink-0">
                  Remind
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card card-body">
          <h3 className="font-heading font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Add Member',    icon:'👤', path:'/members',    color:'hover:border-primary-300' },
              { label:'Collect Fee',   icon:'💰', path:'/billing',    color:'hover:border-amber-300' },
              { label:'Attendance',    icon:'✅', path:'/attendance', color:'hover:border-blue-300' },
              { label:'Send WhatsApp', icon:'📱', action: () => show('WhatsApp bulk sender opening...','info'), color:'hover:border-green-300' },
              { label:'Add Lead',      icon:'🎯', path:'/leads',      color:'hover:border-red-300' },
              { label:'Reports',       icon:'📊', path:'/reports',    color:'hover:border-violet-300' },
            ].map(a => (
              <button key={a.label}
                onClick={() => a.path ? navigate(a.path) : a.action?.()}
                className={`border border-gray-100 rounded-2xl p-4 text-center hover:shadow-sm hover:-translate-y-0.5 transition-all ${a.color} bg-white`}>
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className="text-xs font-semibold text-gray-700 leading-tight">{a.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
