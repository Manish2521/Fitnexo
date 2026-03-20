import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, Clock, Fingerprint, QrCode, UserCheck, X, Loader2 } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import Avatar from '../../components/Avatar'
import api from '../../utils/api'

const MOCK_LOGS = [
  { name:'Arjun Sharma',  phone:'9876543210', time:'06:12 AM', method:'biometric', status:'active'   },
  { name:'Sunita Rao',    phone:'9845678901', time:'07:04 AM', method:'qr',        status:'active'   },
  { name:'Vikram Singh',  phone:'9834567890', time:'07:45 AM', method:'biometric', status:'active'   },
  { name:'Ananya Gupta',  phone:'9823456789', time:'08:22 AM', method:'manual',    status:'active'   },
  { name:'Kavita Joshi',  phone:'9801234567', time:'09:15 AM', method:'qr',        status:'active'   },
  { name:'Ravi Tiwari',   phone:'9790123456', time:'10:02 AM', method:'biometric', status:'active'   },
  { name:'Priya Patel',   phone:'9870012345', time:'10:44 AM', method:'manual',    status:'expiring' },
  { name:'Mohit Kumar',   phone:'9812345678', time:'11:30 AM', method:'qr',        status:'expiring' },
]
const TREND = [
  { day:'Mon', v:98 }, { day:'Tue', v:118 }, { day:'Wed', v:105 },
  { day:'Thu', v:134 }, { day:'Fri', v:122 }, { day:'Sat', v:110 }, { day:'Sun', v:124 },
]

export default function Attendance() {
  const { show }  = useToast()
  const [logs, setLogs]       = useState(MOCK_LOGS)
  const [search, setSearch]   = useState('')
  const [mSearch, setMSearch] = useState('')
  const [mResults, setMResults] = useState([])
  const [mLoading, setMLoading] = useState(false)
  const [qrOpen, setQrOpen]   = useState(false)

  async function searchMember(q) {
    setMSearch(q)
    if (q.length < 2) { setMResults([]); return }
    setMLoading(true)
    try {
      const r = await api.get(`/members?search=${encodeURIComponent(q)}&limit=6`)
      setMResults(r.data.members || [])
    } catch {
      setMResults([
        { _id:'1', firstName:'Arjun', lastName:'Sharma', phone:'9876543210', plan:'Annual',  status:'active'   },
        { _id:'2', firstName:'Priya', lastName:'Patel',  phone:'9870012345', plan:'Pro 3M', status:'expiring' },
      ].filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(q.toLowerCase())))
    } finally { setMLoading(false) }
  }

  async function checkIn(m) {
    try { await api.post('/attendance/checkin', { memberId: m._id }) } catch {}
    const now  = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
    const name = `${m.firstName} ${m.lastName}`
    setLogs(p => [{ name, phone: m.phone, time: now, method:'manual', status: m.status }, ...p])
    show(`✅ ${name} checked in at ${now}`, 'success')
    setMSearch(''); setMResults([])
  }

  const filtered = logs.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search))

  const methodBadge = m => m === 'biometric' ? 'badge-purple' : m === 'qr' ? 'badge-blue' : 'badge-amber'
  const methodIcon  = m => m === 'biometric' ? <Fingerprint className="w-3 h-3" /> : m === 'qr' ? <QrCode className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="page-header">
        <div><h1 className="page-title">Attendance</h1><p className="page-subtitle">{logs.length} check-ins today</p></div>
        <button onClick={() => setQrOpen(true)} className="btn-secondary"><QrCode className="w-4 h-4" /> Show QR Code</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Today's Check-ins", v: logs.length,                              e:'✅' },
          { label:'Biometric',         v: logs.filter(x=>x.method==='biometric').length, e:'🔐' },
          { label:'QR Code',           v: logs.filter(x=>x.method==='qr').length,        e:'📱' },
          { label:'Manual Entry',      v: logs.filter(x=>x.method==='manual').length,    e:'👤' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-2xl mb-3">{s.e}</div>
            <div className="font-heading font-extrabold text-2xl text-gray-900">{s.v}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Manual Check-in */}
      <div className="card card-body">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="w-4 h-4 text-primary-600" />
          <h3 className="font-heading font-bold text-gray-900">Manual Check-in</h3>
          <span className="text-gray-400 text-xs">Search member below</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {mLoading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
          <input value={mSearch} onChange={e => searchMember(e.target.value)}
            className="input pl-10" placeholder="Type member name or phone..." />
          {mResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 mt-1 overflow-hidden">
              {mResults.map((m, i) => (
                <button key={m._id || i} onClick={() => checkIn(m)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left border-b border-gray-50 last:border-0">
                  <Avatar name={`${m.firstName} ${m.lastName}`} size={8} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">{m.firstName} {m.lastName}</div>
                    <div className="text-xs text-gray-500">{m.phone} · {m.plan}</div>
                  </div>
                  <span className={`badge ${m.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{m.status}</span>
                  <span className="text-xs text-primary-600 font-bold flex-shrink-0">Check In →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Log table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-heading font-bold text-gray-900">Today's Log</h3>
            <div className="relative w-44">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="input py-2 pl-9 text-xs" placeholder="Filter..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Member</th><th>Time</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={i}>
                    <td><div className="font-semibold text-gray-900">{l.name}</div><div className="text-xs text-gray-400">{l.phone}</div></td>
                    <td><div className="flex items-center gap-1.5 text-gray-600"><Clock className="w-3.5 h-3.5 text-gray-400" /> {l.time}</div></td>
                    <td><span className={`badge ${methodBadge(l.method)} flex items-center gap-1 w-fit`}>{methodIcon(l.method)} {l.method}</span></td>
                    <td><span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend */}
        <div className="card card-body">
          <h3 className="font-heading font-bold text-gray-900 mb-4">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={TREND}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c47d" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00c47d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #e5e7eb', fontSize:11 }} />
              <Area type="monotone" dataKey="v" stroke="#00c47d" strokeWidth={2.5} fill="url(#attGrad)" dot={false} activeDot={{ r:4 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2.5">
            {[['biometric','🔐 Biometric','text-violet-600'],['qr','📱 QR Code','text-blue-600'],['manual','👤 Manual','text-amber-600']].map(([m,l,c]) => (
              <div key={m} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{l}</span>
                <span className={`font-bold ${c}`}>{logs.filter(x => x.method === m).length} today</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrOpen && (
        <div className="modal-backdrop" onClick={() => setQrOpen(false)}>
          <div className="bg-white rounded-3xl p-8 w-80 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setQrOpen(false)} className="absolute top-4 right-4 btn-icon p-1.5"><X className="w-4 h-4" /></button>
            <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Gym Check-in QR</h3>
            <p className="text-sm text-gray-500 mb-6">Members scan this to check in instantly</p>
            <div className="bg-gray-50 rounded-2xl p-5 mb-4">
              <div className="w-44 h-44 mx-auto grid grid-cols-8 gap-0.5">
                {Array.from({ length: 64 }, (_, i) => (
                  <div key={i} className={`rounded-sm ${Math.random() > 0.45 ? 'bg-gray-900' : 'bg-white'}`} style={{ aspectRatio:'1' }} />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 font-mono">GYM-ID: FGS-{new Date().getFullYear()}-001</p>
          </div>
        </div>
      )}
    </div>
  )
}
