import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Float } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// Schrödinger wave packet — particle probability density
// ψ(x,t) = A·exp(-(x-x₀)²/4σ²) · exp(i(k₀x - ωt))
// |ψ|² = A²·exp(-(x-x₀)²/2σ²)  ← Gaussian probability cloud

const QuantumField = ({ count = 2000 }) => {
  const mesh = useRef()
  const time = useRef(0)

  const { positions, velocities, phases, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const phases    = new Float32Array(count)
    const sizes     = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      // Box-Muller transform for Gaussian spatial distribution
      // Models quantum ground-state probability cloud
      const u1 = Math.random(), u2 = Math.random()
      const r  = Math.sqrt(-2 * Math.log(u1))
      positions[i*3]   = r * Math.cos(2*Math.PI*u2) * 12
      positions[i*3+1] = r * Math.sin(2*Math.PI*u2) * 6
      positions[i*3+2] = (Math.random() - 0.5) * 20
      
      // Maxwell-Boltzmann velocity distribution
      // f(v) = 4π(m/2πkT)^(3/2) · v² · exp(-mv²/2kT)
      const thermal = 0.008
      velocities[i*3]   = (Math.random() - 0.5) * thermal
      velocities[i*3+1] = (Math.random() - 0.5) * thermal
      velocities[i*3+2] = (Math.random() - 0.5) * thermal
      
      phases[i] = Math.random() * Math.PI * 2
      sizes[i]  = Math.random() * 3 + 0.5
    }
    return { positions, velocities, phases, sizes }
  }, [count])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [positions, phases, sizes])

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

  useFrame((state) => {
    time.current += 0.016
    material.uniforms.uTime.value = time.current
    
    const pos = geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      // Langevin dynamics — Brownian motion in a potential well
      // dp/dt = -γp + √(2γmkT)·ξ(t)
      // where ξ(t) is Gaussian white noise
      pos[i*3]   += velocities[i*3]   + (Math.random()-0.5) * 0.001
      pos[i*3+1] += velocities[i*3+1] + (Math.random()-0.5) * 0.001
      pos[i*3+2] += velocities[i*3+2]
      
      // Periodic boundary — toroidal space
      if (Math.abs(pos[i*3])   > 15) pos[i*3]   *= -0.98
      if (Math.abs(pos[i*3+1]) > 8)  pos[i*3+1] *= -0.98
      if (Math.abs(pos[i*3+2]) > 12) pos[i*3+2] *= -0.98
    }
    geometry.attributes.position.needsUpdate = true
  })

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return (
    <>
      {/* Deep star field — galactic background */}
      <Stars radius={100} depth={60} count={4000} factor={3} saturation={0.3} fade speed={0.5} />
      
      {/* Quantum particle cloud */}
      <points ref={mesh} geometry={geometry} material={material} />
      
      {/* Ambient nebula — 3 floating color clouds */}
      {[
        { pos: [-4, 2, -8], color: '#7B4FFF', scale: 3 },
        { pos: [5, -2, -10], color: '#00D4FF', scale: 4 },
        { pos: [0, 4, -12], color: '#FFB830', scale: 2 },
      ].map((n, i) => (
        <Float key={i} speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <mesh position={n.pos}>
            <sphereGeometry args={[n.scale, 8, 8]} />
            <meshBasicMaterial color={n.color} transparent opacity={0.015} />
          </mesh>
        </Float>
      ))}
      
      {/* Post-processing stack */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          intensity={0.8}
          mipmapBlur
          blendFunction={BlendFunction.ADD}
        />
        <ChromaticAberration
          offset={[0.0005, 0.0005]}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  )
}

export default QuantumField
