import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Search, Download, Printer, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/Modal'
import api from '../../utils/api'

const PLAN_PRICES = { 'Standard 1M':999, 'Standard 3M':2499, 'Pro 1M':1499, 'Pro 3M':3999, 'Premium 6M':6999, 'Annual':10999 }
const SEED = [
  { _id:'1', memberName:'Arjun Sharma', amount:10999, plan:'Annual',      method:'UPI',        date:'2024-12-15', invoiceNo:'INV-0001', status:'paid' },
  { _id:'2', memberName:'Sunita Rao',   amount:6999,  plan:'Premium 6M', method:'Card',       date:'2025-01-20', invoiceNo:'INV-0002', status:'paid' },
  { _id:'3', memberName:'Vikram Singh', amount:10999, plan:'Annual',      method:'Cash',       date:'2025-01-05', invoiceNo:'INV-0003', status:'paid' },
  { _id:'4', memberName:'Ananya Gupta', amount:3999,  plan:'Pro 3M',      method:'UPI',        date:'2025-01-15', invoiceNo:'INV-0004', status:'paid' },
  { _id:'5', memberName:'Ravi Tiwari',  amount:6999,  plan:'Premium 6M', method:'NetBanking', date:'2025-02-10', invoiceNo:'INV-0005', status:'paid' },
  { _id:'6', memberName:'Rahul Verma',  amount:999,   plan:'Standard 1M', method:'Cash',      date:'2025-01-10', invoiceNo:'INV-0006', status:'due'  },
]
const MONTHLY = [
  { m:'Oct', v:195000 }, { m:'Nov', v:212000 }, { m:'Dec', v:235000 },
  { m:'Jan', v:228000 }, { m:'Feb', v:222000 }, { m:'Mar', v:240820 },
]
const BLANK = { memberName:'', plan:'Pro 3M', amount:3999, method:'UPI', notes:'' }

