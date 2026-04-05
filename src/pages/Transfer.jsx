import React, { useState, useRef, useEffect, useTransition } from 'react'
import { motion } from 'framer-motion'
import { getCanvasWorker } from '../hooks/useQuantumWorker'
import { eventBus, EVENTS } from '../lib/eventBus'
import * as ApiManager from '../helpers/ApiManager.tsx'
import { shouldRunHeavyEffect, subscribeToPerformanceChanges } from '../perf/performanceGovernor'

const TransferStepTrail = ({ currentStep }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, gap: '20px' }}>
      {[1, 2, 3, 4].map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: currentStep >= s ? 'var(--eco-quantum)' : 'transparent',
            border: `1px solid ${currentStep >= s ? 'var(--eco-quantum)' : 'rgba(0,212,255,0.2)'}`,
            color: currentStep >= s ? '#000' : 'rgba(0,212,255,0.5)',
            fontFamily: 'var(--font-display)', fontWeight: 600,
            boxShadow: currentStep >= s ? 'var(--glow-quantum)' : 'none',
          }}>{s}</div>
        </div>
      ))}
    </div>
  )
}

const TransferPage = () => {
  const [step, setStep] = useState(1) // 1=select, 2=amount, 3=confirm, 4=fired
  const [amount, setAmount] = useState('')
  const [beamFiring, setBeamFiring] = useState(false)
  const beamCanvasRef = useRef()
  const workerRef = useRef()
  const [, startTransition] = useTransition()
  const [canRunBeam, setCanRunBeam] = useState(() => shouldRunHeavyEffect('beam'))
  const [user, setUser] = useState(null)
  const [beneficiaries, setBeneficiaries] = useState([])
  const [selectedBen, setSelectedBen] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    const load = async () => {
      const res = await ApiManager.UserInfo()
      const ben = await ApiManager.BeneficiaryList()
      if (!isActive) return
      setUser(res?.data?.user || null)
      setBeneficiaries(ben?.data || [])
    }
    load()
    return () => { isActive = false }
  }, [])
  
  useEffect(() => {
    const unsub = subscribeToPerformanceChanges(() => {
      setCanRunBeam(shouldRunHeavyEffect('beam'))
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!canRunBeam) {
      workerRef.current?.postMessage({ type: 'STOP', id: 'beam' })
    }
  }, [canRunBeam])
  
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'STOP', id: 'beam' })
      }
    }
  }, [])

  // Particle beam animation — fires on confirm using worker
  const fireQuantumBeam = () => {
    const amountNum = Number(amount || 0)
    if (!selectedBen) {
      setError('Select a recipient entity first.')
      return
    }
    if (!amountNum || amountNum <= 0) {
      setError('Enter a valid amount.')
      return
    }
    if (user && amountNum > user.balance) {
      setError('Insufficient balance for this transfer.')
      return
    }
    setError('')
    setBeamFiring(true)
    setTimeout(() => {
      if (!canRunBeam) {
        // Skip beam effect on low tier, keep flow intact
        setTimeout(() => {
          startTransition(async () => {
            await ApiManager.TransferToBeneficiary(selectedBen._id, { amount: amountNum })
            const res = await ApiManager.UserInfo()
            setUser(res?.data?.user || user)
            eventBus.emit(EVENTS.XP_GAIN, { action: 'TRANSFER' })
            setBeamFiring(false)
            setStep(4)
          })
        }, 3000)
        return
      }
      const canvas = beamCanvasRef.current
      if (canvas && !workerRef.current && typeof canvas.transferControlToOffscreen === 'function') {
        const offscreen = canvas.transferControlToOffscreen()
        workerRef.current = getCanvasWorker()
        workerRef.current.postMessage({ type: 'INIT_OFFSCREEN', id: 'beam', canvas: offscreen }, [offscreen])
      }
      
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'START_BEAM', id: 'beam' })
      }
      
      // Simulate beam duration and transition to next step
      setTimeout(() => {
        startTransition(async () => {
          await ApiManager.TransferToBeneficiary(selectedBen._id, { amount: amountNum })
          const res = await ApiManager.UserInfo()
          setUser(res?.data?.user || user)
          eventBus.emit(EVENTS.XP_GAIN, { action: 'TRANSFER' })
          setBeamFiring(false)
          setStep(4)
        })
      }, 3000)
    }, 100)
  }

  // Amount input — font size grows with value (bigger money = bigger text)
  const displayFontSize = Math.max(28, Math.min(64, 64 - (amount.length * 3.5)))

  return (
    <div className="transfer-page" style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Step indicator with particle trail */}
      <TransferStepTrail currentStep={step} />
      
      {/* Transfer animation canvas — shown during transfer */}
      {beamFiring && canRunBeam && (
        <canvas
          ref={beamCanvasRef}
          width={520} height={80}
          style={{ width: '100%', display: 'block', marginBottom: 24 }}
        />
      )}

      {/* Step 1 - Select */}
      {step === 1 && !beamFiring && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-data)', color: 'var(--eco-quantum)' }}>SELECT RECIPIENT ENTITY</p>
          <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
            {beneficiaries.map((b) => (
              <button
                key={b._id}
                onClick={() => {
                  setSelectedBen(b)
                  setStep(2)
                }}
                style={{
                  padding: '12px 18px',
                  background: 'rgba(10,22,40,0.6)',
                  border: `1px solid ${selectedBen?._id === b._id ? 'var(--eco-quantum)' : 'rgba(0,212,255,0.2)'}`,
                  color: '#fff',
                  cursor: 'pointer',
                  borderRadius: 10,
                  fontFamily: 'var(--font-data)',
                  letterSpacing: '0.05em',
                }}
              >
                {b.nickname} · {b.bank} · {b.account_no}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2 — Amount input */}
      {step === 2 && !beamFiring && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <p style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--eco-quantum)', letterSpacing: '0.3em', marginBottom: 16 }}>
            TRANSFER AMOUNT
          </p>
          
          <motion.div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'rgba(0,212,255,0.6)' }}>PKR</span>
            <motion.input
              animate={{ fontSize: displayFontSize }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                color: '#fff', width: '200px', textAlign: 'center',
                textShadow: amount ? '0 0 40px rgba(0,212,255,0.6)' : 'none',
                caretColor: 'var(--eco-quantum)',
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 16 }}
          >
            <div style={{ height: 3, background: 'rgba(0,212,255,0.1)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${Math.min((Number(amount || 0) / 1000000) * 100, 100)}%` }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--eco-quantum), var(--eco-plasma))',
                  boxShadow: '0 0 8px var(--eco-quantum)',
                }}
              />
            </div>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.5)', marginTop: 6 }}>
              TRANSFER ENERGY: {((Number(amount || 0) / 1000000) * 100).toFixed(2)}% of field capacity
            </p>

            <div style={{ marginTop: 12 }}>
              <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,212,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (Number(amount || 0) / Math.max(1, user?.balance || 1)) * 100)}%`,
                  background: 'linear-gradient(90deg, var(--eco-quantum), var(--eco-solar))',
                  boxShadow: '0 0 10px rgba(0,212,255,0.3)',
                }} />
              </div>
              <p style={{ marginTop: 8, color: 'rgba(0,212,255,0.6)', fontFamily: 'var(--font-data)', fontSize: 11 }}>
                AVAILABLE BALANCE: PKR {user?.balance?.toLocaleString() || '—'}
              </p>
            </div>

            {error ? (
              <p style={{ marginTop: 12, color: 'var(--eco-pulsar)', fontFamily: 'var(--font-data)', fontSize: 11 }}>
                {error}
              </p>
            ) : null}
            
            <button
              onClick={() => setStep(3)}
              style={{
                padding: '12px 24px', background: 'var(--eco-station)',
                border: '1px solid var(--eco-quantum)', color: '#fff',
                marginTop: '30px', cursor: 'pointer', borderRadius: '8px'
              }}
            >
              CONFIRM MAGNITUDE
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Step 3 — Hold to launch */}
      {step === 3 && !beamFiring && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-data)', color: 'var(--eco-quantum)' }}>CONFIRM TRANSFER</p>
          <p style={{ color: '#fff', marginTop: 12 }}>
            Send PKR {Number(amount || 0).toLocaleString()} to {selectedBen?.nickname || 'recipient'}?
          </p>
          {error ? (
            <p style={{ marginTop: 12, color: 'var(--eco-pulsar)', fontFamily: 'var(--font-data)', fontSize: 11 }}>
              {error}
            </p>
          ) : null}
          <div style={{ marginTop: 18 }}>
            <HoldToLaunch onFire={fireQuantumBeam} amount={Number(amount)} />
          </div>
        </div>
      )}
      
      {/* Step 4 — Confirmation */}
      {step === 4 && <TransferConfirmationPulsar amount={amount} />}
    </div>
  )
}

// ─── Hold to Launch — 3 second charged press ──────────────────────────────
const HoldToLaunch = ({ onFire, amount }) => {
  const [held, setHeld] = useState(false)
  const [progress, setProgress] = useState(0)
  const interval = useRef()

  const startHold = () => {
    setHeld(true)
    interval.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval.current); onFire(); return 100 }
        return p + 1.5  // fills in ~2.7s
      })
    }, 40)
  }
  const release = () => {
    clearInterval(interval.current)
    if (progress < 100) { setHeld(false); setProgress(0) }
  }

  return (
    <motion.button
      onMouseDown={startHold} onMouseUp={release} onMouseLeave={release}
      onTouchStart={startHold} onTouchEnd={release}
      whileHover={{ scale: 1.02 }}
      style={{
        width: '100%', padding: '18px', border: 'none',
        background: 'transparent', cursor: 'pointer',
        position: 'relative', borderRadius: 12, overflow: 'hidden',
        outline: `1px solid rgba(0,212,255,${0.2 + progress * 0.008})`,
        boxShadow: held ? `0 0 ${progress}px rgba(0,212,255,${progress * 0.005})` : 'none',
      }}
    >
      <motion.div
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0 }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          background: 'linear-gradient(90deg, rgba(0,212,255,0.1), rgba(123,79,255,0.1))',
        }}
      />
      <span style={{
        position: 'relative',
        fontFamily: 'var(--font-display)', fontSize: 14,
        letterSpacing: '0.2em', color: '#fff',
      }}>
        {progress === 0 ? 'HOLD TO SEND TRANSFER' :
         progress < 100 ? `CHARGING ${progress.toFixed(0)}% · PKR ${Number(amount).toLocaleString()}` :
         'BEAM AWAY'}
      </span>
    </motion.button>
  )
}

// ─── Transfer success — Pulsar burst ──────────────────────────────────────
const TransferConfirmationPulsar = ({ amount }) => {
  useEffect(() => {
    // Particle explosion
    import('canvas-confetti').then(({ default: confetti }) => {
      const burst = (angle, x) => confetti({
        particleCount: 60,
        angle, spread: 45,
        origin: { x, y: 0.5 },
        colors: ['#00D4FF', '#7B4FFF', '#00FF87', '#FFB830'],
        shapes: ['circle'],
        scalar: 0.9, gravity: 0.6,
      })
      burst(60, 0.3); burst(120, 0.7)
    })
    
    // EVENT BUS DRIVEN XP GAIN
    eventBus.emit(EVENTS.XP_GAIN, { action: 'TRANSFER' })
  }, [amount])

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 16 }}
      style={{ textAlign: 'center', padding: '40px 20px' }}
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1], boxShadow: ['0 0 20px var(--eco-nova)', '0 0 60px var(--eco-nova)', '0 0 20px var(--eco-nova)'] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,135,0.3), transparent)',
          border: '1px solid var(--eco-nova)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 32,
        }}
      >
        ⚡
      </motion.div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#fff', letterSpacing: '0.1em' }}>
        TRANSFER COMPLETE
      </h2>
      <p style={{ fontFamily: 'var(--font-data)', color: 'var(--eco-nova)', marginTop: 8 }}>
        PKR {Number(amount).toLocaleString()} entangled successfully
      </p>
    </motion.div>
  )
}

export default TransferPage
