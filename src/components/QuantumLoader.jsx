import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { waveProbability } from '../lib/physics'

// For page-level loading — wave collapse visualization
export const WaveCollapseLoader = ({ label = 'INITIALIZING QUANTUM STATE' }) => {
  const canvasRef = useRef()
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let t = 0, raf
    const draw = () => {
      ctx.clearRect(0, 0, 200, 40)
      for (let x = 0; x < 200; x++) {
        const collapse = Math.min(t / 120, 1)
        const psi = waveProbability(x, t, 100, 80 * (1 - collapse * 0.85), 0.06, 20)
        const h = psi * 35
        ctx.fillStyle = `rgba(0,212,255,${Math.min(psi * 6, 0.9)})`
        ctx.fillRect(x, 40 - h, 1, h)
      }
      t += 0.5; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <canvas ref={canvasRef} width={200} height={40} />
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--eco-quantum)', letterSpacing: '0.3em' }}
      >
        {label}
      </motion.p>
    </div>
  )
}

// For button loading — orbiting dot
export const OrbitalSpinner = () => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{ width: 16, height: 16, position: 'relative' }}
    >
      <div style={{
        position: 'absolute', width: 5, height: 5, borderRadius: '50%',
        background: 'var(--eco-quantum)',
        boxShadow: '0 0 8px var(--eco-quantum)',
        top: 0, left: '50%', marginLeft: -2.5,
      }} />
    </motion.div>
  )
}
