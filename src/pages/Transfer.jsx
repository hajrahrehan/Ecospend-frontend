import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGamificationStore } from '../store/gamification'
import { quantumToast } from '../lib/toast'

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

  // Particle beam animation — fires on confirm
  const fireQuantumBeam = () => {
    setBeamFiring(true)
    setTimeout(() => {
      const canvas = beamCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const W = canvas.width, H = canvas.height
      let t = 0

      const particles = Array.from({ length: 60 }, (_, i) => ({
        delay: i * 0.02,
        phase: (Math.random() - 0.5) * 0.4,
        amp: (Math.random() - 0.5) * 30,
        omega: 8 + Math.random() * 4,
        speed: 0.4 + Math.random() * 0.3,
        size: Math.random() * 3 + 1,
      }))

      const draw = () => {
        ctx.fillStyle = 'rgba(0,0,15,0.3)'
        ctx.fillRect(0, 0, W, H)

        particles.forEach(p => {
          const lt = Math.max(0, t - p.delay)
          if (lt <= 0) return
          const progress = lt * p.speed
          if (progress > 1.2) return

          const x = W * Math.min(progress, 1)
          const decay = Math.exp(-p.omega * 0.1 * lt)
          const y = H / 2 + p.amp * Math.sin(p.omega * lt + p.phase) * decay

          const alpha = Math.max(0, 1 - Math.max(0, progress - 0.8) * 5)
          const grd = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3)
          grd.addColorStop(0, `rgba(0,212,255,${alpha})`)
          grd.addColorStop(1, 'transparent')
          ctx.fillStyle = grd
          ctx.beginPath()
          ctx.arc(x, y, p.size * 3, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`
          ctx.beginPath()
          ctx.arc(x, y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        })

        t += 0.025
        if (t < 3) requestAnimationFrame(draw)
        else {
          setBeamFiring(false)
          setStep(4)
        }
      }
      draw()
    }, 100) // Slight delay to ensure canvas mounts before drawing
  }

  // Amount input — font size grows with value (bigger money = bigger text)
  const displayFontSize = Math.max(28, Math.min(64, 64 - (amount.length * 3.5)))

  return (
    <div className="transfer-page" style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Step indicator with particle trail */}
      <TransferStepTrail currentStep={step} />
      
      {/* Quantum beam canvas — shown during transfer */}
      {beamFiring && (
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
          <button
            onClick={() => setStep(2)}
            style={{
              padding: '12px 24px', background: 'var(--eco-station)',
              border: '1px solid var(--eco-quantum)', color: '#fff',
              marginTop: '20px', cursor: 'pointer', borderRadius: '8px'
            }}
          >
            John Doe (0x391...)
          </button>
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
            QUANTUM TRANSFER MAGNITUDE
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
          
          {/* Energy meter — shows transfer intensity */}
          {Number(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 16 }}
            >
              <div style={{ height: 3, background: 'rgba(0,212,255,0.1)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${Math.min((Number(amount) / 1000000) * 100, 100)}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--eco-quantum), var(--eco-plasma))',
                    boxShadow: '0 0 8px var(--eco-quantum)',
                  }}
                />
              </div>
              <p style={{ fontSize: 10, fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.5)', marginTop: 6 }}>
                TRANSFER ENERGY: {((Number(amount) / 1000000) * 100).toFixed(2)}% of field capacity
              </p>
              
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
          )}
        </motion.div>
      )}

      {/* Step 3 — Hold to launch */}
      {step === 3 && !beamFiring && (
        <HoldToLaunch onFire={fireQuantumBeam} amount={Number(amount)} />
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
        {progress === 0 ? 'HOLD TO FIRE QUANTUM BEAM' :
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
    
    // Wire up gamification + toast
    useGamificationStore.getState().addXP('TRANSFER')
    quantumToast(`PKR ${Number(amount).toLocaleString()} quantum beam fired.`, 'success')
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
        QUANTUM TRANSFER COMPLETE
      </h2>
      <p style={{ fontFamily: 'var(--font-data)', color: 'var(--eco-nova)', marginTop: 8 }}>
        PKR {Number(amount).toLocaleString()} entangled successfully
      </p>
    </motion.div>
  )
}

export default TransferPage
