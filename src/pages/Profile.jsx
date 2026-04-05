import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as ApiManager from '../helpers/ApiManager.tsx'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [upgradeRequested, setUpgradeRequested] = useState(false)

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

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.2em' }}>PROFILE CONSTELLATION</h2>
      <div style={{
        marginTop: 16,
        background: 'rgba(10,22,40,0.6)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 14,
        padding: 18,
        color: '#fff',
        display: 'grid',
        gap: 10,
      }}>
        <div>NAME: {user ? `${user.fname} ${user.lname}` : '—'}</div>
        <div>EMAIL: {user?.email || '—'}</div>
        <div>ACCOUNT NO: {user?.account_no || '—'}</div>
        <div>LEVEL: {user?.type || 'Standard'}</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginTop: 20,
          background: 'rgba(8,16,28,0.8)',
          border: '1px solid rgba(0,212,255,0.25)',
          borderRadius: 12,
          padding: 16,
          color: '#fff',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.15em', marginBottom: 8 }}>UPGRADE PATH</h3>
        <p style={{ fontFamily: 'var(--font-data)', color: 'rgba(0,212,255,0.6)', fontSize: 12 }}>
          Unlock higher transfer limits and EcoMall discounts.
        </p>
        <button
          onClick={() => setUpgradeRequested(true)}
          style={{
            marginTop: 10,
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
          REQUEST UPGRADE
        </button>
        {upgradeRequested ? (
          <p style={{ marginTop: 8, color: 'var(--eco-solar)', fontFamily: 'var(--font-data)', fontSize: 12 }}>
            Upgrade request queued. Our orbit team will respond shortly.
          </p>
        ) : null}
      </motion.div>
    </div>
  )
}

export default Profile
