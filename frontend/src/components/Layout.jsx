import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, Clock, CreditCard, UserCog,
  Target, Dumbbell, BarChart3, Settings, LogOut, Menu,
  X, Bell, ChevronDown, Fingerprint, Dumbbell as GymIcon
} from 'lucide-react'
import Avatar from './Avatar'

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members',    icon: Users,           label: 'Members' },
  { to: '/attendance', icon: Clock,           label: 'Attendance' },
  { to: '/billing',    icon: CreditCard,      label: 'Billing' },
  { to: '/staff',      icon: UserCog,         label: 'Staff' },
  { to: '/leads',      icon: Target,          label: 'Leads CRM' },
  { to: '/workout',    icon: Dumbbell,        label: 'Workout Plans' },
  { to: '/reports',    icon: BarChart3,       label: 'Reports' },
  { to: '/settings',   icon: Settings,        label: 'Settings' },
]

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function doLogout() { logout(); navigate('/login') }

  return (
    <div className="flex flex-col h-full bg-dark-800 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Fingerprint className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-white text-base leading-tight">
              FitGym<span className="text-primary-400">Pro</span>
            </div>
            <div className="text-white/30 text-xs truncate max-w-28">{user?.gymName || 'Control Panel'}</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <div className="text-white/25 text-xs font-bold uppercase tracking-widest px-3 py-2">Main</div>
        {NAV_ITEMS.slice(0, 4).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
        <div className="text-white/25 text-xs font-bold uppercase tracking-widest px-3 py-2 pt-4">Manage</div>
        {NAV_ITEMS.slice(4).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <Avatar name={user?.name || 'Admin'} size={8} />
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">{user?.name || 'Admin'}</div>
            <div className="text-white/40 text-xs capitalize">{user?.role || 'admin'}</div>
          </div>
          <button onClick={doLogout} title="Logout"
            className="text-white/30 hover:text-red-400 transition-colors p-1.5 hover:bg-white/5 rounded-lg">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-56 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden flex flex-col shadow-2xl">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-3 flex-shrink-0 shadow-sm z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-icon p-2">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {/* Notifications */}
          <button className="btn-icon relative p-2">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          {/* Profile */}
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 pl-2 pr-1 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              <Avatar name={user?.name || 'Admin'} size={8} />
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-gray-800 leading-tight">{user?.name || 'Admin'}</div>
                <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-20">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <div className="text-sm font-bold text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                  </div>
                  <button onClick={() => { navigate('/settings'); setProfileOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button onClick={() => { logout(); navigate('/login') }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
