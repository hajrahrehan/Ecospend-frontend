import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { wealthEnergy, keplerPosition } from '../lib/physics'

// ─── Balance Gravity Well — the centrepiece ───────────────────────────────
// Balance is visualized as a gravity well whose depth = wealthEnergy(balance)
// Orbiting rings represent financial health metrics
const BalanceGravityWell = ({ balance }) => {
  const energy = wealthEnergy(balance)
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    let t = 0, raf

    const rings = [
      { rx: 80 * energy + 30, ry: 30, speed: 0.008, color: '#00D4FF', label: 'BALANCE' },
      { rx: 110 * energy + 40, ry: 42, speed: -0.005, color: '#00FF87', label: 'INCOME' },
      { rx: 140 * energy + 50, ry: 55, speed: 0.003, color: '#7B4FFF', label: 'SPEND' },
    ]

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Draw gravity well depression (concentric circles fading outward)
      for (let r = 5; r < 120; r += 8) {
        const intensity = Math.max(0, 1 - r / 120) * energy
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,212,255,${intensity * 0.3})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Central singularity — pulsing core
      const pulse = 0.8 + 0.2 * Math.sin(t * 3)
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20 * pulse)
      grd.addColorStop(0, 'rgba(0,212,255,0.9)')
      grd.addColorStop(0.4, 'rgba(0,212,255,0.3)')
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(cx, cy, 20 * pulse, 0, Math.PI * 2)
      ctx.fill()

      // Draw orbital rings + traveling nodes
      rings.forEach((ring, i) => {
        // Elliptical orbit path
        ctx.beginPath()
        ctx.ellipse(cx, cy, ring.rx, ring.ry, Math.PI / 6 * i, 0, Math.PI * 2)
        ctx.strokeStyle = `${ring.color}20`
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Kepler position of traveling dot
        const pos = keplerPosition(t, ring.rx, ring.ry, ring.speed, i * Math.PI * 0.66)
        const dx = pos.x * Math.cos(Math.PI / 6 * i) - pos.y * Math.sin(Math.PI / 6 * i)
        const dy = pos.x * Math.sin(Math.PI / 6 * i) + pos.y * Math.cos(Math.PI / 6 * i)

        const dotGrd = ctx.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, 8)
        dotGrd.addColorStop(0, ring.color + 'FF')
        dotGrd.addColorStop(1, ring.color + '00')
        ctx.fillStyle = dotGrd
        ctx.beginPath()
        ctx.arc(cx + dx, cy + dy, 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2)
        ctx.fill()
      })

      t += 0.016
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [balance, energy])

  return (
    <canvas ref={canvasRef} width={340} height={240}
      style={{ display: 'block', margin: '0 auto' }} />
  )
}

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
      }}>QUANTUM BALANCE FIELD</p>
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
const TransactionCollisionLog = ({ transactions }) => (
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
)

const DashboardPage = () => {
  const dummyTransactions = [
    { id: 1, type: 'credit', amount: 45000, description: 'Direct Deposit', date: 'Oct 12' },
    { id: 2, type: 'debit', amount: 1250, description: 'Coffee Station', date: 'Oct 11' },
    { id: 3, type: 'debit', amount: 15000, description: 'Power Recharge', date: 'Oct 10' },
  ]
  
  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <BalanceGravityWell balance={250000} />
      <BalanceCounter value={250000} />
      <h3 style={{
        fontFamily: 'var(--font-display)', color: '#fff', fontSize: '18px',
        borderBottom: '1px solid rgba(0,212,255,0.2)', paddingBottom: '10px', marginTop: '40px',
        marginBottom: '20px'
      }}>
        PARTICLE COLLISION LOG
      </h3>
      <TransactionCollisionLog transactions={dummyTransactions} />
    </div>
  )
}

export default DashboardPage