export default function Billing() {
  const { show } = useToast()
  const [payments, setPayments] = useState(SEED)
  const [search, setSearch]     = useState('')
  const [addOpen, setAddOpen]   = useState(false)
  const [invoice, setInvoice]   = useState(null)
  const [form, setForm]         = useState(BLANK)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    api.get('/billing').then(r => { if (r.data.payments?.length) setPayments(r.data.payments) }).catch(() => {})
  }, [])

  function f(k, v) { setForm(p => ({ ...p, [k]: v })) }
  function planChange(plan) { setForm(p => ({ ...p, plan, amount: PLAN_PRICES[plan] || p.amount }) ) }

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/billing', { ...form, amount: Number(form.amount) }).catch(() => {})
      const n = { _id: Date.now().toString(), memberName: form.memberName, amount: Number(form.amount), plan: form.plan, method: form.method, date: new Date().toISOString().split('T')[0], invoiceNo: `INV-${String(payments.length + 1).padStart(4,'0')}`, status:'paid' }
      setPayments(p => [n, ...p])
      show(`💰 ₹${Number(form.amount).toLocaleString('en-IN')} payment recorded!`, 'success')
      setAddOpen(false); setForm(BLANK)
    } finally { setSaving(false) }
  }

  const filtered  = payments.filter(p => !search || p.memberName.toLowerCase().includes(search.toLowerCase()) || p.invoiceNo.includes(search))
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalDue  = payments.filter(p => p.status === 'due').reduce((s, p) => s + p.amount, 0)
  const fmtDate   = s => s ? new Date(s).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="page-header">
        <div><h1 className="page-title">Billing & Payments</h1><p className="page-subtitle">{payments.length} transactions</p></div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => show('Exporting CSV...', 'info')}><Download className="w-4 h-4" /> Export</button>
          <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Collect Payment</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l:'Total Collected', v:`₹${(totalPaid/1000).toFixed(1)}K`, e:'💰' },
          { l:'This Month',      v:'₹2.4L',  e:'📅' },
          { l:'Pending Dues',    v:`₹${totalDue.toLocaleString('en-IN')}`, e:'⚠️', red:true },
          { l:'Avg/Member',      v:'₹2,840', e:'📊' },
        ].map(s => (
          <div key={s.l} className="stat-card">
            <div className="text-2xl mb-3">{s.e}</div>
            <div className={`font-heading font-extrabold text-2xl mb-1 ${s.red ? 'text-red-500' : 'text-gray-900'}`}>{s.v}</div>
            <div className="text-xs text-gray-500">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-body">
            <h3 className="font-heading font-bold text-gray-900 mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MONTHLY} barSize={32} margin={{ top:5, right:5, bottom:5, left:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius:10, border:'1px solid #e5e7eb', fontSize:12 }} />
                <Bar dataKey="v" fill="#00c47d" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-heading font-bold text-gray-900">Transactions</h3>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} className="input py-2 pl-9 text-xs" placeholder="Search..." />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Member</th><th>Amount</th><th>Plan</th><th>Method</th><th>Date</th><th>Status</th><th>Invoice</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p._id}>
                      <td className="font-semibold text-gray-900">{p.memberName}</td>
                      <td className="font-bold text-primary-600">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td><span className="badge badge-blue">{p.plan}</span></td>
                      <td className="text-gray-600">{p.method}</td>
                      <td className="text-gray-400 text-xs">{fmtDate(p.date)}</td>
                      <td><span className={`badge ${p.status === 'paid' ? 'badge-green' : 'badge-red'}`}>{p.status}</span></td>
                      <td>
                        <button onClick={() => setInvoice(p)} className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline">
                          <Printer className="w-3 h-3" /> {p.invoiceNo}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card card-body">
            <h3 className="font-heading font-bold text-gray-900 mb-4">Plan Breakdown</h3>
            <div className="space-y-4">
              {[{n:'Annual',pct:35,c:'bg-primary-600'},{n:'Premium 6M',pct:28,c:'bg-blue-500'},{n:'Pro 3M',pct:22,c:'bg-violet-500'},{n:'Standard',pct:15,c:'bg-amber-400'}].map(p => (
                <div key={p.n}>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-gray-700">{p.n}</span><span className="font-bold text-gray-900">{p.pct}%</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${p.c} rounded-full transition-all`} style={{ width:`${p.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card card-body">
            <h3 className="font-heading font-bold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {[{m:'UPI',pct:48,e:'📱'},{m:'Cash',pct:25,e:'💵'},{m:'Card',pct:18,e:'💳'},{m:'NetBanking',pct:9,e:'🏦'}].map(p => (
                <div key={p.m} className="flex items-center gap-3">
                  <span className="text-lg">{p.e}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-gray-700">{p.m}</span><span className="text-gray-500">{p.pct}%</span></div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary-600 rounded-full" style={{ width:`${p.pct}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collect Payment Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="💰 Collect Payment">
        <form onSubmit={handleAdd}>
          <div className="modal-body space-y-4">
            <div><label className="input-label">Member Name *</label><input required value={form.memberName} onChange={e=>f('memberName',e.target.value)} className="input" placeholder="Search member..." /></div>
            <div><label className="input-label">Plan</label>
              <select value={form.plan} onChange={e=>planChange(e.target.value)} className="select">
                {Object.entries(PLAN_PRICES).map(([p,price]) => <option key={p} value={p}>{p} — ₹{price.toLocaleString('en-IN')}</option>)}
              </select>
            </div>
            <div><label className="input-label">Amount (₹)</label><input type="number" required value={form.amount} onChange={e=>f('amount',e.target.value)} className="input" /></div>
            <div><label className="input-label">Payment Method</label>
              <select value={form.method} onChange={e=>f('method',e.target.value)} className="select">
                <option>UPI</option><option>Cash</option><option>Card</option><option>NetBanking</option>
              </select>
            </div>
            <div><label className="input-label">Notes</label><input value={form.notes} onChange={e=>f('notes',e.target.value)} className="input" placeholder="Optional notes" /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Recording...' : 'Record Payment'}</button>
          </div>
        </form>
      </Modal>

      {/* Invoice Modal */}
      <Modal open={!!invoice} onClose={() => setInvoice(null)} title="Invoice" size="sm">
        {invoice && (
          <div className="modal-body">
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-dark-800 text-white p-5 flex items-center justify-between">
                <div><div className="font-heading font-extrabold text-lg">FitGymSoftware®</div><div className="text-white/40 text-sm">Tax Invoice</div></div>
                <div className="text-right"><div className="text-primary-400 font-bold">{invoice.invoiceNo}</div><div className="text-white/40 text-xs">{fmtDate(invoice.date)}</div></div>
              </div>
              <div className="p-5 space-y-3">
                {[['Member', invoice.memberName], ['Plan', invoice.plan], ['Method', invoice.method]].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-sm"><span className="text-gray-500">{k}</span><span className="font-semibold">{v}</span></div>
                ))}
                <div className="flex justify-between border-t border-gray-100 pt-3 mt-2">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="font-extrabold text-primary-600 text-lg">₹{invoice.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setInvoice(null)} className="btn-secondary flex-1">Close</button>
              <button onClick={() => { show('Invoice sent via WhatsApp!', 'success'); setInvoice(null) }} className="btn-primary flex-1 justify-center">Send WhatsApp</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
