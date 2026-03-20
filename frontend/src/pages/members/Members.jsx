import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, RefreshCw, MessageSquare, Edit2, Trash2, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/Modal'
import Avatar from '../../components/Avatar'
import api from '../../utils/api'

const PLANS = ['Standard 1M','Standard 3M','Pro 1M','Pro 3M','Premium 6M','Annual']
const STATUSES = ['all','active','expiring','expired','frozen']

const SEED = [
  { _id:'1', firstName:'Arjun',  lastName:'Sharma', phone:'9876543210', email:'arjun@gmail.com',  plan:'Annual',      expiryDate:'2025-12-15', status:'active',   joinDate:'2024-12-15', balanceDue:0 },
  { _id:'2', firstName:'Priya',  lastName:'Patel',  phone:'9870012345', email:'priya@gmail.com',  plan:'Pro 3M',      expiryDate:'2025-03-28', status:'expiring', joinDate:'2024-12-28', balanceDue:0 },
  { _id:'3', firstName:'Rahul',  lastName:'Verma',  phone:'9861234567', email:'rahul@gmail.com',  plan:'Standard 1M', expiryDate:'2025-02-10', status:'expired',  joinDate:'2025-01-10', balanceDue:1499 },
  { _id:'4', firstName:'Sunita', lastName:'Rao',    phone:'9845678901', email:'sunita@gmail.com', plan:'Premium 6M',  expiryDate:'2025-07-20', status:'active',   joinDate:'2025-01-20', balanceDue:0 },
  { _id:'5', firstName:'Vikram', lastName:'Singh',  phone:'9834567890', email:'vikram@gmail.com', plan:'Annual',      expiryDate:'2026-01-05', status:'active',   joinDate:'2025-01-05', balanceDue:0 },
  { _id:'6', firstName:'Ananya', lastName:'Gupta',  phone:'9823456789', email:'ananya@gmail.com', plan:'Pro 3M',      expiryDate:'2025-04-15', status:'active',   joinDate:'2025-01-15', balanceDue:0 },
  { _id:'7', firstName:'Mohit',  lastName:'Kumar',  phone:'9812345678', email:'mohit@gmail.com',  plan:'Standard 1M', expiryDate:'2025-03-22', status:'expiring', joinDate:'2025-02-22', balanceDue:0 },
  { _id:'8', firstName:'Kavita', lastName:'Joshi',  phone:'9801234567', email:'kavita@gmail.com', plan:'Annual',      expiryDate:'2025-11-30', status:'active',   joinDate:'2024-11-30', balanceDue:0 },
]

const BLANK_FORM = { firstName:'', lastName:'', phone:'', email:'', dob:'', plan:'Pro 3M', gender:'male', address:'' }

