import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Canvas } from '@react-three/fiber'
import QuantumField from './components/QuantumField'
import QuantumHUD from './components/QuantumHUD'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import TransferPage from './pages/Transfer'

import AuthLayout from "layouts/auth/Auth.js";
import AdminAuth from "layouts/auth/AdminAuth.js";
import NonAuthLayout from "layouts/nonauth/SignIn";
import AdminSignIn from "layouts/nonauth/AdminSignIn";
import Products from "layouts/nonauth/Products";

import ThemeContextWrapper from "./components/ThemeWrapper/ThemeWrapper";
import BackgroundColorWrapper from "./components/BackgroundColorWrapper/BackgroundColorWrapper";
import { useRoomMotion } from "./three/RoomMotion";

export const roomSlots = [
  {
    id: "vault-core",
    wall: "right",
    x: -120,
    y: 80,
    z: -40,
    width: 440,
    height: 280,
    type: "coins",
  },
  {
    id: "orbit-ledger",
    wall: "back",
    x: -240,
    y: 180,
    z: 0,
    width: 360,
    height: 220,
    type: "orbit",
  },
  {
    id: "credit-stream",
    wall: "left",
    x: 220,
    y: -40,
    z: 40,
    width: 340,
    height: 200,
    type: "ledger",
  },
];

const RouteMotionTrigger = () => {
  const location = useLocation();
  const { playRouteTransition } = useRoomMotion();

  useEffect(() => {
    if (playRouteTransition) playRouteTransition(location.pathname);
  }, [location.pathname, playRouteTransition]);

  return null;
};

const App3D = () => (
  <ThemeContextWrapper>
    <BackgroundColorWrapper>
      <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', background: 'var(--eco-void)' }}>
        {/* Persistent 3D cosmos background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
            dpr={[1, 1.5]}
          >
            <QuantumField />
          </Canvas>
        </div>
        
        {/* All React Router content lives here — above the canvas */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <BrowserRouter>
            <RouteMotionTrigger />
            <Routes>
              {/* Overwritten Gamified Routes */}
              <Route path="/auth" element={<LoginPage />} />
              <Route path="/main/dashboard" element={<DashboardPage />} />
              <Route path="/main/transfer" element={<TransferPage />} />

              {/* Existing Routes Fallbacks */}
              <Route path="/register" element={<NonAuthLayout />} />
              <Route path="/admin-auth" element={<AdminSignIn />} />
              <Route path="/products" element={<Products />} />
              <Route path="/main/*" element={<AuthLayout />} />
              <Route path="/admin/*" element={<AdminAuth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
        
        {/* Global HUD elements */}
        <QuantumHUD />
        <Toaster />
      </div>
    </BackgroundColorWrapper>
  </ThemeContextWrapper>
);

export default App3D;
