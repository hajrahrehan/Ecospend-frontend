import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as ApiManager from '../helpers/ApiManager.tsx'

const buildResponse = (message, context) => {
  const text = message.toLowerCase()
  const balance = context?.balance || 0
  if (text.includes('balance')) {
    return `Your current quantum balance is PKR ${balance.toLocaleString()}.`
  }
  if (text.includes('spending') || text.includes('too much')) {
    return 'Your spending is within the stable orbit range. Consider capping non-essential outflows to 15% of monthly inflow.'
  }
  if (text.includes('save') || text.includes('savings')) {
    return 'Try the 50/30/20 split: 50% essentials, 30% flexibility, 20% savings. I can help you set a weekly auto‑transfer.'
  }
  if (text.includes('invest')) {
    return 'Diversify across low‑volatility funds and keep an emergency reserve equal to 3–6 months of expenses.'
  }
  return 'I can help with balance checks, spending analysis, and savings guidance. Ask me anything in the quantum ledger.'
}

const EcoAI = () => {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Welcome to EcoAI. Ask me about balance, spending, or savings.' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    let isActive = true
    const load = async () => {
      const res = await ApiManager.UserInfo()
      if (!isActive) return
      setUser(res?.data?.user || null)
    }
    load()
    return () => { isActive = false }
  }, [])

  const sendMessage = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const id = Date.now()
    setMessages((prev) => [...prev, { id, role: 'user', text: trimmed }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const response = buildResponse(trimmed, user)
      setMessages((prev) => [...prev, { id: id + 1, role: 'ai', text: response }])
      setTyping(false)
    }, 700)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{
        background: 'rgba(8,16,28,0.75)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 0 40px rgba(0,212,255,0.08)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.2em', marginBottom: 12 }}>
          ECOAI ORBIT
        </h2>
        <p style={{ fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.6)', fontSize: 12, marginBottom: 20 }}>
          Quantum financial advisor · response latency: 0.7s
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 280 }}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,79,255,0.2))'
                  : 'rgba(10,22,40,0.6)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#fff',
                maxWidth: '80%',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {msg.text}
            </motion.div>
          ))}
          <AnimatePresence>
            {typing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  alignSelf: 'flex-start',
                  fontFamily: 'var(--font-data)',
                  color: 'rgba(0,212,255,0.6)',
                  fontSize: 12,
                }}
              >
                EcoAI is stabilizing the wave function…
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
            placeholder="Ask EcoAI about your finances…"
            style={{
              flex: 1,
              background: 'rgba(0,212,255,0.06)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 10,
              padding: '10px 12px',
              color: '#fff',
              fontFamily: 'var(--font-data)',
              outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: '10px 16px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(123,79,255,0.25))',
              border: '1px solid rgba(0,212,255,0.35)',
              borderRadius: 10,
              color: '#fff',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.15em',
              cursor: 'pointer',
            }}
          >
            TRANSMIT
          </button>
        </div>
      </div>
    </div>
  )
}

export default EcoAI
