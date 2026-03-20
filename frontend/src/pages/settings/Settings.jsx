import React, { useState } from 'react'
import { Save, Check, Wifi, WifiOff } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

function Toggle({ on, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${on ? 'bg-primary-600' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

function SettingRow({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <div className="font-semibold text-gray-900 text-sm">{label}</div>
        {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
      </div>
      <Toggle on={value} onChange={onChange} />
    </div>
  )
}

const TABS = [
  { key:'gym',           label:'🏋️ Gym Profile' },
  { key:'notifications', label:'🔔 Notifications' },
  { key:'billing',       label:'💳 Billing Setup' },
  { key:'biometric',     label:'🔐 Biometric' },
  { key:'sms',           label:'📱 SMS & WhatsApp' },
  { key:'users',         label:'👥 Users & Roles' },
  { key:'backup',        label:'🔒 Backup' },
  { key:'plans',         label:'📋 Membership Plans' },
]

const PLAN_LIST = [
  { name:'Standard 1M', duration:'30 days', price:999 },
  { name:'Standard 3M', duration:'90 days', price:2499 },
  { name:'Pro 1M',      duration:'30 days', price:1499 },
  { name:'Pro 3M',      duration:'90 days', price:3999 },
  { name:'Premium 6M',  duration:'180 days',price:6999 },
  { name:'Annual',      duration:'365 days',price:10999 },
]

const STAFF_USERS = [
  { name:'Admin Owner',   email:'admin@gym.com',   role:'admin',   status:'active' },
  { name:'Rajan Manager', email:'manager@gym.com',  role:'manager', status:'active' },
  { name:'Suresh Trainer',email:'trainer@gym.com',  role:'trainer', status:'active' },
]

export default function Settings() {
  const { user }  = useAuth()
  const { show }  = useToast()
  const [tab, setTab] = useState('gym')

  const [gymForm, setGymForm] = useState({
    gymName: user?.gymName || 'My Gym',
    ownerName: user?.name || 'Owner',
    phone: '+91 7601026686',
    email: user?.email || 'owner@gym.com',
    city: 'Mumbai',
    gst: '',
    address: 'Plot 42, Linking Road, Bandra West, Mumbai - 400050',
  })

  const [notifs, setNotifs] = useState({
    renewalReminder: true, paymentReceipt: true, birthdayWish: true,
    checkinNotif: false, dailySummary: true, weeklyReport: true,
  })

  const [toggles, setToggles] = useState({
    upi: true, gst: true, autoBackup: true, twoFactor: false,
  })

  const setN = (k, v) => setNotifs(p => ({ ...p, [k]: v }))
  const setT = (k, v) => setToggles(p => ({ ...p, [k]: v }))

  async function saveGym(e) {
    e.preventDefault()
    await api.put('/settings/gym', gymForm).catch(() => {})
    show('Gym profile saved!', 'success')
  }

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="page-header">
        <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage your gym configuration</p></div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar Nav */}
        <div className="card card-body h-fit">
          <div className="space-y-0.5">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === t.key ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 card card-body">

          {/* Gym Profile */}
          {tab === 'gym' && (
            <form onSubmit={saveGym} className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Gym Profile</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-5">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl">💪</div>
                <div>
                  <button type="button" className="btn-secondary btn-sm">Upload Logo</button>
                  <p className="text-xs text-gray-400 mt-1">PNG or JPG, max 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">Gym Name</label><input value={gymForm.gymName} onChange={e => setGymForm(p => ({...p, gymName:e.target.value}))} className="input" /></div>
                <div><label className="input-label">Owner Name</label><input value={gymForm.ownerName} onChange={e => setGymForm(p => ({...p, ownerName:e.target.value}))} className="input" /></div>
                <div><label className="input-label">Phone</label><input value={gymForm.phone} onChange={e => setGymForm(p => ({...p, phone:e.target.value}))} className="input" /></div>
                <div><label className="input-label">Email</label><input type="email" value={gymForm.email} onChange={e => setGymForm(p => ({...p, email:e.target.value}))} className="input" /></div>
                <div><label className="input-label">GST Number</label><input value={gymForm.gst} onChange={e => setGymForm(p => ({...p, gst:e.target.value}))} className="input" placeholder="27AAPFU0939F1ZV" /></div>
                <div><label className="input-label">City</label><input value={gymForm.city} onChange={e => setGymForm(p => ({...p, city:e.target.value}))} className="input" /></div>
              </div>
              <div><label className="input-label">Address</label><textarea value={gymForm.address} onChange={e => setGymForm(p => ({...p, address:e.target.value}))} className="textarea" rows={2} /></div>
              <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> Save Profile</button>
            </form>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <div>
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Notification Settings</h3>
              <SettingRow label="Renewal Reminder (7 days)" desc="Auto-send WhatsApp when membership expiring in 7 days" value={notifs.renewalReminder} onChange={v => setN('renewalReminder', v)} />
              <SettingRow label="Payment Receipt" desc="Send receipt via WhatsApp after each payment" value={notifs.paymentReceipt} onChange={v => setN('paymentReceipt', v)} />
              <SettingRow label="Birthday Wishes" desc="Auto WhatsApp greeting on member birthdays" value={notifs.birthdayWish} onChange={v => setN('birthdayWish', v)} />
              <SettingRow label="Check-in Notification" desc="Notify member on each gym check-in" value={notifs.checkinNotif} onChange={v => setN('checkinNotif', v)} />
              <SettingRow label="Daily Summary" desc="Send daily business report to owner at 10 PM" value={notifs.dailySummary} onChange={v => setN('dailySummary', v)} />
              <SettingRow label="Weekly Report" desc="Send weekly analytics every Monday morning" value={notifs.weeklyReport} onChange={v => setN('weeklyReport', v)} />
              <div className="mt-5">
                <button onClick={() => show('Notification settings saved!', 'success')} className="btn-primary"><Save className="w-4 h-4" /> Save Settings</button>
              </div>
            </div>
          )}

          {/* Billing Setup */}
          {tab === 'billing' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Billing & Payments</h3>
              <div><label className="input-label">Razorpay Key ID</label><input className="input" placeholder="rzp_live_xxxxxxxxxx" /></div>
              <div><label className="input-label">Razorpay Secret Key</label><input type="password" className="input" placeholder="••••••••••••••••" /></div>
              <SettingRow label="Enable UPI Payments" desc="Accept UPI via Razorpay" value={toggles.upi} onChange={v => setT('upi', v)} />
              <SettingRow label="Auto-calculate GST (18%)" desc="Add GST to all invoices automatically" value={toggles.gst} onChange={v => setT('gst', v)} />
              <button onClick={() => show('Billing settings saved!', 'success')} className="btn-primary mt-4"><Save className="w-4 h-4" /> Save & Test Connection</button>
            </div>
          )}

          {/* Biometric */}
          {tab === 'biometric' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Biometric Device</h3>
              <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-200 rounded-2xl">
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse flex-shrink-0" />
                <div>
                  <div className="font-bold text-gray-900 text-sm">eSSL K30 — Online</div>
                  <div className="text-xs text-gray-500">192.168.1.100 · Last sync: 2 min ago · 847 records</div>
                </div>
                <Wifi className="w-4 h-4 text-primary-600 ml-auto" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">Device IP Address</label><input className="input" defaultValue="192.168.1.100" /></div>
                <div><label className="input-label">Port</label><input type="number" className="input" defaultValue="4370" /></div>
                <div>
                  <label className="input-label">Device Model</label>
                  <select className="select">
                    <option>eSSL K30</option><option>eSSL K300</option><option>eSSL X990</option>
                    <option>eSSL F22</option><option>eSSL AI-Face Magnum</option>
                    <option>eSSL AI-Face Mars</option><option>eSSL U-Face 302</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Sync Interval</label>
                  <select className="select"><option>Real-time</option><option>Every 5 min</option><option>Every 15 min</option></select>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => show('Device settings saved!', 'success')} className="btn-primary"><Save className="w-4 h-4" /> Save</button>
                <button onClick={() => { show('Testing connection...', 'info'); setTimeout(() => show('eSSL K30 connected successfully! ✅', 'success'), 1500) }} className="btn-secondary">Test Connection</button>
                <button onClick={() => { show('Syncing biometric records...', 'info'); setTimeout(() => show('Synced 847 records successfully!', 'success'), 2000) }} className="btn-secondary">Sync Now</button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Compatible devices:</strong> eSSL K30, K300, X990, F22, AI-Face Magnum, AI-Face Mars, AI-Face ERI, U-Face 302. Confirm compatibility before purchase at <a href="https://fitgymsoftware.com/features/biometric-access-control.html" target="_blank" rel="noreferrer" className="underline">fitgymsoftware.com</a>
              </div>
            </div>
          )}

          {/* SMS & WhatsApp */}
          {tab === 'sms' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">SMS & WhatsApp Integration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">MSG91 API Key</label><input className="input" placeholder="MSG91 key for SMS" /></div>
                <div><label className="input-label">DLT Sender ID</label><input className="input" placeholder="FITGYM (DLT registered)" /></div>
              </div>
              <div><label className="input-label">WATI Access Token (WhatsApp)</label><input className="input" placeholder="WATI Business API access token" /></div>
              <div><label className="input-label">WATI Base URL</label><input className="input" placeholder="https://live-mt-server.wati.io/YOUR_ID" /></div>
              <hr className="border-gray-100" />
              <h4 className="font-semibold text-gray-900 text-sm">Message Templates</h4>
              <div><label className="input-label">Renewal Reminder</label><textarea rows={2} className="textarea" defaultValue="Hi {name}, your {gym_name} membership expires on {date}. Renew now: {link}" /></div>
              <div><label className="input-label">Payment Receipt</label><textarea rows={2} className="textarea" defaultValue="Dear {name}, ₹{amount} received for {plan}. Invoice: {invoice}. Thank you! — {gym_name}" /></div>
              <div><label className="input-label">Birthday Wish</label><textarea rows={2} className="textarea" defaultValue="Happy Birthday {name}! 🎂 Wishing you a wonderful year ahead. Enjoy 10% off your next renewal! — {gym_name}" /></div>
              <button onClick={() => show('SMS & WhatsApp settings saved!', 'success')} className="btn-primary"><Save className="w-4 h-4" /> Save Settings</button>
            </div>
          )}

          {/* Users & Roles */}
          {tab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-lg text-gray-900">Users & Roles</h3>
                <button onClick={() => show('Add user functionality — connect to backend', 'info')} className="btn-primary btn-sm">+ Add User</button>
              </div>
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {STAFF_USERS.map(u => (
                      <tr key={u.email}>
                        <td><div className="flex items-center gap-2"><div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">{u.name[0]}</div><span className="font-semibold text-gray-900">{u.name}</span></div></td>
                        <td className="text-gray-500">{u.email}</td>
                        <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'manager' ? 'badge-blue' : 'badge-green'} capitalize`}>{u.role}</span></td>
                        <td><span className="badge badge-green">Active</span></td>
                        <td><button className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200">Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Backup */}
          {tab === 'backup' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Backup & Security</h3>
              <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
                <div className="font-bold text-gray-900 mb-1 flex items-center gap-2"><Check className="w-4 h-4 text-primary-600" /> Last backup: Today 3:00 AM</div>
                <div className="text-sm text-gray-500">847 members · 5 staff · Encrypted · Stored on secure cloud</div>
              </div>
              <SettingRow label="Auto Daily Backup" desc="Automatically backup all data every day at 3 AM" value={toggles.autoBackup} onChange={v => setT('autoBackup', v)} />
              <SettingRow label="Two-Factor Authentication" desc="Require OTP verification on every login" value={toggles.twoFactor} onChange={v => setT('twoFactor', v)} />
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { show('Creating backup...', 'info'); setTimeout(() => show('Backup completed successfully! ✅', 'success'), 2000) }} className="btn-primary">Backup Now</button>
                <button onClick={() => show('Downloading backup archive...', 'info')} className="btn-secondary">Download Backup</button>
              </div>
            </div>
          )}

          {/* Plans */}
          {tab === 'plans' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-lg text-gray-900">Membership Plans</h3>
                <button onClick={() => show('Add plan — connect to backend', 'info')} className="btn-primary btn-sm">+ Add Plan</button>
              </div>
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Plan Name</th><th>Duration</th><th>Price</th><th>Actions</th></tr></thead>
                  <tbody>
                    {PLAN_LIST.map(p => (
                      <tr key={p.name}>
                        <td className="font-semibold text-gray-900">{p.name}</td>
                        <td className="text-gray-500">{p.duration}</td>
                        <td className="font-bold text-primary-600">₹{p.price.toLocaleString('en-IN')}</td>
                        <td>
                          <div className="flex gap-1.5">
                            <button onClick={() => show(`Editing ${p.name}...`, 'info')} className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
