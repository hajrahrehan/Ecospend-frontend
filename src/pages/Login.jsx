import React, { useEffect, useRef, useState, useTransition } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getCanvasWorker } from '../hooks/useQuantumWorker'
import { eventBus, EVENTS } from '../lib/eventBus'

const LoginPage = () => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-400, 400], [10, -10])
  const rotateY = useTransform(mouseX, [-400, 400], [-10, 10])
  const [scanComplete, setScanComplete] = useState(false)
  const canvasRef = useRef()
  const [, startTransition] = useTransition()
  const navigate = useNavigate()

  // Draw quantum wave probability display via Worker + OffscreenCanvas
  useEffect(() => {
    const canvas = canvasRef.current
    const worker = getCanvasWorker()
    if (canvas && typeof canvas.transferControlToOffscreen === 'function' && !canvas.hasTransferred) {
      const offscreen = canvas.transferControlToOffscreen()
      canvas.hasTransferred = true
      worker.postMessage({ type: 'INIT_OFFSCREEN', id: 'loginWave', canvas: offscreen }, [offscreen])
    }
    
    if (worker) {
      worker.postMessage({ type: 'START_WAVE', id: 'loginWave' })
    }

    return () => {
      if (worker) worker.postMessage({ type: 'STOP', id: 'loginWave' })
    }
  }, [])

  const handleLogin = () => {
    startTransition(() => {
      eventBus.emit(EVENTS.XP_GAIN, { action: 'LOGIN' })
      navigate('/main/dashboard')
    })
  }

  return (
    <div
      className="login-scene"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseMove={(e) => {
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        mouseX.set(e.clientX - cx)
        mouseY.set(e.clientY - cy)
      }}
    >
      {/* Scan line animation — sweeping top to bottom on entry */}
      <motion.div
        className="scan-beam"
        initial={{ y: '-100%', opacity: 1 }}
        animate={{ y: '100vh', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        style={{
          position: 'fixed', left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, var(--eco-quantum), transparent)',
          boxShadow: 'var(--glow-quantum)',
          pointerEvents: 'none', zIndex: 100,
        }}
        onAnimationComplete={() => setScanComplete(true)}
      />
      
      {/* The quantum wave display — sits below card */}
      <canvas
        ref={canvasRef}
        width={400} height={60}
        style={{
          position: 'absolute',
          bottom: 'calc(50% - 330px)',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.6,
        }}
      />
      
      {/* Login card — 3D tilt floating panel */}
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.8, rotateX: -20 }}
        animate={scanComplete ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }}
        style={{
          rotateX, rotateY,
          transformStyle: 'preserve-3d',
          perspective: 1000,
          transformPerspective: 1200,
        }}
      >
        <div className="login-card" style={{
          width: 420,
          background: 'rgba(10, 22, 40, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 20,
          padding: '0 0 32px',
          boxShadow: '0 0 80px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}>
          
          {/* Header — holographic banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,79,255,0.15))',
            borderBottom: '1px solid rgba(0,212,255,0.15)',
            padding: '28px 32px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Moving grid lines in header */}
            <motion.div
              animate={{ backgroundPositionX: ['0px', '40px'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(90deg, transparent 39px, rgba(0,212,255,0.06) 40px), linear-gradient(rgba(0,212,255,0.06) 39px, transparent 40px)',
                backgroundSize: '40px 40px',
              }}
            />
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28, fontWeight: 600,
              color: '#fff', textAlign: 'center',
              letterSpacing: '0.1em',
              position: 'relative',
              margin: 0,
            }}>
              ECO<span style={{ color: 'var(--eco-quantum)' }}>SPEND</span>
            </h1>
            <p style={{
              textAlign: 'center', fontSize: 11,
              letterSpacing: '0.35em', color: 'rgba(0,212,255,0.7)',
              fontFamily: 'var(--font-data)',
              marginTop: 6, position: 'relative',
            }}>QUANTUM FINANCIAL INTERFACE</p>
          </div>
          
          <div style={{ padding: '32px 32px 0' }}>
            <QuantumInput label="IDENTITY CODE" type="email" placeholder="user@cosmos.io" />
            <QuantumInput label="ENCRYPTION KEY" type="password" placeholder="••••••••••••" />
            <QuantumSignInButton onSubmit={handleLogin} />
            
            <button
              type="button"
              onClick={() => startTransition(() => navigate('/register'))}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                marginTop: 20,
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-data)',
                fontSize: 12,
                color: 'var(--eco-quantum)',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              INITIALIZE NEW ACCOUNT →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Quantum Input — "Signal lock" animation ───────────────────────────────
