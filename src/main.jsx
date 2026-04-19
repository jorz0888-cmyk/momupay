import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PaymentLink from './pages/PaymentLink.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Booking from './pages/Booking.jsx'
import RegisterComplete from './pages/RegisterComplete.jsx'
import PaySuccess from './pages/PaySuccess.jsx'
import PayCancel from './pages/PayCancel.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pay" element={<PaymentLink />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/complete" element={<RegisterComplete />} />
        <Route path="/pay/success" element={<PaySuccess />} />
        <Route path="/pay/cancel" element={<PayCancel />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book/:salonId" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
