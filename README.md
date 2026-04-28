# MomuPay

リラクゼーションサロン向けのお会計プラットフォーム（React + Vite）。

## Environment variables

Frontend reads two Supabase variables. They are publishable (safe to embed in
the browser bundle) but must still be configured before the app boots.

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (e.g. `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_KEY` | Supabase publishable / anon key (`sb_publishable_...`) |

### Local development
Copy `.env.local.example` to `.env.local` and fill in the values. `.env.local`
is gitignored.

### Vercel (production)
Set both variables in the Vercel project:

1. Vercel Dashboard → the **momupay** project → **Settings** → **Environment
   Variables**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`. Mark them for **Production**,
   **Preview**, and **Development** environments.
3. Trigger a redeploy (push any commit, or use the **Redeploy** button) so
   Vite picks up the new env at build time. Vite inlines `import.meta.env.*`
   at build, so the values must exist when the build runs — runtime-only env
   changes do NOT take effect for already-built bundles.

The publishable key is safe to expose, but never use the `service_role` key
on the frontend.

## Vite + React

This project uses the official Vite React template. Two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
