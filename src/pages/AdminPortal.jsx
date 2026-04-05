import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as ApiManager from '../helpers/ApiManager.tsx'

const AdminPortal = () => {
  const [auth, setAuth] = useState(() => Boolean(sessionStorage.getItem('@admintoken')))
  const [email, setEmail] = useState('admin@hellobank.com')
  const [password, setPassword] = useState('admin123')
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [tickets, setTickets] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [cards, setCards] = useState([])
  const [products, setProducts] = useState([
    { id: 'prod-1', name: 'Nebula Headphones', price: 12000 },
    { id: 'prod-2', name: 'Photon Smartwatch', price: 18000 },
  ])

  useEffect(() => {
    if (!auth) return
    const load = async () => {
      const u = await ApiManager.AdminUserList()
      const t = await ApiManager.AdminTicketList()
      setUsers(u?.data || [])
      setTickets(t?.data || [])
    }
    load()
  }, [auth])

  const login = async () => {
    const res = await ApiManager.AdminSignIn({ email, password })
    if (res?.data?.token) setAuth(true)
  }

  const selectUser = async (user) => {
    setSelectedUser(user)
    const res = await ApiManager.AdminUserCards(user._id)
    setCards(res?.data || [])
  }

  const blockCard = async (card) => {
    await ApiManager.AdminBlockCard({ cardId: card._id })
    setCards((prev) => prev.map((c) => (c._id === card._id ? { ...c, isblocked: true } : c)))
  }

  const issueCard = async () => {
    if (!selectedUser) return
    const res = await ApiManager.AdminIssueCard(selectedUser._id, { type: 'Debit' })
    if (res?.data) setCards((prev) => [res.data, ...prev])
  }

  const resolveTicket = async (ticket) => {
    const reply = `Resolved: ${ticket.message}`
    const res = await ApiManager.AdminResolveTicket({ id: ticket._id, reply })
    if (res?.data) {
      setTickets((prev) => prev.map((t) => (t._id === ticket._id ? res.data : t)))
    }
  }

  const addProduct = () => {
    setProducts((prev) => [
      { id: `prod-${Date.now()}`, name: 'New Orbital Item', price: 5000 },
      ...prev,
    ])
  }

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  if (!auth) {
    return (
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '60px 20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.2em' }}>ADMIN LOGIN</h2>
        <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email"
            style={{
              background: 'rgba(0,212,255,0.06)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 10,
              padding: '10px 12px',
              color: '#fff',
              fontFamily: 'var(--font-data)',
            }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Admin Password"
            style={{
              background: 'rgba(0,212,255,0.06)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 10,
              padding: '10px 12px',
              color: '#fff',
              fontFamily: 'var(--font-data)',
            }}
          />
          <button
            onClick={login}
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
            AUTHENTICATE
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.2em' }}>ADMIN CONTROL DECK</h2>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        {['users', 'cards', 'tickets', 'products'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 12px',
              background: tab === t ? 'rgba(0,212,255,0.2)' : 'transparent',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 10,
              color: '#fff',
              fontFamily: 'var(--font-data)',
              cursor: 'pointer',
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
          {users.map((u) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(10,22,40,0.6)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 12,
                padding: 12,
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-data)',
              }}
            >
              <span>{u.fname} {u.lname} · {u.type}</span>
              <button
                onClick={() => selectUser(u)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,212,255,0.3)',
                  background: 'rgba(0,212,255,0.1)',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                MANAGE
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'cards' && (
        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 10, color: 'rgba(0,212,255,0.7)', fontFamily: 'var(--font-data)' }}>
            Selected user: {selectedUser ? `${selectedUser.fname} ${selectedUser.lname}` : 'None'}
          </div>
          <button
            onClick={issueCard}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid rgba(0,212,255,0.3)',
              background: 'rgba(0,212,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              marginBottom: 12,
            }}
          >
            ISSUE CARD
          </button>
          <div style={{ display: 'grid', gap: 10 }}>
            {cards.map((card) => (
              <div key={card._id} style={{
                background: 'rgba(10,22,40,0.6)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 12,
                padding: 12,
                color: '#fff',
                fontFamily: 'var(--font-data)',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>{card.cardnumber} · {card.type}</span>
                <button
                  onClick={() => blockCard(card)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,212,255,0.3)',
                    background: 'rgba(0,212,255,0.1)',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  BLOCK
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'tickets' && (
        <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
          {tickets.map((ticket) => (
            <div key={ticket._id} style={{
              background: 'rgba(10,22,40,0.6)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 12,
              padding: 12,
              color: '#fff',
              fontFamily: 'var(--font-data)',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>{ticket.message}</span>
              <button
                onClick={() => resolveTicket(ticket)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,212,255,0.3)',
                  background: 'rgba(0,212,255,0.1)',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                RESOLVE
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div style={{ marginTop: 20 }}>
          <button
            onClick={addProduct}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid rgba(0,212,255,0.3)',
              background: 'rgba(0,212,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              marginBottom: 12,
            }}
          >
            ADD PRODUCT
          </button>
          <div style={{ display: 'grid', gap: 10 }}>
            {products.map((product) => (
              <div key={product.id} style={{
                background: 'rgba(10,22,40,0.6)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 12,
                padding: 12,
                color: '#fff',
                fontFamily: 'var(--font-data)',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>{product.name} · PKR {product.price.toLocaleString()}</span>
                <button
                  onClick={() => removeProduct(product.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,212,255,0.3)',
                    background: 'rgba(0,212,255,0.1)',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPortal
