import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamificationStore } from '../store/gamification'
import { shouldRunHeavyEffect, subscribeToPerformanceChanges } from '../perf/performanceGovernor'

const QuantumHUD = () => {
  const { level, xpProgress, xpToNext, streak, pendingXP, clearPendingXP } = useGamificationStore()
  const [showXPGain, setShowXPGain] = useState(null)
  const [canBlur, setCanBlur] = useState(() => shouldRunHeavyEffect('backdropBlur'))

  useEffect(() => {
    if (!pendingXP) return
    setShowXPGain(pendingXP)
    clearPendingXP()
    const t = setTimeout(() => setShowXPGain(null), 2500)
    return () => clearTimeout(t)
  }, [pendingXP, clearPendingXP])

  useEffect(() => {
    const unsub = subscribeToPerformanceChanges(() => {
      setCanBlur(shouldRunHeavyEffect('backdropBlur'))
    })
    return () => unsub()
  }, [])

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 24, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(5,10,20,0.85)',
      backdropFilter: canBlur ? 'blur(16px)' : 'none',
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: 999, padding: '8px 16px',
    }}>
      {/* Level orb */}
      <motion.div
        animate={{ boxShadow: ['0 0 8px var(--eco-solar)', '0 0 20px var(--eco-solar)', '0 0 8px var(--eco-solar)'] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,184,48,0.4), rgba(255,184,48,0.1))',
          border: '1px solid rgba(255,184,48,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--eco-solar)',
          fontWeight: 700, flexShrink: 0,
        }}
      >
        {level.level}
      </motion.div>

      {/* Level title + XP bar */}
      <div style={{ minWidth: 120 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'var(--eco-solar)', letterSpacing: '0.2em' }}>
            {level.title.toUpperCase()}
          </span>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(0,212,255,0.5)' }}>
            {xpToNext === Infinity ? 'MAX' : `${xpToNext} to next`}
          </span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,184,48,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 18 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--eco-quantum), var(--eco-solar))',
              boxShadow: '0 0 4px var(--eco-solar)',
            }}
          />
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <motion.div
          animate={streak >= 7 ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            fontFamily: 'var(--font-data)', fontSize: 11,
            color: streak >= 7 ? 'var(--eco-solar)' : 'rgba(0,212,255,0.6)',
            letterSpacing: '0.05em',
          }}
        >
          ◆ {streak}d
        </motion.div>
      )}

      {/* Floating XP gain notification */}
      <AnimatePresence>
        {showXPGain && (
          <motion.div
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -50, opacity: 0, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: -20, right: 0,
              fontFamily: 'var(--font-data)', fontSize: 14,
              color: 'var(--eco-solar)', fontWeight: 700,
              pointerEvents: 'none',
              textShadow: '0 0 10px var(--eco-solar)',
            }}
          >
            +{showXPGain.amount} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QuantumHUD
