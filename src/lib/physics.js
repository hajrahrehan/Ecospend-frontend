// src/lib/physics.js

// ─── Spring Dynamics ───────────────────────────────────────────────────────

/**
 * Critically damped spring interpolation
 * Equation: x(t) = target + (x₀ - target)·e^(-ζωt)·[cos(ωd·t) + (ζω/ωd)·sin(ωd·t)]
 * ωd = ω·√(1 - ζ²)  — damped natural frequency
 *
 * @param {number} current   - current position
 * @param {number} target    - target position
 * @param {number} velocity  - current velocity
 * @param {number} dt        - delta time (seconds)
 * @param {number} zeta      - damping ratio (0.7 = snappy, 1.0 = critical, >1 = overdamped)
 * @param {number} omega     - natural frequency (higher = faster)
 * @returns {{ position, velocity }}
 */
export function springStep(current, target, velocity, dt, zeta = 0.75, omega = 12) {
  const wd = omega * Math.sqrt(Math.max(0, 1 - zeta * zeta))
  const decay = Math.exp(-zeta * omega * dt)
  const cos = Math.cos(wd * dt)
  const sin = wd > 0.001 ? Math.sin(wd * dt) : dt
  
  const x0 = current - target
  const newPos = target + decay * (x0 * cos + ((velocity + zeta * omega * x0) / (wd || 1)) * sin)
  const newVel = decay * (velocity * cos - (zeta * omega * velocity + (omega * omega) * x0) / (wd || 1) * sin)
  
  return { position: newPos, velocity: newVel }
}

// ─── Orbital Mechanics ─────────────────────────────────────────────────────

/**
 * Kepler elliptical orbit position
 * x(θ) = a·cos(θ),  y(θ) = b·sin(θ)
 * where a = semi-major axis, b = semi-minor axis
 * Angular velocity: dθ/dt = L / (m·r²)  — conservation of angular momentum
 *
 * @param {number} t        - time elapsed
 * @param {number} a        - semi-major axis (radius x)
 * @param {number} b        - semi-minor axis (radius y)
 * @param {number} speed    - angular velocity multiplier
 * @param {number} phase    - initial phase offset
 * @returns {{ x, y }}
 */
export function keplerPosition(t, a, b, speed = 1, phase = 0) {
  const theta = t * speed + phase
  return {
    x: a * Math.cos(theta),
    y: b * Math.sin(theta),
  }
}

// ─── Wave Functions ────────────────────────────────────────────────────────

/**
 * Quantum wave packet — probability amplitude
 * ψ(x,t) = A·exp(-(x-x₀-v·t)²/4σ²)·cos(k₀·(x - v_phase·t))
 * |ψ(x,t)|² = probability density (what you see glowing)
 */
export function waveProbability(x, t, x0 = 0, sigma = 80, k0 = 0.05, v = 0.5) {
  const envelope = Math.exp(-Math.pow(x - x0 - v * t, 2) / (4 * sigma * sigma))
  const carrier  = Math.cos(k0 * (x - v * t * 2))
  const psi      = envelope * carrier
  return psi * psi  // probability density
}

// ─── Particle Physics ──────────────────────────────────────────────────────

/**
 * Coulomb-like repulsion between particles
 * F = k·q₁·q₂ / r²  (but bounded to avoid singularity)
 */
export function coulombForce(p1, p2, strength = 50, minDist = 20) {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  const r  = Math.max(Math.sqrt(dx*dx + dy*dy), minDist)
  const f  = strength / (r * r)
  return { fx: f * dx / r, fy: f * dy / r }
}

/**
 * Box-Muller Gaussian random number — for thermal noise
 * Models Maxwell-Boltzmann velocity distribution
 */
export function gaussian(mean = 0, std = 1) {
  const u1 = Math.random(), u2 = Math.random()
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

/**
 * Perlin-style smooth noise via sin composition
 * n(x,t) = Σ Aᵢ·sin(fᵢ·x + φᵢ·t)
 */
export function smoothNoise(x, t, octaves = 4) {
  let val = 0, amp = 1, freq = 1, total = 0
  for (let i = 0; i < octaves; i++) {
    val   += amp * Math.sin(freq * x * 0.01 + t * (0.5 + i * 0.3) + i * 1.7)
    total += amp
    amp   *= 0.5
    freq  *= 2.1
  }
  return val / total
}

// ─── Finance-Physics Mappings ──────────────────────────────────────────────

/**
 * Black-Scholes-inspired wealth field intensity
 * Maps account balance to visual energy level
 * E = log(1 + |balance| / scale) — logarithmic to handle large ranges
 */
export function wealthEnergy(balance, scale = 10000) {
  return Math.log(1 + Math.abs(balance) / scale) / Math.log(1 + 1000000 / scale)
}

/**
 * Gravity well depth from balance — richer = deeper well
 * V(r) = -GM/r  simplified to: V = -energy / (r + softening)
 */
export function gravityWell(balance, r, softening = 10) {
  const energy = wealthEnergy(balance)
  return -energy * 100 / (r + softening)
}

/**
 * Transaction collision energy
 * KE = ½mv²  →  mapped to: E = amount/maxAmount
 * Large transfers = high-energy collision events
 */
export function collisionEnergy(amount, maxAmount = 1000000) {
  return Math.min(amount / maxAmount, 1)
}
