import React, { useEffect, useState, memo, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import QuantumHUD from './components/QuantumHUD'
import QuantumDevStats from './components/QuantumDevStats'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/Login'

import AuthLayout from "layouts/auth/Auth.js";
import AdminAuth from "layouts/auth/AdminAuth.js";
import NonAuthLayout from "layouts/nonauth/SignIn";
import AdminSignIn from "layouts/nonauth/AdminSignIn";
import Products from "layouts/nonauth/Products";

import ThemeContextWrapper from "./components/ThemeWrapper/ThemeWrapper";
import BackgroundColorWrapper from "./components/BackgroundColorWrapper/BackgroundColorWrapper";
import MainShell from "./components/MainShell";

const QuantumField = lazy(() => import('./components/QuantumField'))
const DashboardPage = lazy(() => import('./pages/Dashboard'))
const TransferPage = lazy(() => import('./pages/Transfer'))
const EcoAIPage = lazy(() => import('./pages/EcoAI'))
const EcoMallPage = lazy(() => import('./pages/EcoMall'))
const SupportPage = lazy(() => import('./pages/Support'))
const ProfilePage = lazy(() => import('./pages/Profile'))
const CardsPage = lazy(() => import('./pages/Cards'))
const AdminPortalPage = lazy(() => import('./pages/AdminPortal'))
const SignUpPage = lazy(() => import('./pages/SignUp'))
const PerformanceTuner = memo(({ onQualityChange, onDprChange }) => {
  return (
    <PerformanceMonitor
      onDecline={() => {
        onQualityChange?.('low')
        onDprChange?.(1)
      }}
      onIncline={() => {
        onQualityChange?.('high')
        onDprChange?.(1.5)
      }}
    />
  )
})

const QuantumCanvas = () => {
  const [quality, setQuality] = useState('high')
  const [dpr, setDpr] = useState(1.5)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e) => setReducedMotion(e.matches)
    handleChange(mq)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true, stencil: false }}
      shadows={false}
      dpr={dpr}
    >
      <PerformanceTuner onQualityChange={setQuality} onDprChange={setDpr} />
      <Suspense fallback={null}>
        <QuantumField performanceLevel={quality} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  )
}

const App3D = () => (
  <ThemeContextWrapper>
    <BackgroundColorWrapper>
      <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', background: 'var(--eco-void)' }}>
        {/* Persistent 3D cosmos background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <QuantumCanvas />
        </div>
        
        {/* All React Router content lives here — above the canvas */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <BrowserRouter>
            <Suspense fallback={null}>
              <Routes>
                {/* Overwritten Gamified Routes */}
                <Route path="/auth" element={<LoginPage />} />
                <Route path="/main" element={<MainShell />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="transfer" element={<TransferPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="cards" element={<CardsPage />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="ecoai" element={<EcoAIPage />} />
                  <Route path="ecomall" element={<EcoMallPage />} />
                  <Route path="mall" element={<EcoMallPage />} />
                  <Route path="*" element={<Navigate to="/main/dashboard" replace />} />
                </Route>
                <Route path="/admin" element={<AdminPortalPage />} />

                {/* Existing Routes Fallbacks */}
                <Route path="/register" element={<SignUpPage />} />
                <Route path="/register-legacy" element={<NonAuthLayout />} />
                <Route path="/admin-auth" element={<AdminSignIn />} />
                <Route path="/products" element={<Products />} />
                <Route path="/main/*" element={<AuthLayout />} />
                <Route path="/admin/legacy/*" element={<AdminAuth />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </div>
        
        {/* Global HUD elements */}
        <QuantumHUD />
        {process.env.NODE_ENV === 'development' ? <QuantumDevStats /> : null}
        <Toaster />
      </div>
    </BackgroundColorWrapper>
  </ThemeContextWrapper>
);

export default App3D;
