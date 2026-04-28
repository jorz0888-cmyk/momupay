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

// Register the PWA service worker. We do this in production only — Vite's
// dev server actively interferes with SW caching (HMR, /@vite/* paths) and
// it's just noise locally. Registration is fire-and-forget; failures are
// logged but never block the app.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      // eslint-disable-next-line no-console
      .catch((err) => console.warn('SW registration failed:', err))
  })
}

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
    </BrowserRouter>
  </StrictMode>,
)
