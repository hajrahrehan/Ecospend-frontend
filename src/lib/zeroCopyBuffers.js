/**
 * ArrayBuffer pool memory allocation logic
 * Guarantees zero-copy allocations or reuses existing buffers to prevent garbage collection sweeps.
 */

const float32Pool = new Map()

export const allocateFloat32Buffer = (size, id = 'default') => {
  if (!float32Pool.has(id)) {
    float32Pool.set(id, [])
  }
  const pool = float32Pool.get(id)
  
  // Clean up wrong sizes
  for (let i = pool.length - 1; i >= 0; i--) {
    if (pool[i].length !== size) {
      pool.splice(i, 1)
    }
  }

  if (pool.length > 0) {
    return pool.pop()
  }
  
  return new Float32Array(size)
}

export const releaseFloat32Buffer = (buffer, id = 'default') => {
  if (!float32Pool.has(id)) return
  if (buffer instanceof Float32Array) {
    float32Pool.get(id).push(buffer)
  }
}
