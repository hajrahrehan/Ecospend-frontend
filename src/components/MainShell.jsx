import React, { useEffect, useState, useTransition } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import * as ApiManager from '../helpers/ApiManager.tsx'
import { shouldRunHeavyEffect, subscribeToPerformanceChanges } from '../perf/performanceGovernor'

const NavItem = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'block',
        padding: '10px 12px',
        borderRadius: 10,
        textDecoration: 'none',
        color: isActive ? '#000' : 'rgba(0,212,255,0.8)',
        background: isActive ? 'var(--eco-quantum)' : 'transparent',
        border: `1px solid ${isActive ? 'var(--eco-quantum)' : 'rgba(0,212,255,0.18)'}`,
        fontFamily: 'var(--font-data)',
        letterSpacing: '0.08em',
        fontSize: 12,
        boxShadow: isActive ? '0 0 18px rgba(0,212,255,0.4)' : 'none',
      })}
    >
      {label}
    </NavLink>
  )
}

const MainShell = () => {
  const [user, setUser] = useState(null)
  const [, startTransition] = useTransition()
  const navigate = useNavigate()
  const [canBlur, setCanBlur] = useState(() => shouldRunHeavyEffect('backdropBlur'))

  useEffect(() => {
    let isActive = true
    const load = async () => {
      const res = await ApiManager.UserInfo()
      if (!isActive) return
      setUser(res?.data?.user || null)
    }
    load()
    return () => { isActive = false }
  }, [])

  useEffect(() => {
    const unsub = subscribeToPerformanceChanges(() => {
      setCanBlur(shouldRunHeavyEffect('backdropBlur'))
    })
    return () => unsub()
  }, [])

  const logout = () => {
    sessionStorage.removeItem('@token')
    sessionStorage.removeItem('@admintoken')
    startTransition(() => navigate('/auth'))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 240,
          padding: '24px 16px',
          background: 'rgba(6,12,24,0.85)',
          borderRight: '1px solid rgba(0,212,255,0.15)',
          backdropFilter: canBlur ? 'blur(16px)' : 'none',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.2em', fontSize: 16 }}>
            ECO<span style={{ color: 'var(--eco-quantum)' }}>SPEND</span>
          </div>
          <div style={{ marginTop: 6, fontFamily: 'var(--font-data)', fontSize: 10, color: 'rgba(0,212,255,0.6)' }}>
            NAVIGATION
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <NavItem to="/main/dashboard" label="DASHBOARD" />
          <NavItem to="/main/transfer" label="TRANSFER" />
          <NavItem to="/main/ecoai" label="ECOAI" />
          <NavItem to="/main/ecomall" label="ECOMALL" />
          <NavItem to="/main/profile" label="PROFILE" />
          <NavItem to="/main/cards" label="CARDS" />
          <NavItem to="/main/support" label="SUPPORT" />
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            padding: '14px 24px',
            background: 'rgba(5,10,20,0.85)',
            borderBottom: '1px solid rgba(0,212,255,0.15)',
            backdropFilter: canBlur ? 'blur(16px)' : 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.15em', fontSize: 14 }}>
              {user ? `${user.fname} ${user.lname}` : 'ASTRONAUT'}
            </div>
            <div style={{ fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.6)', fontSize: 10 }}>
              LEVEL: {user?.type || 'Standard'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid rgba(0,212,255,0.25)',
              background: 'rgba(0,212,255,0.08)',
              color: '#fff',
              fontFamily: 'var(--font-data)',
              fontSize: 11,
              letterSpacing: '0.1em',
            }}>
              BALANCE: PKR {user?.balance?.toLocaleString() || '—'}
            </div>
            <button
              onClick={logout}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid rgba(0,212,255,0.35)',
                background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,79,255,0.2))',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.15em',
                cursor: 'pointer',
              }}
            >
              LOGOUT
            </button>
          </div>
        </header>

        <main style={{ padding: '24px 24px 48px', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainShell
