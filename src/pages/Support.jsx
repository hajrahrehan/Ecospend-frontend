import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as ApiManager from '../helpers/ApiManager.tsx'

const Support = () => {
  const [tickets, setTickets] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    let isActive = true
    const load = async () => {
      const res = await ApiManager.UserTicketList()
      if (!isActive) return
      setTickets(res?.data || [])
    }
    load()
    return () => { isActive = false }
  }, [])

  const submitTicket = async () => {
    const trimmed = message.trim()
    if (!trimmed) return
    const res = await ApiManager.CreateTicket({ message: trimmed })
    if (res?.data) {
      setTickets((prev) => [res.data, ...prev])
      setMessage('')
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.2em' }}>SUPPORT CONSOLE</h2>
      <p style={{ fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.6)', fontSize: 12 }}>
        Submit a ticket and our orbit team will respond.
      </p>

      <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the issue with your account…"
          rows={4}
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 12,
            color: '#fff',
            fontFamily: 'var(--font-data)',
            padding: 12,
            outline: 'none',
          }}
        />
        <button
          onClick={submitTicket}
          style={{
            padding: '10px 14px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,79,255,0.2))',
            border: '1px solid rgba(0,212,255,0.35)',
            borderRadius: 10,
            color: '#fff',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.15em',
            cursor: 'pointer',
          }}
        >
          TRANSMIT TICKET
        </button>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        {tickets.map((ticket) => (
          <motion.div
            key={ticket._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(10,22,40,0.6)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 12,
              padding: 14,
              color: '#fff',
              fontFamily: 'var(--font-body)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-data)', fontSize: 11 }}>
              <span>STATUS: {ticket.status?.toUpperCase()}</span>
              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
            <p style={{ marginTop: 8 }}>{ticket.message}</p>
            {ticket.reply ? (
              <div style={{
                marginTop: 8,
                padding: '8px 10px',
                background: 'rgba(0,212,255,0.08)',
                borderRadius: 8,
                fontFamily: 'var(--font-data)',
                fontSize: 12,
                color: 'rgba(0,212,255,0.8)',
              }}>
                ADMIN: {ticket.reply}
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Support
