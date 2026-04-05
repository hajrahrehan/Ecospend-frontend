import React, { useRef, useMemo, useEffect, memo, lazy, Suspense } from 'react'
import { Stars } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuantumWorker } from '../hooks/useQuantumWorker'
import { eventBus, EVENTS } from '../lib/eventBus'

const QuantumFieldFX = lazy(() => import('./QuantumFieldFX'))

// Schrödinger wave packet — particle probability density
// ψ(x,t) = A·exp(-(x-x₀)²/4σ²) · exp(i(k₀x - ωt))
// |ψ|² = A²·exp(-(x-x₀)²/2σ²)  ← Gaussian probability cloud

const QuantumField = ({ maxCount = 1200, initialCount = 800, performanceLevel = 'high', reducedMotion = false }) => {
  const mesh = useRef()
  const { invalidate } = useThree()
  const positionsRef = useRef(null)
  const lastInvalidateRef = useRef(0)
  const invalidateInterval = 1000 / 30

  const maxLimit = performanceLevel === 'high' ? 8000 : 3000
  const cappedMaxCount = Math.min(maxCount, maxLimit)
  const cappedInitialCount = Math.min(initialCount, cappedMaxCount)

  const { worker } = useQuantumWorker({
    maxParticles: cappedMaxCount,
    startParticles: cappedInitialCount,
    tickRate: 30,
  })

  const { phases, sizes, timeRef } = useMemo(() => {
    const phases = new Float32Array(cappedMaxCount)
    const sizes  = new Float32Array(cappedMaxCount)
    for (let i = 0; i < cappedMaxCount; i++) {
      phases[i] = Math.random() * Math.PI * 2
      sizes[i]  = Math.random() * 3 + 0.5
    }
    return { phases, sizes, timeRef: { current: 0 } }
  }, [cappedMaxCount])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    // Initial empty array, will be populated by worker
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cappedMaxCount * 3), 3))
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [cappedMaxCount, phases, sizes])

  // Custom shader material — quantum superposition shimmer
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#00D4FF') } },
    vertexShader: `
      attribute float aPhase;
      attribute float aSize;
      uniform float uTime;
      
      void main() {
        vec3 pos = position;
        
        // Quantum harmonic oscillator drift
        // x(t) = A·cos(ωt + φ) — simple harmonic motion
        float omega = 0.3 + aPhase * 0.1;
        pos.x += sin(uTime * omega + aPhase) * 0.15;
        pos.y += cos(uTime * omega * 0.7 + aPhase) * 0.1;
        
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        
        // Size attenuates with depth — simulates 3D space
        gl_PointSize = aSize * (300.0 / -mvPos.z);
        gl_Position  = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      
      void main() {
        // Circular point with soft edge
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        // Quantum probability pulse: intensity oscillates
        float pulse = 0.5 + 0.5 * sin(uTime * 2.0);
        float alpha = (1.0 - dist * 2.0) * 0.6 * pulse;
        
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])

  // Event driven zero-copy updates
  useEffect(() => {
    if (worker) {
      worker.postMessage({ type: 'START' })
    }

    const onTick = (payload) => {
      // 1. Direct memory layout copy to ThreeJS buffer
      positionsRef.current = payload.positions
      const posAttr = geometry.attributes.position
      posAttr.array.set(positionsRef.current)
      posAttr.needsUpdate = true
      geometry.setDrawRange(0, payload.count || cappedInitialCount)

      // 2. Uniform update
      timeRef.current += 0.016
      material.uniforms.uTime.value = timeRef.current

      // 3. Relinquish ownership back to worker (Zero-copy transfer)
      // This ensures we aren't leaking memory on the main thread and keeping allocations pool stable
      worker?.postMessage(
        { type: 'RETURN_BUFFER', payload: payload.positions },
        [payload.positions.buffer]
      )

      // Demand-driven render tick (throttled ~30fps max)
      const now = performance.now()
      if (now - lastInvalidateRef.current >= invalidateInterval) {
        invalidate()
        lastInvalidateRef.current = now
      }
    }
    
    eventBus.on(EVENTS.QUANTUM_TICK, onTick)
    return () => eventBus.off(EVENTS.QUANTUM_TICK, onTick)
  }, [geometry, material, worker, timeRef, invalidate, cappedInitialCount, invalidateInterval])

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  const bloomIntensity = reducedMotion ? 0.2 : performanceLevel === 'low' ? 0.25 : 0.35
  const chromaOffset = reducedMotion ? 0.0001 : performanceLevel === 'low' ? 0.00015 : 0.0002

  return (
    <>
      {/* Deep star field — galactic background */}
      <Stars radius={100} depth={60} count={1200} factor={2} saturation={0.2} fade speed={reducedMotion ? 0.1 : 0.3} />
      
      {/* Quantum particle cloud */}
      <points ref={mesh} geometry={geometry} material={material} />
      
      {/* Post-processing stack */}
      {performanceLevel === 'high' ? (
        <Suspense fallback={null}>
          <QuantumFieldFX bloomIntensity={bloomIntensity} chromaOffset={chromaOffset} />
        </Suspense>
      ) : null}
    </>
  )
}

export default memo(QuantumField)
