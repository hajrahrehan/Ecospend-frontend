// src/store/gamification.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const XP_TABLE = {
  LOGIN:             5,
  DAILY_LOGIN:      15,
  TRANSFER:         10,
  ADD_BENEFICIARY:  15,
  VIEW_STATEMENT:    3,
  SUBMIT_TICKET:     8,
  PURCHASE:         20,
  PROFILE_UPDATE:    5,
  CARD_VIEW:         2,
  STREAK_7:         50,
  STREAK_30:       200,
}

const LEVELS = [
  { level: 1,  title: 'Electron',   minXP: 0    },
  { level: 2,  title: 'Photon',     minXP: 50   },
  { level: 3,  title: 'Neutron',    minXP: 150  },
  { level: 4,  title: 'Proton',     minXP: 300  },
  { level: 5,  title: 'Atom',       minXP: 500  },
  { level: 6,  title: 'Molecule',   minXP: 800  },
  { level: 7,  title: 'Plasma',     minXP: 1200 },
  { level: 8,  title: 'Quasar',     minXP: 1800 },
  { level: 9,  title: 'Nebula',     minXP: 2600 },
  { level: 10, title: 'Singularity',minXP: 3600 },
]

export const useGamificationStore = create(
  persist(
    (set, get) => ({
      xp: 0, streak: 0, lastLogin: null, pendingXP: null,
      
      get level() {
        const xp = get().xp
        return [...LEVELS].reverse().find(l => xp >= l.minXP) ?? LEVELS[0]
      },
      get nextLevel() {
        const curr = get().level
        return LEVELS.find(l => l.level === curr.level + 1) ?? null
      },
      get xpToNext() {
        const next = get().nextLevel
        return next ? next.minXP - get().xp : Infinity
      },
      get xpProgress() {
        const curr = get().level; const next = get().nextLevel
        if (!next) return 1
        return (get().xp - curr.minXP) / (next.minXP - curr.minXP)
      },
      
      addXP: (action) => {
        const amount = XP_TABLE[action] ?? 0
        if (!amount) return
        const prevLevel = get().level
        set(s => ({ xp: s.xp + amount, pendingXP: { amount, action } }))
        const newLevel = get().level
        if (newLevel.level > prevLevel.level) get().onLevelUp(newLevel)
      },
      
      clearPendingXP: () => set({ pendingXP: null }),
      
      checkStreak: () => {
        const today = new Date().toDateString()
        const last  = get().lastLogin
        if (last === today) return
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        set(s => ({
          streak: last === yesterday ? s.streak + 1 : 1,
          lastLogin: today,
        }))
        if (get().streak >= 7)  get().addXP('STREAK_7')
        if (get().streak >= 30) get().addXP('STREAK_30')
      },
      
      onLevelUp: (newLevel) => {
        import('canvas-confetti').then(({ default: c }) => {
          // Dual cannon burst
          c({ particleCount: 150, spread: 80, origin: { x: 0.3, y: 0.5 }, colors: ['#00D4FF','#7B4FFF','#FFB830'] })
          c({ particleCount: 150, spread: 80, origin: { x: 0.7, y: 0.5 }, colors: ['#00FF87','#FFB830','#00D4FF'] })
        })
      },
    }),
    { name: 'ecospend-xp' }
  )
)
