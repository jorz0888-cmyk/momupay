/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
// vite-plugin-pwa exposes a virtual module that wires up the SW
// registration AND tracks the "new version available" state for us.
// The hook also fires `onRegisteredSW` so we can install our own
// 60-minute background-update poll.
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from 'virtual:pwa-register/react'

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

const C = {
  espresso: '#2C2418',
  cream: '#FAF6F1',
  terra: '#C4745A',
  bark: '#5C4A32',
}

const styles = {
  toast: {
    position: 'fixed',
    left: 16,
    right: 16,
    // Honor iOS home-indicator safe area + a little breathing room.
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
    zIndex: 2000,
    background: C.espresso,
    color: C.cream,
    borderRadius: 16,
    padding: '14px 14px 14px 18px',
    boxShadow: '0 12px 36px rgba(44,36,24,.28)',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    maxWidth: 480,
    margin: '0 auto',
  },
  msg: {
    flex: 1,
    lineHeight: 1.5,
  },
  updateBtn: {
    background: C.terra,
    color: C.cream,
    border: 'none',
    borderRadius: 999,
    padding: '8px 18px',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    flexShrink: 0,
  },
  closeBtn: {
    background: 'transparent',
    color: C.cream,
    opacity: 0.6,
    border: 'none',
    fontSize: 18,
    lineHeight: 1,
    width: 28,
    height: 28,
    borderRadius: 8,
    cursor: 'pointer',
    flexShrink: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}

function PwaUpdatePrompt() {
  // Manual dismiss state — once the user closes the toast for a given
  // pending update we don't keep nagging them on every render. They'll
  // see the next toast when the *next* version lands.
  const [dismissed, setDismissed] = useState(false)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      // Background update poll. Skip when offline so the fetch doesn't
      // log a noisy network error.
      setInterval(() => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) return
        registration.update().catch(() => { /* swallow — next tick will retry */ })
      }, UPDATE_CHECK_INTERVAL_MS)
    },
    onRegisterError(err) {
      // eslint-disable-next-line no-console
      console.warn('PWA SW registration error:', err)
    },
  })

  if (!needRefresh || dismissed) return null

  const onUpdate = () => {
    // Pass `true` so the helper reloads the page once the new SW takes
    // control. autoUpdate + skipWaiting/clientsClaim in vite.config.js
    // means activation is instant; the reload picks up new bundles.
    updateServiceWorker(true)
  }

  const onDismiss = () => {
    setDismissed(true)
    setNeedRefresh(false)
  }

  return (
    <div role="status" aria-live="polite" style={styles.toast}>
      <span style={styles.msg}>新しいバージョンが利用可能です</span>
      <button type="button" onClick={onUpdate} style={styles.updateBtn}>更新する</button>
      <button type="button" onClick={onDismiss} aria-label="閉じる" style={styles.closeBtn}>✕</button>
    </div>
  )
}

export default PwaUpdatePrompt
