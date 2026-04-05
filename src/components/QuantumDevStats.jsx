import React, { useEffect, useRef, useState } from 'react'
import { eventBus, EVENTS } from '../lib/eventBus'
import { shouldRunHeavyEffect, subscribeToPerformanceChanges } from '../perf/performanceGovernor'

const QuantumDevStats = () => {
  const [stats, setStats] = useState({ fps: 0, particles: 0, workerMs: 0, mainMs: 0 })
  const frameCountRef = useRef(0)
  const lastSampleRef = useRef(performance.now())
  const lastParticlesRef = useRef(0)
  const lastWorkerMsRef = useRef(0)
  const lastMainMsRef = useRef(0)
  const [canBlur, setCanBlur] = useState(() => shouldRunHeavyEffect('backdropBlur'))

  useEffect(() => {
    const unsub = subscribeToPerformanceChanges(() => {
      setCanBlur(shouldRunHeavyEffect('backdropBlur'))
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const onTick = (payload) => {
      const start = performance.now()
      frameCountRef.current += 1
      if (payload?.count) lastParticlesRef.current = payload.count
      if (payload?.dt) lastWorkerMsRef.current = payload.dt

      const now = performance.now()
      if (now - lastSampleRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastSampleRef.current))
        lastSampleRef.current = now
        frameCountRef.current = 0
        setStats({
          fps,
          particles: lastParticlesRef.current,
          workerMs: Math.round(lastWorkerMsRef.current),
          mainMs: Math.round(lastMainMsRef.current),
        })
      }

      lastMainMsRef.current = performance.now() - start
    }

    eventBus.on(EVENTS.QUANTUM_TICK, onTick)
    return () => eventBus.off(EVENTS.QUANTUM_TICK, onTick)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1001,
        padding: '8px 10px',
        borderRadius: 10,
        background: 'rgba(5,10,20,0.75)',
        border: '1px solid rgba(0,212,255,0.2)',
        backdropFilter: canBlur ? 'blur(10px)' : 'none',
        fontFamily: 'var(--font-data)',
        fontSize: 10,
        color: 'rgba(0,212,255,0.9)',
        letterSpacing: '0.08em',
      }}
    >
      <div>FPS {stats.fps}</div>
      <div>PART {stats.particles}</div>
      <div>WORKER {stats.workerMs}ms</div>
      <div>MAIN {stats.mainMs}ms</div>
    </div>
  )
}

export default QuantumDevStats
