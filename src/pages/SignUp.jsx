import React, { useEffect, useRef, useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getCanvasWorker } from '../hooks/useQuantumWorker'
import * as ApiManager from '../helpers/ApiManager.tsx'
import { eventBus, EVENTS } from '../lib/eventBus'
import { quantumToast } from '../lib/toast'

const accountTypes = ['Standard', 'Gold', 'Platinum']

const SignUpPage = () => {
  const canvasRef = useRef()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accountType, setAccountType] = useState('Standard')
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()
  const navigate = useNavigate()

  useEffect(() => {
    const canvas = canvasRef.current
    const worker = getCanvasWorker()
    if (canvas && typeof canvas.transferControlToOffscreen === 'function' && !canvas.hasTransferred) {
      const offscreen = canvas.transferControlToOffscreen()
      canvas.hasTransferred = true
      worker?.postMessage({ type: 'INIT_OFFSCREEN', id: 'signupWave', canvas: offscreen }, [offscreen])
    }
    if (worker) worker.postMessage({ type: 'START_WAVE', id: 'signupWave' })
    return () => worker?.postMessage({ type: 'STOP', id: 'signupWave' })
  }, [])

  const handleSubmit = async () => {
    const trimmedName = fullName.trim()
    if (!trimmedName) {
      setError('Full name is required.')
      return
    }
    if (!email.trim()) {
      setError('Identity code (email) is required.')
      return
    }
    if (!password || password.length < 6) {
      setError('Encryption key must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Encryption keys do not match.')
      return
    }

    const [fname, ...rest] = trimmedName.split(' ')
    const lname = rest.join(' ') || 'Astronaut'
    const cnic = `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`
    const payload = {
      fname,
      lname,
      cnic,
      address: 'Orbital Habitat, Sector 7',
      gender: 'm',
      bdate: '1996-01-01',
      email: email.trim(),
      password,
      type: accountType,
    }

    const res = await ApiManager.Register(payload)
    if (res) {
      eventBus.emit(EVENTS.XP_GAIN, { action: 'LOGIN' })
      quantumToast('Quantum account created. Welcome aboard.', 'success', 'LOGIN')
      startTransition(() => navigate('/main/dashboard'))
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--eco-void)', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={520}
        height={80}
        style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.55,
        }}
      />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{
          width: 520,
          background: 'rgba(10, 22, 40, 0.85)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 20,
          boxShadow: '0 0 80px rgba(0,212,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,79,255,0.15))',
            borderBottom: '1px solid rgba(0,212,255,0.15)',
            padding: '24px 32px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.2em', color: '#fff', fontSize: 22 }}>
              ECO<span style={{ color: 'var(--eco-quantum)' }}>SPEND</span>
            </div>
            <div style={{ marginTop: 8, fontFamily: 'var(--font-data)', fontSize: 11, letterSpacing: '0.3em', color: 'rgba(0,212,255,0.6)' }}>
              CREATE QUANTUM ACCOUNT
            </div>
          </div>

          <div style={{ padding: '26px 32px 32px', display: 'grid', gap: 14 }}>
            <QuantumField label="IDENTITY CODE (EMAIL)">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@cosmos.io" />
            </QuantumField>
            <QuantumField label="FULL NAME">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ayesha Khan" />
            </QuantumField>
            <QuantumField label="ENCRYPTION KEY">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" />
            </QuantumField>
            <QuantumField label="CONFIRM ENCRYPTION KEY">
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••••••" />
            </QuantumField>
            <div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(0,212,255,0.7)', marginBottom: 8 }}>
                ACCOUNT TYPE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {accountTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAccountType(t)}
                    style={{
                      padding: '10px 8px',
                      background: accountType === t ? 'var(--eco-quantum)' : 'rgba(0,212,255,0.08)',
                      border: `1px solid ${accountType === t ? 'var(--eco-quantum)' : 'rgba(0,212,255,0.2)'}`,
                      borderRadius: 10,
                      color: accountType === t ? '#000' : '#fff',
                      fontFamily: 'var(--font-data)',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--eco-pulsar)' }}>
                {error}
              </div>
            ) : null}

            <QuantumChargeButton onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  )
}

const QuantumField = ({ label, children }) => (
  <div>
    <div style={{
      fontFamily: 'var(--font-data)',
      fontSize: 10,
      letterSpacing: '0.2em',
      color: 'rgba(0,212,255,0.7)',
      marginBottom: 6,
    }}>
      {label}
    </div>
    <div style={{ position: 'relative' }}>
      {React.cloneElement(children, {
        style: {
          width: '100%',
          background: 'rgba(0,212,255,0.05)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 10,
          padding: '12px 14px',
          color: '#fff',
          fontFamily: 'var(--font-data)',
          outline: 'none',
        },
      })}
    </div>
  </div>
)

const QuantumChargeButton = ({ onSubmit }) => {
  const [charging, setCharging] = useState(false)
  const [chargeLevel, setChargeLevel] = useState(0)
  const intervalRef = useRef()

  const startCharge = () => {
    setCharging(true)
    intervalRef.current = setInterval(() => {
      setChargeLevel((p) => {
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
        width: '100%',
        padding: '14px',
        background: `linear-gradient(135deg, rgba(0,212,255,${0.1 + chargeLevel*0.005}), rgba(123,79,255,${0.1 + chargeLevel*0.004}))`,
        border: `1px solid rgba(0,212,255,${0.3 + chargeLevel*0.007})`,
        borderRadius: 10,
        color: '#fff',
        cursor: 'pointer',
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        letterSpacing: '0.2em',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: charging ? `0 0 ${20 + chargeLevel}px rgba(0,212,255,${chargeLevel*0.006})` : 'none',
        transition: 'all 0.1s',
      }}
    >
      <motion.div
        animate={{ width: `${chargeLevel}%` }}
        transition={{ duration: 0 }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          background: 'rgba(0,212,255,0.08)',
        }}
      />
      <span style={{ position: 'relative' }}>
        {chargeLevel === 0 ? 'CREATE QUANTUM ACCOUNT' :
         chargeLevel < 100 ? `CHARGING ${chargeLevel}%` : 'INITIALIZING...'}
      </span>
    </motion.button>
  )
}

export default SignUpPage
