import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY

if (!url || !key) {
  // Fail loudly during dev / build so misconfigured envs surface
  // immediately instead of producing cryptic 401s at request time.
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY ' +
    'in .env.local for local dev, and in the Vercel project Environment ' +
    'Variables for production. See .env.local.example for the format.'
  )
}

/**
 * Singleton Supabase client used across the app.
 *
 * - persistSession: true → session stored in localStorage so reloads keep
 *   the user signed in.
 * - autoRefreshToken: true → access tokens are silently refreshed via the
 *   long-lived refresh token; effectively keeps the user signed in for
 *   ~90 days of activity (Supabase's default refresh-token lifetime).
 * - detectSessionInUrl: true → on the /auth/callback page, the magic-link
 *   tokens (whether returned in the URL hash or PKCE ?code=) are picked
 *   up automatically during client init.
 * - flowType: 'pkce' → safer flow for SPAs; matches Supabase's modern
 *   default and works with the dashboard's default email template.
 */
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
