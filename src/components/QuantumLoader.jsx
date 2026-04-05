import React, { useEffect, useRef, memo } from 'react'
import { motion } from 'framer-motion'
import { getCanvasWorker } from '../hooks/useQuantumWorker'

// For page-level loading — wave collapse visualization
export const WaveCollapseLoader = memo(({ label = 'INITIALIZING QUANTUM STATE' }) => {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const worker = getCanvasWorker()
    
    if (canvas && typeof canvas.transferControlToOffscreen === 'function' && !canvas.hasTransferred) {
      const offscreen = canvas.transferControlToOffscreen()
      canvas.hasTransferred = true
      worker?.postMessage({ type: 'INIT_OFFSCREEN', id: 'loaderWave', canvas: offscreen }, [offscreen])
    }
    
    if (worker) {
      worker.postMessage({ type: 'START_WAVE', id: 'loaderWave' })
    }

    return () => worker?.postMessage({ type: 'STOP', id: 'loaderWave' })
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
