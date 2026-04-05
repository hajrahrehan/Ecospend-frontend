import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

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
import { QuantumBackground } from "./components/QuantumBackground";
import { getPerfTier } from "./lib/perfTier";

const DashboardPage = lazy(() => import('./pages/Dashboard'))
const TransferPage = lazy(() => import('./pages/Transfer'))
const EcoAIPage = lazy(() => import('./pages/EcoAI'))
const EcoMallPage = lazy(() => import('./pages/EcoMall'))
const SupportPage = lazy(() => import('./pages/Support'))
const ProfilePage = lazy(() => import('./pages/Profile'))
const CardsPage = lazy(() => import('./pages/Cards'))
const AdminPortalPage = lazy(() => import('./pages/AdminPortal'))
const SignUpPage = lazy(() => import('./pages/SignUp'))
const App3D = () => {
  const [tier] = useState(() => getPerfTier())

  return (
    <ThemeContextWrapper>
      <BackgroundColorWrapper>
        <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', background: 'var(--eco-void)' }}>
          {/* Adaptive background layer */}
          <QuantumBackground tier={tier} />
        
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
  )
};

export default App3D;
