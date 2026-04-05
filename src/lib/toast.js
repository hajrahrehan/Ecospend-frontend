// src/lib/toast.js — replace all existing toast calls with these

import React from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useGamificationStore, XP_TABLE } from '../store/gamification'
import { shouldRunHeavyEffect } from '../perf/performanceGovernor'

const TOAST_TYPES = {
  success: { border: 'var(--eco-nova)',      icon: '◈', xp: true  },
  error:   { border: 'var(--eco-pulsar)',    icon: '◉', xp: false },
  info:    { border: 'var(--eco-quantum)',   icon: '◇', xp: false },
  warning: { border: 'var(--eco-antimatter)',icon: '◆', xp: false },
  reward:  { border: 'var(--eco-solar)',     icon: '★', xp: true  },
}

export const quantumToast = (message, type = 'info', xpAction = null) => {
  const cfg = TOAST_TYPES[type]
  if (xpAction) useGamificationStore.getState().addXP(xpAction)
  const canBlur = shouldRunHeavyEffect('backdropBlur')
  
  toast.custom(
    (t) => (
      <motion.div
        initial={{ x: 400, opacity: 0, scale: 0.9 }}
        animate={t.visible ? { x: 0, opacity: 1, scale: 1 } : { x: 400, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        style={{
          background: 'rgba(5,10,20,0.95)',
          backdropFilter: canBlur ? 'blur(20px)' : 'none',
          border: `1px solid ${cfg.border}30`,
          borderLeft: `3px solid ${cfg.border}`,
          borderRadius: 10,
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          minWidth: 280, maxWidth: 380,
          boxShadow: `0 0 30px ${cfg.border}20`,
        }}
      >
        <motion.span
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ color: cfg.border, fontSize: 18, flexShrink: 0 }}
        >
          {cfg.icon}
        </motion.span>
        
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 13,
          color: 'rgba(255,255,255,0.9)', flex: 1, lineHeight: 1.4,
        }}>
          {message}
        </span>
        
        {xpAction && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
            style={{
              fontFamily: 'var(--font-data)', fontSize: 11,
              color: 'var(--eco-solar)', fontWeight: 700,
              background: 'rgba(255,184,48,0.1)',
              border: '1px solid rgba(255,184,48,0.2)',
              padding: '2px 8px', borderRadius: 4,
              flexShrink: 0,
            }}
          >
            +{XP_TABLE[xpAction]} XP
          </motion.span>
        )}
      </motion.div>
    ),
    { duration: 3500, position: 'top-right' }
  )
}
