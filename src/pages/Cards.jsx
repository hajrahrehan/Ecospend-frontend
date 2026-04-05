import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as ApiManager from '../helpers/ApiManager.tsx'

const CardTile = ({ card, onBlock }) => {
  const [flipped, setFlipped] = useState(false)
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => setFlipped((v) => !v)}
      style={{
        background: 'rgba(10,22,40,0.7)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 16,
        padding: 18,
        color: '#fff',
        cursor: 'pointer',
        perspective: 1000,
      }}
    >
      {!flipped ? (
        <div>
          <div style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.2em' }}>{card.type.toUpperCase()}</div>
          <div style={{ marginTop: 20, fontFamily: 'var(--font-data)', fontSize: 16, letterSpacing: '0.2em' }}>
            {card.cardnumber}
          </div>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-data)', fontSize: 12, color: 'rgba(0,212,255,0.6)' }}>
            EXP {new Date(card.expiration).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
          </div>
        </div>
      ) : (
        <div style={{ fontFamily: 'var(--font-data)', fontSize: 14 }}>
          SECURITY CVC: {card.cvc}
        </div>
      )}
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: card.isblocked ? 'var(--eco-pulsar)' : 'var(--eco-nova)' }}>
          {card.isblocked ? 'BLOCKED' : 'ACTIVE'}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onBlock?.(card) }}
          style={{
            padding: '6px 10px',
            background: 'rgba(0,212,255,0.12)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'var(--font-data)',
            cursor: 'pointer',
          }}
        >
          BLOCK
        </button>
      </div>
    </motion.div>
  )
}

const Cards = () => {
  const [cards, setCards] = useState([])

  useEffect(() => {
    let isActive = true
    const load = async () => {
      const res = await ApiManager.UserCards()
      if (!isActive) return
      setCards(res?.data || [])
    }
    load()
    return () => { isActive = false }
  }, [])

  const blockCard = (card) => {
    setCards((prev) => prev.map((c) => (c._id === card._id ? { ...c, isblocked: true } : c)))
  }

  const requestNew = () => {
    const newCard = {
      _id: `card-${Date.now()}`,
      cardnumber: '4000 0000 0000 0000',
      cvc: '000',
      expiration: '2028-12-01',
      type: 'Virtual',
      isblocked: false,
    }
    setCards((prev) => [newCard, ...prev])
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.2em' }}>DIGITAL CARDS</h2>
        <button
          onClick={requestNew}
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
          REQUEST NEW
        </button>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {cards.map((card) => (
          <CardTile key={card._id} card={card} onBlock={blockCard} />
        ))}
      </div>
    </div>
  )
}

export default Cards
