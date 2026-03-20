import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Fingerprint, ArrowRight, Loader2, Check } from 'lucide-react'

const PLANS = [
  { id: 'starter',    label: 'Starter',    price: '₹999/mo',   features: ['200 members', 'SMS alerts', 'Basic reports'] },
  { id: 'pro',        label: 'Pro',        price: '₹1,999/mo', features: ['Unlimited members', 'Biometric', 'WhatsApp', 'CRM'], popular: true },
  { id: 'enterprise', label: 'Enterprise', price: '₹4,999/mo', features: ['Multi-branch', 'Custom app', 'API access'] },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const { show }     = useToast()
  const navigate     = useNavigate()
  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [form, setForm] = useState({ gymName:'', ownerName:'', phone:'', email:'', city:'', password:'', plan:'pro' })

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setError('') }

  async function submit(e) {
    e.preventDefault()
    if (!form.gymName || !form.ownerName || !form.phone || !form.password)
      return setError('Please fill all required fields')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form)
      show('Gym registered successfully! Welcome to FitGymSoftware!', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-dark-800 text-xl">
            FitGym<span className="text-primary-600">Software</span>®
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="font-heading font-extrabold text-2xl text-gray-900 mb-1">Register Your Gym</h2>
              <p className="text-gray-500 text-sm">Start your 14-day free trial. No credit card required.</p>
            </div>

            {/* Plan selection */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Choose your plan</p>
              <div className="grid grid-cols-3 gap-2">
                {PLANS.map(p => (
                  <button key={p.id} type="button" onClick={() => set('plan', p.id)}
                    className={`relative flex flex-col p-3 border-2 rounded-xl text-center transition-all ${form.plan === p.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    {p.popular && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Popular</div>}
                    <div className="font-bold text-gray-900 text-sm mb-0.5">{p.label}</div>
                    <div className="text-primary-600 font-bold text-xs">{p.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Gym Name *</label>
                  <input required value={form.gymName} onChange={e => set('gymName', e.target.value)} className="input" placeholder="PowerFit Gym" />
                </div>
                <div>
                  <label className="input-label">Owner Name *</label>
                  <input required value={form.ownerName} onChange={e => set('ownerName', e.target.value)} className="input" placeholder="Your name" />
                </div>
                <div>
                  <label className="input-label">Phone *</label>
                  <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="input-label">City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} className="input" placeholder="Mumbai" />
                </div>
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" placeholder="owner@yourgym.com" />
              </div>
              <div>
                <label className="input-label">Password *</label>
                <input type="password" required value={form.password} onChange={e => set('password', e.target.value)} className="input" placeholder="Min 6 characters" />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary btn-lg w-full justify-center disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
            <p className="text-sm text-gray-500">
              Already registered? <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