const QuantumInput = ({ label, type, placeholder }) => {
  const [focused, setFocused] = useState(false)
  const [locked, setLocked] = useState(false)

  return (
    <div style={{ marginBottom: 20, position: 'relative' }}>
      
      {/* Label */}
      <motion.label
        animate={{
          color: focused ? 'var(--eco-quantum)' : 'rgba(0,212,255,0.45)',
          letterSpacing: focused ? '0.3em' : '0.2em',
        }}
        style={{
          display: 'block', fontSize: 10,
          fontFamily: 'var(--font-data)',
          marginBottom: 6, transition: 'all 0.2s',
        }}
      >
        {label}
      </motion.label>
      
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); setLocked(!!e.target.value) }}
          onChange={(e) => setLocked(!!e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(0,212,255,0.04)',
            border: `1px solid ${focused ? 'rgba(0,212,255,0.6)' : 'rgba(0,212,255,0.12)'}`,
            borderRadius: 8,
            padding: '12px 44px 12px 14px',
            color: '#fff',
            fontFamily: 'var(--font-data)', fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 20px rgba(0,212,255,0.12), inset 0 0 10px rgba(0,212,255,0.04)' : 'none',
          }}
        />
        
        {/* Lock icon — appears when field has value */}
        <motion.div
          animate={{ scale: locked ? 1 : 0, opacity: locked ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--eco-nova)' }}
        >
          ⬡
        </motion.div>
      </div>
      
      {/* Scanning underline glow */}
      <motion.div
        animate={{ scaleX: focused ? 1 : 0 }}
        style={{
          height: 1, marginTop: -1,
          background: 'linear-gradient(90deg, transparent, var(--eco-quantum), transparent)',
          transformOrigin: 'center',
          boxShadow: '0 0 8px var(--eco-quantum)',
        }}
        transition={{ duration: 0.25 }}
      />
    </div>
  )
}

// ─── Sign In Button — Plasma Charge ───────────────────────────────────────
const QuantumSignInButton = ({ onSubmit }) => {
  const [charging, setCharging] = useState(false)
  const [chargeLevel, setChargeLevel] = useState(0)
  const intervalRef = useRef()

  const startCharge = () => {
    setCharging(true)
    intervalRef.current = setInterval(() => {
      setChargeLevel(p => {
        if (p >= 100) { clearInterval(intervalRef.current); onSubmit?.(); return 100 }
        return p + 5
      })
    }, 30)
  }
  const stopCharge = () => {
    clearInterval(intervalRef.current)
    if (chargeLevel < 100) { setCharging(false); setChargeLevel(0) }
  }

  return (
    <motion.button
      type="button"
      onPointerDown={startCharge}
      onPointerUp={stopCharge}
      onPointerLeave={stopCharge}
      onClick={() => {
        stopCharge()
        onSubmit?.()
      }}
      whileHover={{ scale: 1.02 }}
      style={{
        width: '100%', padding: '14px',
        background: `linear-gradient(135deg, rgba(0,212,255,${0.1 + chargeLevel*0.005}), rgba(123,79,255,${0.1 + chargeLevel*0.004}))`,
        border: `1px solid rgba(0,212,255,${0.3 + chargeLevel*0.007})`,
        borderRadius: 10, color: '#fff', cursor: 'pointer',
        fontFamily: 'var(--font-display)',
        fontSize: 14, letterSpacing: '0.2em',
        position: 'relative', overflow: 'hidden',
        boxShadow: charging ? `0 0 ${20 + chargeLevel}px rgba(0,212,255,${chargeLevel*0.006})` : 'none',
        transition: 'all 0.1s',
      }}
    >
      {/* Charge fill bar */}
      <motion.div
        animate={{ width: `${chargeLevel}%` }}
        transition={{ duration: 0 }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          background: 'rgba(0,212,255,0.08)',
        }}
      />
      <span style={{ position: 'relative' }}>
        {chargeLevel === 0 ? 'AUTHENTICATE' : chargeLevel < 100 ? `CHARGING ${chargeLevel}%` : 'ACCESSING...'}
      </span>
    </motion.button>
  )
}

export default LoginPage
