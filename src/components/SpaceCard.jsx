import React, { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const SpaceCard = ({ card }) => {
  const [flipped, setFlipped] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rx = useTransform(mouseY, [-80, 80], [12, -12])
  const ry = useTransform(mouseX, [-120, 120], [-15, 15])

  // Holographic shimmer position follows mouse
  const shimmerX = useTransform(mouseX, [-120, 120], ['0%', '100%'])

  const cardGradients = {
    VISA:       'linear-gradient(135deg, #050A14, #0A1628, #0F2040)',
    MASTERCARD: 'linear-gradient(135deg, #140514, #200A14, #2A0F1F)',
    DEFAULT:    'linear-gradient(135deg, #050A14, #0A1428, #101E38)',
  }

  return (
    <motion.div
      style={{ perspective: 1000, width: 360, height: 220 }}
      onMouseMove={(e) => {
        if (flipped) return
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left - rect.width / 2)
        mouseY.set(e.clientY - rect.top - rect.height / 2)
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        style={{
          width: '100%', height: '100%',
          rotateX: flipped ? 0 : rx,
          rotateY: flipped ? 180 : ry,
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        {/* ── FRONT ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: cardGradients[card.type] ?? cardGradients.DEFAULT,
          borderRadius: 16,
          border: '1px solid rgba(0,212,255,0.15)',
          boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          overflow: 'hidden',
          backfaceVisibility: 'hidden',
          padding: '24px 28px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {/* Holographic rainbow shimmer layer */}
          <motion.div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(105deg, transparent 25%, rgba(0,212,255,0.08) 45%, rgba(123,79,255,0.06) 55%, rgba(255,184,48,0.05) 65%, transparent 75%)`,
            backgroundSize: '200% 200%',
            backgroundPositionX: shimmerX,
            pointerEvents: 'none',
          }} />
          
          {/* Grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            pointerEvents: 'none',
          }} />

          {/* Chip — animated gold crystal */}
          <motion.div
            animate={{ boxShadow: ['0 0 8px #FFB83060', '0 0 20px #FFB83080', '0 0 8px #FFB83060'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 42, height: 32, borderRadius: 6,
              background: 'linear-gradient(135deg, #FFB830, #FF8C00, #FFD700)',
              border: '1px solid rgba(255,184,48,0.5)',
              position: 'relative',
            }}
          >
            {/* Chip circuit lines */}
            {[10, 20, 28].map(y => (
              <div key={y} style={{ position: 'absolute', left: 8, right: 8, top: y, height: 0.5, background: 'rgba(0,0,0,0.3)' }} />
            ))}
          </motion.div>

          <div>
            <p style={{
              fontFamily: 'var(--font-data)', fontSize: 17,
              color: '#fff', letterSpacing: '0.2em',
              marginBottom: 8, opacity: 0.9,
            }}>
              {card.number}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 9, fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.5)', marginBottom: 2 }}>NAVIGATOR</p>
                <p style={{ fontSize: 13, fontFamily: 'var(--font-display)', color: '#fff' }}>{card.holderName}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 9, fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.5)', marginBottom: 2 }}>EXPIRES</p>
                <p style={{ fontSize: 13, fontFamily: 'var(--font-data)', color: '#fff' }}>{card.expiry}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: cardGradients[card.type] ?? cardGradients.DEFAULT,
          borderRadius: 16,
          border: '1px solid rgba(0,212,255,0.1)',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {/* Magnetic stripe */}
          <div style={{ height: 40, background: '#000', margin: '0 0 20px', opacity: 0.8 }} />
          
          <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              flex: 1, height: 36,
              background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)',
              borderRadius: 4,
            }} />
            <div style={{
              background: '#fff', color: '#000',
              padding: '4px 12px', borderRadius: 4,
              fontFamily: 'var(--font-data)', fontSize: 16, fontWeight: 700,
              letterSpacing: '0.1em',
            }}>
              {card.cvc}
            </div>
          </div>
          
          <p style={{
            textAlign: 'center', marginTop: 24,
            fontFamily: 'var(--font-data)', fontSize: 9,
            color: 'rgba(0,212,255,0.3)', letterSpacing: '0.2em',
          }}>
            TAP CARD TO FLIP BACK
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SpaceCard
