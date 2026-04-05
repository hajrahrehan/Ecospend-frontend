import { useEffect, useRef, useTransition } from 'react'

let sharedPhysicsWorker = null
let sharedCanvasWorker = null

const getPhysicsWorker = () => {
  if (typeof Worker !== 'undefined') {
    if (!sharedPhysicsWorker) {
      sharedPhysicsWorker = new Worker(new URL('../workers/quantumPhysics.worker.js', import.meta.url))
      sharedPhysicsWorker.postMessage({ type: 'INIT', payload: { maxParticles: 1200, startParticles: 800 } })
      
      sharedPhysicsWorker.onmessage = (e) => {
        const { type, payload } = e.data
        if (type === 'QUANTUM_TICK') {
          import('../lib/eventBus').then(({ eventBus, EVENTS }) => {
            eventBus.emit(EVENTS.QUANTUM_TICK, payload)
          })
        }
      }
    }
  }
  return sharedPhysicsWorker
}

export const getCanvasWorker = () => {
  if (typeof Worker !== 'undefined') {
    if (!sharedCanvasWorker) {
      sharedCanvasWorker = new Worker(new URL('../workers/canvas2d.worker.js', import.meta.url))
    }
  }
  return sharedCanvasWorker
}

/**
 * useQuantumWorker hooks into shared physics worker
 */
export const useQuantumWorker = () => {
  const [isPending, startTransition] = useTransition()
  const workerRef = useRef(getPhysicsWorker())

  useEffect(() => {
    // If reduced motion is explicitly toggled
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const notifyWorker = (e) => {
      workerRef.current?.postMessage({ type: 'SET_REDUCED_MOTION', payload: { reduced: e.matches } })
      getCanvasWorker()?.postMessage({ type: 'SET_REDUCED_MOTION', payload: { reduced: e.matches } })
    }
    notifyWorker(mq)
    mq.addEventListener('change', notifyWorker)
    
    return () => mq.removeEventListener('change', notifyWorker)
  }, [])

  return { worker: workerRef.current, startTransition, isPending }
}
