// Dashboard.jsx
// Purpose: Main account overview + gravity well visualization.
// Depends on: Canvas2D worker, performanceGovernor gating for heavy effects.
// Used by: MainShell (/main/dashboard).
import React, { useEffect, useRef, useState, useTransition, memo } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { wealthEnergy } from '../lib/physics'
import { useNavigate } from 'react-router-dom'

import { getCanvasWorker } from '../hooks/useQuantumWorker'
import * as ApiManager from '../helpers/ApiManager.tsx'
import { shouldRunHeavyEffect, subscribeToPerformanceChanges } from '../perf/performanceGovernor'

// ─── Balance Gravity Well — the centrepiece (OffscreenCanvas) ────────────────
const BalanceGravityWell = memo(({ balance, canRunWell }) => {
  const energy = wealthEnergy(balance)
  const canvasRef = useRef()
  const workerRef = useRef()

  useEffect(() => {
    if (!canRunWell) {
      if (canvasRef.current && !canvasRef.current.hasTransferred) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, 340, 240)
          ctx.fillStyle = '#00D4FF11'
          ctx.fillRect(0, 0, 340, 240)
        }
      }
      workerRef.current?.postMessage({ type: 'STOP', id: 'gravityWell' })
      return
    }
    // Only init transfer once
    if (canvasRef.current && !workerRef.current && typeof canvasRef.current.transferControlToOffscreen === 'function') {
      const offscreen = canvasRef.current.transferControlToOffscreen()
      canvasRef.current.hasTransferred = true
      workerRef.current = getCanvasWorker()
      workerRef.current.postMessage({ type: 'INIT_OFFSCREEN', id: 'gravityWell', canvas: offscreen }, [offscreen])
    }
    
    // Fallback if no offscreen support
    if (!workerRef.current && canvasRef.current) {
        // Very basic fallback drawing, to skip worker
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0,0,340,240)
        ctx.fillStyle = '#00D4FF11'
        ctx.fillRect(0,0,340,240)
    }

    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'START_BALANCE_WELL', id: 'gravityWell', payload: { energy } })
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'STOP', id: 'gravityWell' })
      }
    }
  }, [energy, canRunWell])

  return (
    <canvas ref={canvasRef} width={340} height={240}
      style={{ display: 'block', margin: '0 auto' }} />
  )
})