export default function Members() {
  const { show } = useToast()
  const [members, setMembers]   = useState(SEED)
  const [total, setTotal]       = useState(SEED.length)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('all')
  const [page, setPage]         = useState(1)
  const [addOpen, setAddOpen]   = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [renewItem, setRenewItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm]         = useState(BLANK_FORM)
  const [saving, setSaving]     = useState(false)
  const PER = 10

  const fmtDate = s => s ? new Date(s).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'
  const f = (k,v) => setForm(p => ({ ...p, [k]: v }))

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: PER })
      if (search) params.set('search', search)
      if (status !== 'all') params.set('status', status)
      const r = await api.get(`/members?${params}`)
      setMembers(r.data.members); setTotal(r.data.total)
    } catch {
      let d = SEED
      if (search) d = d.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search))
      if (status !== 'all') d = d.filter(m => m.status === status)
      setMembers(d); setTotal(d.length)
    } finally { setLoading(false) }
  }, [search, status, page])

  useEffect(() => { fetch() }, [fetch])

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) {
        await api.put(`/members/${editItem._id}`, form).catch(() => {})
        setMembers(p => p.map(m => m._id === editItem._id ? { ...m, ...form } : m))
        show(`${form.firstName} updated!`, 'success'); setEditItem(null)
      } else {
        await api.post('/members', form).catch(() => {})
        const n = { _id: Date.now().toString(), ...form, status:'active', joinDate:new Date().toISOString(), expiryDate:'', balanceDue:0 }
        setMembers(p => [n, ...p]); setTotal(t => t+1)
        show(`${form.firstName} ${form.lastName} added!`, 'success'); setAddOpen(false)
      }
      setForm(BLANK_FORM)
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    await api.delete(`/members/${deleteItem._id}`).catch(() => {})
    setMembers(p => p.filter(m => m._id !== deleteItem._id)); setTotal(t => t-1)
    show(`${deleteItem.firstName} deleted`, 'success'); setDeleteItem(null)
  }

  async function handleRenew(e) {
    e.preventDefault(); setSaving(true)
    await api.post(`/members/${renewItem._id}/renew`, { plan: renewItem.newPlan }).catch(() => {})
    setMembers(p => p.map(m => m._id === renewItem._id ? { ...m, status:'active', plan:renewItem.newPlan } : m))
    show(`${renewItem.firstName}'s membership renewed!`, 'success'); setRenewItem(null); setSaving(false)
  }

  async function sendWhatsApp(m) {
    await api.post('/sms/send', { phone:m.phone, message:`Hi ${m.firstName}, your membership is expiring. Please renew.`, type:'whatsapp' }).catch(() => {})
    show(`📱 WhatsApp sent to ${m.firstName}`, 'success')
  }

  function openEdit(m) { setEditItem(m); setForm({ firstName:m.firstName, lastName:m.lastName||'', phone:m.phone, email:m.email||'', dob:m.dob||'', plan:m.plan, gender:m.gender||'male', address:m.address||'' }) }

  const MemberForm = () => (
    <form onSubmit={handleSave}>
      <div className="modal-body space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="input-label">First Name *</label><input required value={form.firstName} onChange={e=>f('firstName',e.target.value)} className="input" placeholder="First name" /></div>
          <div><label className="input-label">Last Name</label><input value={form.lastName} onChange={e=>f('lastName',e.target.value)} className="input" placeholder="Last name" /></div>
          <div><label className="input-label">Phone *</label><input required type="tel" value={form.phone} onChange={e=>f('phone',e.target.value)} className="input" placeholder="10-digit mobile" /></div>
          <div><label className="input-label">Email</label><input type="email" value={form.email} onChange={e=>f('email',e.target.value)} className="input" placeholder="email@example.com" /></div>
          <div><label className="input-label">Date of Birth</label><input type="date" value={form.dob} onChange={e=>f('dob',e.target.value)} className="input" /></div>
          <div><label className="input-label">Gender</label><select value={form.gender} onChange={e=>f('gender',e.target.value)} className="select"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
        </div>
        <div><label className="input-label">Membership Plan</label><select value={form.plan} onChange={e=>f('plan',e.target.value)} className="select">{PLANS.map(p=><option key={p}>{p}</option>)}</select></div>
        <div><label className="input-label">Address</label><textarea value={form.address} onChange={e=>f('address',e.target.value)} className="textarea" rows={2} placeholder="Full address" /></div>
      </div>
      <div className="modal-footer">
        <button type="button" onClick={() => { setAddOpen(false); setEditItem(null); setForm(BLANK_FORM) }} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Member'}</button>
      </div>
    </form>
  )

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="page-header">
        <div><h1 className="page-title">Members</h1><p className="page-subtitle">{total} total members</p></div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-secondary" onClick={() => show('Exporting CSV...','info')}><Download className="w-4 h-4" /> Export</button>
          <button className="btn-primary" onClick={() => { setForm(BLANK_FORM); setAddOpen(true) }}><Plus className="w-4 h-4" /> Add Member</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-body flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} className="input pl-10" placeholder="Search name or phone..." />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => {setStatus(s);setPage(1)}}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${status===s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetch} className="btn-icon p-2"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr>
              <th>Member</th><th>Phone</th><th>Plan</th><th>Joined</th><th>Expiry</th><th>Status</th><th>Balance</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="text-center py-16 text-gray-400"><div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /> Loading members...</div></td></tr>}
              {!loading && members.map(m => (
                <tr key={m._id}>
                  <td><div className="flex items-center gap-3"><Avatar name={`${m.firstName} ${m.lastName}`} size={9} /><div><div className="font-semibold text-gray-900">{m.firstName} {m.lastName}</div><div className="text-xs text-gray-400">{m.email}</div></div></div></td>
                  <td className="text-gray-600">{m.phone}</td>
                  <td><span className="badge badge-blue">{m.plan}</span></td>
                  <td className="text-gray-500 text-xs">{fmtDate(m.joinDate)}</td>
                  <td className="text-gray-500 text-xs">{fmtDate(m.expiryDate)}</td>
                  <td><span className={`badge ${m.status==='active'?'badge-green':m.status==='expiring'?'badge-amber':m.status==='frozen'?'badge-blue':'badge-red'}`}>{m.status}</span></td>
                  <td>{m.balanceDue>0 ? <span className="font-bold text-red-600">₹{m.balanceDue.toLocaleString('en-IN')}</span> : <span className="text-emerald-600 font-semibold text-xs">✓ Paid</span>}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <button onClick={() => setRenewItem({ ...m, newPlan: m.plan })} title="Renew" className="btn btn-sm bg-primary-50 text-primary-600 hover:bg-primary-100"><RefreshCw className="w-3 h-3" /></button>
                      <button onClick={() => sendWhatsApp(m)} title="WhatsApp" className="btn btn-sm bg-green-50 text-green-600 hover:bg-green-100"><MessageSquare className="w-3 h-3" /></button>
                      <button onClick={() => openEdit(m)} title="Edit" className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => setDeleteItem(m)} title="Delete" className="btn btn-sm bg-red-50 text-red-500 hover:bg-red-100"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && members.length === 0 && <tr><td colSpan={8} className="text-center py-16 text-gray-400">No members found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-500">Showing {members.length} of {total}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-icon p-1.5 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-semibold text-gray-600 px-2">Page {page}</span>
            <button onClick={() => setPage(p => p+1)} disabled={members.length<PER} className="btn-icon p-1.5 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setForm(BLANK_FORM) }} title="Add New Member"><MemberForm /></Modal>
      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => { setEditItem(null); setForm(BLANK_FORM) }} title="Edit Member"><MemberForm /></Modal>

      {/* Renew Modal */}
      <Modal open={!!renewItem} onClose={() => setRenewItem(null)} title="Renew Membership">
        {renewItem && <form onSubmit={handleRenew}>
          <div className="modal-body space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
              <Avatar name={`${renewItem.firstName} ${renewItem.lastName}`} size={10} />
              <div><div className="font-bold text-gray-900">{renewItem.firstName} {renewItem.lastName}</div><div className="text-sm text-gray-500">Current: {renewItem.plan}</div></div>
            </div>
            <div><label className="input-label">New Plan</label><select value={renewItem.newPlan} onChange={e => setRenewItem(p=>({...p,newPlan:e.target.value}))} className="select">{PLANS.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label className="input-label">Payment Method</label><select className="select"><option>UPI</option><option>Cash</option><option>Card</option><option>NetBanking</option></select></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setRenewItem(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Processing...' : 'Renew & Record Payment'}</button>
          </div>
        </form>}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Member" size="sm">
        <div className="modal-body">
          <p className="text-gray-600">Are you sure you want to delete <strong>{deleteItem?.firstName} {deleteItem?.lastName}</strong>? This cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button onClick={() => setDeleteItem(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger btn">Delete Member</button>
        </div>
      </Modal>
    </div>
  )
}
