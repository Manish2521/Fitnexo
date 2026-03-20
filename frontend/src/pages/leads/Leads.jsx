import React, { useState, useEffect } from 'react'
import { Plus, Phone, MessageSquare, ArrowRight } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/Modal'
import Avatar from '../../components/Avatar'
import api from '../../utils/api'

const SEED = [
  { _id:'1', name:'Amit Sharma',  phone:'9760001111', source:'Instagram', interest:'Weight Loss',    status:'hot',       followup:'2025-03-20', notes:'Very interested, call daily' },
  { _id:'2', name:'Sneha Patel',  phone:'9760002222', source:'Walk-in',   interest:'Muscle Gain',   status:'warm',      followup:'2025-03-22', notes:'Visited gym, liked equipment' },
  { _id:'3', name:'Nikhil Rao',   phone:'9760003333', source:'Google',    interest:'General Fitness',status:'cold',      followup:'2025-03-25', notes:'Called once, no response' },
  { _id:'4', name:'Pooja Singh',  phone:'9760004444', source:'Referral',  interest:'Yoga',           status:'converted', followup:'2025-03-18', notes:'Joined Annual plan' },
  { _id:'5', name:'Arun Kumar',   phone:'9760005555', source:'Facebook',  interest:'Weight Loss',    status:'hot',       followup:'2025-03-19', notes:'Budget ₹3000/month' },
  { _id:'6', name:'Ritu Mehta',   phone:'9760006666', source:'WhatsApp',  interest:'Zumba',          status:'warm',      followup:'2025-03-21', notes:'Interested in group classes' },
]

const COLS = [
  { key:'hot',       label:'🔥 Hot',       bg:'bg-red-50',     border:'border-red-200',     badge:'badge-red',    count:'bg-red-100 text-red-700' },
  { key:'warm',      label:'🌡️ Warm',      bg:'bg-amber-50',   border:'border-amber-200',   badge:'badge-amber',  count:'bg-amber-100 text-amber-700' },
  { key:'cold',      label:'❄️ Cold',      bg:'bg-blue-50',    border:'border-blue-200',    badge:'badge-blue',   count:'bg-blue-100 text-blue-700' },
  { key:'converted', label:'✅ Converted', bg:'bg-emerald-50', border:'border-emerald-200', badge:'badge-green',  count:'bg-emerald-100 text-emerald-700' },
]

const BLANK = { name:'', phone:'', source:'Instagram', interest:'Weight Loss', status:'warm', followup:'', notes:'' }

