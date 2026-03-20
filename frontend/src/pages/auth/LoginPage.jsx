import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Eye, EyeOff, Fingerprint, ArrowRight, Loader2, Shield, Zap, Users } from 'lucide-react'

const DEMOS = [
  { label: 'Admin',   email: 'admin@gym.com',   pw: 'admin123',   role: 'Full access' },
  { label: 'Manager', email: 'manager@gym.com',  pw: 'manager123', role: 'Manage ops' },
  { label: 'Trainer', email: 'trainer@gym.com',  pw: 'trainer123', role: 'Members & plans' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const { show }  = useToast()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setError('') }

  async function submit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please enter your credentials'); return }
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      show('Welcome back! Redirecting...', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  function quickLogin(email, pw) {
    setForm({ email, password: pw })
    setError('')
    setTimeout(async () => {
      setLoading(true)
      try {
        await login(email, pw)
        show('Demo login successful!', 'success')
        navigate('/dashboard')
      } catch { setError('Demo login failed') }
      finally { setLoading(false) }
    }, 300)
  }

  return (
    <div className="min-h-screen flex bg-dark-800">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:flex-col lg:w-5/12 xl:w-1/2 relative overflow-hidden p-12">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(0,196,125,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(0,196,125,.8) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Glow */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-auto">
          <div className="w-11 h-11 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30">
            <Fingerprint className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-white text-xl">FitGym<span className="text-primary-400">Software</span><span className="text-primary-400 text-sm">®</span></div>
            <div className="text-white/40 text-xs">Gym Control Panel</div>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative my-auto">
          <div className="inline-flex items-center gap-2 bg-primary-600/15 border border-primary-600/30 text-primary-400 rounded-full px-3 py-1 text-xs font-semibold mb-6">
            <Zap className="w-3 h-3" /> Trusted by 1200+ Gyms in India
          </div>
          <h1 className="font-heading font-extrabold text-white text-4xl xl:text-5xl leading-tight mb-4">
            Your Gym.<br />
            Your Control.<br />
            <span className="text-primary-400">All in One.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm">
            Complete gym management — members, billing, biometric attendance, WhatsApp alerts and powerful analytics.
          </p>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4 mt-auto">
          {[['1,200+','Gyms'],['5L+','Members'],['₹100Cr+','Processed']].map(([n,l]) => (
            <div key={l} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="font-heading font-extrabold text-white text-xl">{n}</div>
              <div className="text-white/40 text-xs mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-dark-800 text-xl">FitGym<span className="text-primary-600">Software</span>®</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="mb-7">
                <h2 className="font-heading font-extrabold text-2xl text-gray-900 mb-1">Welcome back</h2>
                <p className="text-gray-500 text-sm">Sign in to your gym control panel</p>
              </div>

              {/* Demo accounts */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Demo Access</p>
                <div className="grid grid-cols-3 gap-2">
                  {DEMOS.map(d => (
                    <button key={d.label} onClick={() => quickLogin(d.email, d.pw)}
                      disabled={loading}
                      className="flex flex-col items-center gap-1 p-3 border border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all group disabled:opacity-50">
                      <span className="text-xs font-bold text-gray-700 group-hover:text-primary-700">{d.label}</span>
                      <span className="text-xs text-gray-400 group-hover:text-primary-500">{d.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative text-center"><span className="bg-white px-3 text-xs text-gray-400 font-medium">or sign in with credentials</span></div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="input-label">Email address</label>
                  <input type="text" value={form.email} onChange={e => set('email', e.target.value)}
                    className="input" placeholder="admin@yourgym.com" autoComplete="email" />
                </div>
                <div>
                  <label className="input-label">Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => set('password', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submit(e)}
                      className="input pr-11" placeholder="••••••••" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <button type="button" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary btn-lg w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
              <p className="text-sm text-gray-500">
                New gym owner?{' '}
                <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700">
                  Register your gym →
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            FitGymSoftware® · <a href="tel:+917601026686" className="hover:text-gray-600">+91 7601026686</a>
          </p>
        </div>
      </div>
    </div>
  )
}