// ─── Balance Number — Relativistic counter ────────────────────────────────
const BalanceCounter = ({ value, currency = 'PKR' }) => {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: {
      // Critically damped spring: ζ=1, ω=3 → no oscillation, smooth arrival
      mass: 2, tension: 18, friction: 14
    },
    delay: 400,
  })

  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <p style={{
        fontFamily: 'var(--font-data)', fontSize: 11,
        color: 'var(--eco-quantum)', letterSpacing: '0.3em',
        marginBottom: 8,
      }}>ACCOUNT BALANCE</p>
      <animated.div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 42, fontWeight: 700,
        color: '#fff',
        textShadow: '0 0 30px rgba(0,212,255,0.5)',
        letterSpacing: '0.05em',
      }}>
        {number.to(n => `${currency} ${n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
      </animated.div>
    </div>
  )
}

// ─── Transaction Feed — "Particle Collision Events" ───────────────────────
const TransactionCollisionLog = memo(({ transactions }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
  >
    {transactions.map((tx, i) => {
      const energy = Math.min(tx.amount / 50000, 1)
      const isCredit = tx.type === 'credit'
      const color = isCredit ? 'var(--eco-nova)' : 'var(--eco-pulsar)'

      return (
        <motion.div
          key={tx.id}
          variants={{
            hidden: { opacity: 0, x: isCredit ? -30 : 30, scale: 0.9 },
            visible: { opacity: 1, x: 0, scale: 1 }
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          whileHover={{ x: isCredit ? 6 : -6, borderColor: color }}
          style={{
            background: 'rgba(10,22,40,0.6)',
            border: `1px solid rgba(0,212,255,0.08)`,
            borderLeft: `3px solid ${color}`,
            borderRadius: 8, padding: '12px 16px',
            marginBottom: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12,
            transition: 'border-color 0.2s, transform 0.2s',
          }}
        >
          {/* Collision energy indicator */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `radial-gradient(circle, ${color}30, transparent)`,
            border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color,
            flexShrink: 0,
          }}>
            {isCredit ? '↓' : '↑'}
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: '#fff', fontFamily: 'var(--font-body)', marginBottom: 2 }}>
              {tx.description}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(0,212,255,0.5)', fontFamily: 'var(--font-data)' }}>
              {tx.date} · E={energy.toFixed(3)} GeV
            </p>
          </div>
          
          {/* Amount with energy glow proportional to size */}
          <motion.span
            initial={{ scale: 1.4, color }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.06 + 0.3, type: 'spring' }}
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 14, fontWeight: 600, color,
              textShadow: `0 0 ${energy * 20}px ${color}`,
            }}
          >
            {isCredit ? '+' : '-'}PKR {tx.amount.toLocaleString()}
          </motion.span>
        </motion.div>
      )
    })}
  </motion.div>
))

const DashboardPage = () => {
  const [, startTransition] = useTransition()
  const [canRunWell, setCanRunWell] = useState(() => shouldRunHeavyEffect('balanceWell'))
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let isActive = true
    const fetchData = async () => {
      const res = await ApiManager.UserInfo()
      if (!res?.data) return
      const statement = await ApiManager.GetStatement({
        start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      })
      if (!isActive) return
      setUser(res.data.user)
      const list = (statement?.data || []).slice(0, 6).map((tx) => ({
        id: tx._id,
        type: tx.type,
        amount: tx.credit || tx.debit || 0,
        description: tx.name,
        date: new Date(tx.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
      setTransactions(list)
    }
    fetchData()
    return () => { isActive = false }
  }, [])

  useEffect(() => {
    const unsub = subscribeToPerformanceChanges(() => {
      setCanRunWell(shouldRunHeavyEffect('balanceWell'))
    })
    return () => unsub()
  }, [])
  
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <BalanceGravityWell balance={user?.balance || 0} canRunWell={canRunWell} />
      <BalanceCounter value={user?.balance || 0} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginTop: 12,
        color: '#fff',
        fontFamily: 'var(--font-data)',
        fontSize: 12,
      }}>
        <div style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 10, padding: 12 }}>
          ACCOUNT NUMBER
          <div style={{ marginTop: 6, color: 'var(--eco-quantum)', letterSpacing: '0.15em' }}>{user?.account_no || '—'}</div>
        </div>
        <div style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 10, padding: 12 }}>
          ACCOUNT LEVEL
          <div style={{ marginTop: 6, color: 'var(--eco-solar)', letterSpacing: '0.1em' }}>{user?.type || 'Standard'}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
        <motion.button
          onClick={() => startTransition(() => navigate('/main/transfer'))}
          whileHover={{ scale: 1.02 }}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(123,79,255,0.18))',
            border: '1px solid rgba(0,212,255,0.35)',
            borderRadius: 12,
            color: '#fff',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.2em',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(0,212,255,0.15)',
          }}
        >
          QUICK SEND MONEY
        </motion.button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <motion.button
            onClick={() => startTransition(() => navigate('/main/ecoai'))}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '12px 14px',
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 12,
              color: '#fff',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.15em',
              cursor: 'pointer',
            }}
          >
            OPEN ECOAI
          </motion.button>
          <motion.button
            onClick={() => startTransition(() => navigate('/main/ecomall'))}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '12px 14px',
              background: 'rgba(123,79,255,0.12)',
              border: '1px solid rgba(123,79,255,0.35)',
              borderRadius: 12,
              color: '#fff',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.15em',
              cursor: 'pointer',
            }}
          >
            VISIT ECOMALL
          </motion.button>
        </div>
      </div>
      <h3 style={{
        fontFamily: 'var(--font-display)', color: '#fff', fontSize: '18px',
        borderBottom: '1px solid rgba(0,212,255,0.2)', paddingBottom: '10px', marginTop: '40px',
        marginBottom: '20px'
      }}>
        PARTICLE COLLISION LOG
      </h3>
      <TransactionCollisionLog transactions={transactions} />
    </div>
  )
}

export default DashboardPage
