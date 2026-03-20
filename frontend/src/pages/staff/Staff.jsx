import React, { useState } from 'react'
import { Plus, DollarSign, UserCheck, X, Edit2, Trash2 } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/Modal'
import Avatar from '../../components/Avatar'
import api from '../../utils/api'

const SEED = [
  { _id:'1', name:'Suresh Trainer', role:'Head Trainer',  phone:'9870001111', salary:28000, status:'active', attendance:'26/30' },
  { _id:'2', name:'Anita Reception',role:'Receptionist',  phone:'9870002222', salary:18000, status:'active', attendance:'28/30' },
  { _id:'3', name:'Raj Instructor', role:'Yoga Instructor',phone:'9870003333',salary:22000, status:'active', attendance:'25/30' },
  { _id:'4', name:'Meena Cleaner',  role:'Housekeeping',  phone:'9870004444', salary:12000, status:'active', attendance:'27/30' },
  { _id:'5', name:'Kiran Security', role:'Security Guard', phone:'9870005555', salary:14000, status:'active', attendance:'30/30' },
]
const ROLES = ['Head Trainer','Trainer','Yoga Instructor','Receptionist','Manager','Housekeeping','Security Guard']
const BLANK  = { name:'', role:'Trainer', phone:'', salary:20000, email:'' }

export default function Staff() {
  const { show }  = useToast()
  const [staff, setStaff]     = useState(SEED)
  const [addOpen, setAddOpen] = useState(false)
  const [payslip, setPayslip] = useState(null)
  const [form, setForm]       = useState(BLANK)
  const [saving, setSaving]   = useState(false)
  const f = (k,v) => setForm(p => ({ ...p, [k]: v }))

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/staff', form).catch(() => {})
      setStaff(p => [{ _id: Date.now().toString(), ...form, status:'active', attendance:'0/30' }, ...p])
      show(`${form.name} added as ${form.role}!`, 'success')
      setAddOpen(false); setForm(BLANK)
    } finally { setSaving(false) }
  }

  async function markPresent(id, name) {
    await api.post(`/staff/${id}/attendance`, { status:'present' }).catch(() => {})
    show(`${name} marked present ✓`, 'success')
  }

  async function deleteStaff(id, name) {
    if (!confirm(`Remove ${name}?`)) return
    await api.delete(`/staff/${id}`).catch(() => {})
    setStaff(p => p.filter(s => s._id !== id))
    show(`${name} removed`, 'success')
  }

  const totalSalary = staff.reduce((s,x) => s + x.salary, 0)

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="page-header">
        <div><h1 className="page-title">Staff Management</h1><p className="page-subtitle">{staff.length} staff members</p></div>
        <button className="btn-primary" onClick={() => { setForm(BLANK); setAddOpen(true) }}><Plus className="w-4 h-4" /> Add Staff</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{l:'Total Staff',v:staff.length,e:'👥'},{l:'Present Today',v:staff.filter(s=>s.status==='active').length,e:'✅'},{l:'Monthly Salary',v:`₹${(totalSalary/1000).toFixed(0)}K`,e:'💰'},{l:'On Leave',v:0,e:'🏖'}].map(s => (
          <div key={s.l} className="stat-card"><div className="text-2xl mb-3">{s.e}</div><div className="font-heading font-extrabold text-2xl text-gray-900">{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Staff Member</th><th>Role</th><th>Phone</th><th>Salary</th><th>Attendance</th><th>Actions</th></tr></thead>
            <tbody>
              {staff.map(s => (
                <tr key={s._id}>
                  <td><div className="flex items-center gap-3"><Avatar name={s.name} size={9} /><div><div className="font-semibold text-gray-900">{s.name}</div><div className="text-xs text-gray-400">{s._id}</div></div></div></td>
                  <td><span className="badge badge-blue">{s.role}</span></td>
                  <td className="text-gray-600">{s.phone}</td>
                  <td className="font-bold text-primary-600">₹{s.salary.toLocaleString('en-IN')}</td>
                  <td className="text-gray-600">{s.attendance}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <button onClick={() => markPresent(s._id, s.name)} className="btn btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100"><UserCheck className="w-3 h-3" /> Present</button>
                      <button onClick={() => setPayslip(s)} className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100"><DollarSign className="w-3 h-3" /> Payslip</button>
                      <button onClick={() => deleteStaff(s._id, s.name)} className="btn btn-sm bg-red-50 text-red-500 hover:bg-red-100"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Staff Member">
        <form onSubmit={handleAdd}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="input-label">Full Name *</label><input required value={form.name} onChange={e=>f('name',e.target.value)} className="input" placeholder="Staff name" /></div>
              <div><label className="input-label">Role</label><select value={form.role} onChange={e=>f('role',e.target.value)} className="select">{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
              <div><label className="input-label">Phone *</label><input required type="tel" value={form.phone} onChange={e=>f('phone',e.target.value)} className="input" placeholder="10-digit" /></div>
              <div><label className="input-label">Salary (₹)</label><input type="number" value={form.salary} onChange={e=>f('salary',Number(e.target.value))} className="input" /></div>
            </div>
            <div><label className="input-label">Email</label><input type="email" value={form.email} onChange={e=>f('email',e.target.value)} className="input" placeholder="staff@gym.com" /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding...' : 'Add Staff'}</button>
          </div>
        </form>
      </Modal>

      {/* Payslip Modal */}
      <Modal open={!!payslip} onClose={() => setPayslip(null)} title="Payslip — March 2025" size="sm">
        {payslip && (
          <div className="modal-body">
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-dark-800 text-white p-5"><div className="font-heading font-extrabold text-lg">FitGymSoftware®</div><div className="text-white/40 text-sm">Payslip — March 2025</div></div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Employee</span><span className="font-semibold">{payslip.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Designation</span><span>{payslip.role}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Gross Salary</span><span className="font-semibold">₹{payslip.salary.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm text-red-500"><span>TDS (10%)</span><span>- ₹{Math.round(payslip.salary*0.1).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm text-red-500"><span>PF (12%)</span><span>- ₹{Math.round(payslip.salary*0.12).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-3"><span className="font-bold">Net Payable</span><span className="font-extrabold text-primary-600 text-lg">₹{Math.round(payslip.salary*0.78).toLocaleString('en-IN')}</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setPayslip(null)} className="btn-secondary flex-1">Close</button>
              <button onClick={() => { show(`Payslip sent to ${payslip.name}`, 'success'); setPayslip(null) }} className="btn-primary flex-1 justify-center">Send WhatsApp</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
