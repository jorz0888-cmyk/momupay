import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PaymentLink from './pages/PaymentLink.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RegisterComplete from './pages/RegisterComplete.jsx'
import PaySuccess from './pages/PaySuccess.jsx'
import PayCancel from './pages/PayCancel.jsx'
import Legal from './pages/Legal.jsx'
import Login from './pages/Login.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PwaUpdatePrompt from './components/PwaUpdatePrompt.jsx'

// Service-worker registration is handled inside <PwaUpdatePrompt /> via
// vite-plugin-pwa's useRegisterSW hook. The prompt also surfaces the
// "new version available" toast when an autoUpdate revision lands.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public marketing + onboarding */}
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/complete" element={<RegisterComplete />} />
        <Route path="/legal" element={<Legal />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Customer-facing payment result pages — public on purpose, the
            customer arriving from Stripe is not a salon-side user. */}
        <Route path="/pay/success" element={<PaySuccess />} />
        <Route path="/pay/cancel" element={<PayCancel />} />

        {/* Salon-side, authenticated only */}
        <Route path="/pay" element={<ProtectedRoute><PaymentLink /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
      <PwaUpdatePrompt />
    </BrowserRouter>
  </StrictMode>,
)
