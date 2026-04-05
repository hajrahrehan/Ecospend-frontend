import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as ApiManager from '../helpers/ApiManager.tsx'

import p1 from '../assets/img/products/p1.png'
import p2 from '../assets/img/products/p2.png'
import p3 from '../assets/img/products/p3.png'
import p4 from '../assets/img/products/p4.png'

const products = [
  { id: 'prod-1', name: 'Nebula Headphones', price: 12000, img: p1 },
  { id: 'prod-2', name: 'Photon Smartwatch', price: 18000, img: p2 },
  { id: 'prod-3', name: 'Gravity Backpack', price: 9000, img: p3 },
  { id: 'prod-4', name: 'Orbit Desk Lamp', price: 6500, img: p4 },
]

const discountFor = (level = 'Basic') => {
  if (level.toLowerCase().includes('platinum')) return 0.2
  if (level.toLowerCase().includes('gold')) return 0.1
  return 0
}

const EcoMall = () => {
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const discount = discountFor(user?.type || 'Basic')

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

  const addToCart = (item) => {
    setCart((prev) => [...prev, item])
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0)
  const discountedTotal = Math.max(0, total - total * discount)

  const checkout = async () => {
    if (!cart.length) return
    for (const item of cart) {
      await ApiManager.BuyCompanyProduct({ name: item.name, price: item.price })
    }
    const res = await ApiManager.UserInfo()
    setUser(res?.data?.user || user)
    setCart([])
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.2em' }}>ECOMALL ORBIT</h2>
          <p style={{ fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.6)', fontSize: 12 }}>
            Account level discount: {(discount * 100).toFixed(0)}%
          </p>
        </div>
        <div style={{
          background: 'rgba(10,22,40,0.6)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 12,
          padding: '10px 14px',
          color: '#fff',
          fontFamily: 'var(--font-data)',
          fontSize: 12,
        }}>
          BALANCE: PKR {user?.balance?.toLocaleString() || '—'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {products.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4 }}
            style={{
              background: 'rgba(10,22,40,0.7)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 14,
              padding: 16,
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{
              height: 140,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(123,79,255,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src={item.img} alt={item.name} style={{ maxWidth: '90%', maxHeight: '90%' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>{item.name}</div>
            <div style={{ fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.7)' }}>
              PKR {item.price.toLocaleString()}
            </div>
            <button
              onClick={() => addToCart(item)}
              style={{
                marginTop: 'auto',
                padding: '10px 12px',
                background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,79,255,0.2))',
                border: '1px solid rgba(0,212,255,0.35)',
                borderRadius: 10,
                color: '#fff',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.15em',
                cursor: 'pointer',
              }}
            >
              BUY NOW
            </button>
          </motion.div>
        ))}
      </div>

      <div style={{
        marginTop: 24,
        background: 'rgba(10,22,40,0.6)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 14,
        padding: 16,
        color: '#fff',
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.15em', marginBottom: 8 }}>CART</h3>
        {cart.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.6)' }}>
            Cart is empty.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
            {cart.map((item, idx) => (
              <li key={`${item.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-data)' }}>
                <span>{item.name}</span>
                <span>PKR {item.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 10, fontFamily: 'var(--font-data)' }}>
          TOTAL: PKR {total.toLocaleString()} · AFTER DISCOUNT: PKR {discountedTotal.toLocaleString()}
        </div>
        <button
          onClick={checkout}
          style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(123,79,255,0.25))',
            border: '1px solid rgba(0,212,255,0.35)',
            borderRadius: 10,
            color: '#fff',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.15em',
            cursor: 'pointer',
          }}
        >
          CHECKOUT
        </button>
      </div>
    </div>
  )
}

export default EcoMall