export default function Leads() {
  const { show }  = useToast()
  const [leads, setLeads]   = useState(SEED)
  const [view, setView]     = useState('kanban')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm]     = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    api.get('/leads').then(r => { if (r.data.leads?.length) setLeads(r.data.leads) }).catch(() => {})
  }, [])

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/leads', form).catch(() => {})
      setLeads(p => [{ _id: Date.now().toString(), ...form }, ...p])
      show(`Lead "${form.name}" added!`, 'success')
      setAddOpen(false); setForm(BLANK)
    } finally { setSaving(false) }
  }

  async function moveLead(id, newStatus) {
    await api.put(`/leads/${id}`, { status: newStatus }).catch(() => {})
    setLeads(p => p.map(l => l._id === id ? { ...l, status: newStatus } : l))
    if (newStatus === 'converted') show('🎉 Lead converted to member!', 'success')
    else show(`Lead moved to ${newStatus}`, 'info')
  }

  async function callLead(phone, name) {
    show(`📞 Calling ${name} (${phone})...`, 'info')
  }

  async function whatsappLead(lead) {
    await api.post('/sms/send', { phone: lead.phone, message: `Hi ${lead.name}, we'd love to help you with ${lead.interest}. Please visit ${lead.source === 'Walk-in' ? 'us' : 'our gym'} at your convenience!`, type: 'whatsapp' }).catch(() => {})
    show(`📱 WhatsApp sent to ${lead.name}`, 'success')
  }

  const fmtDate = s => s ? new Date(s).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : '—'

  const LeadCard = ({ lead }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2 mb-2">
        <Avatar name={lead.name} size={8} />
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-gray-900 text-sm truncate">{lead.name}</div>
          <div className="text-xs text-gray-500">{lead.source} · {lead.interest}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
        <Phone className="w-3 h-3" /> {lead.phone}
      </div>
      {lead.followup && <div className="text-xs text-gray-400 mb-2">📅 Follow-up: {fmtDate(lead.followup)}</div>}
      {lead.notes && <div className="text-xs text-gray-400 italic mb-3 line-clamp-2">"{lead.notes}"</div>}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => callLead(lead.phone, lead.name)}
          className="btn btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs">
          Call
        </button>
        <button onClick={() => whatsappLead(lead)}
          className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100 text-xs">
          WhatsApp
        </button>
        {lead.status !== 'converted' && (
          <button onClick={() => moveLead(lead._id, 'converted')}
            className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs">
            Convert ✓
          </button>
        )}
        {lead.status === 'cold' && (
          <button onClick={() => moveLead(lead._id, 'warm')}
            className="btn btn-sm bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs">
            → Warm
          </button>
        )}
        {lead.status === 'warm' && (
          <button onClick={() => moveLead(lead._id, 'hot')}
            className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 text-xs">
            → Hot
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads & CRM</h1>
          <p className="page-subtitle">{leads.length} leads · {leads.filter(l => l.status === 'converted').length} converted this month</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['kanban', 'table'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${view === v ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {v === 'kanban' ? '⊞ Kanban' : '☰ Table'}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => { setForm(BLANK); setAddOpen(true) }}>
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {COLS.map(c => (
          <div key={c.key} className="stat-card">
            <div className="text-xl mb-2">{c.label.split(' ')[0]}</div>
            <div className="font-heading font-extrabold text-2xl text-gray-900">{leads.filter(l => l.status === c.key).length}</div>
            <div className="text-xs text-gray-500 mt-1 capitalize">{c.key} leads</div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLS.map(col => (
            <div key={col.key} className={`${col.bg} border ${col.border} rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-bold text-gray-900 text-sm">{col.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.count}`}>
                  {leads.filter(l => l.status === col.key).length}
                </span>
              </div>
              <div className="space-y-3">
                {leads.filter(l => l.status === col.key).map(lead => (
                  <LeadCard key={lead._id} lead={lead} />
                ))}
                {leads.filter(l => l.status === col.key).length === 0 && (
                  <div className="text-center text-gray-400 text-xs py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    No leads here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {view === 'table' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Name</th><th>Phone</th><th>Source</th><th>Interest</th><th>Status</th><th>Follow-up</th><th>Actions</th></tr></thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={lead.name} size={8} />
                        <span className="font-semibold text-gray-900">{lead.name}</span>
                      </div>
                    </td>
                    <td className="text-gray-600">{lead.phone}</td>
                    <td><span className="badge badge-blue">{lead.source}</span></td>
                    <td className="text-gray-600">{lead.interest}</td>
                    <td>
                      <span className={`badge ${lead.status === 'hot' ? 'badge-red' : lead.status === 'warm' ? 'badge-amber' : lead.status === 'cold' ? 'badge-blue' : 'badge-green'}`}>
                        {lead.status === 'hot' ? '🔥 ' : lead.status === 'converted' ? '✅ ' : ''}{lead.status}
                      </span>
                    </td>
                    <td className="text-gray-400 text-xs">{fmtDate(lead.followup)}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => callLead(lead.phone, lead.name)} className="btn btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100">Call</button>
                        <button onClick={() => whatsappLead(lead)} className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100">WhatsApp</button>
                        {lead.status !== 'converted' && (
                          <button onClick={() => moveLead(lead._id, 'converted')} className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100">Convert</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Lead">
        <form onSubmit={handleAdd}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="input-label">Name *</label><input required value={form.name} onChange={e => f('name', e.target.value)} className="input" placeholder="Lead name" /></div>
              <div><label className="input-label">Phone *</label><input required type="tel" value={form.phone} onChange={e => f('phone', e.target.value)} className="input" placeholder="Mobile number" /></div>
              <div>
                <label className="input-label">Source</label>
                <select value={form.source} onChange={e => f('source', e.target.value)} className="select">
                  {['Instagram','Walk-in','Google','Referral','Facebook','WhatsApp','YouTube','Other'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Interest</label>
                <select value={form.interest} onChange={e => f('interest', e.target.value)} className="select">
                  {['Weight Loss','Muscle Gain','General Fitness','Yoga','Zumba','Cardio','Personal Training'].map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Status</label>
                <select value={form.status} onChange={e => f('status', e.target.value)} className="select">
                  <option value="hot">🔥 Hot</option>
                  <option value="warm">🌡️ Warm</option>
                  <option value="cold">❄️ Cold</option>
                </select>
              </div>
              <div><label className="input-label">Follow-up Date</label><input type="date" value={form.followup} onChange={e => f('followup', e.target.value)} className="input" /></div>
            </div>
            <div><label className="input-label">Notes</label><textarea rows={2} value={form.notes} onChange={e => f('notes', e.target.value)} className="textarea" placeholder="Any details about this lead..." /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding...' : 'Add Lead'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
