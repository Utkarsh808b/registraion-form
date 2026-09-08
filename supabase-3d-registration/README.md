# Supabase 3D Registration Website

A zero-cost-to-start static frontend + Supabase backend registration form.

## Features

- Full name, gender, DOB calendar
- Valid email input
- Valid Indian mobile number (6–9 + 9 digits)
- Mechanical Engineering vs Computer Science
- Supabase Auth password
- Private picture upload, max 15 MB
- Message box
- Supabase Postgres registration table
- Row Level Security
- Private Storage bucket with per-user folder policy
- 3D/parallax landing experience using only CSS + JavaScript
- Success popup: “Thanks for registering, NAME!”

## 1. Create the Supabase project

Create a free Supabase project. In the SQL Editor, run `supabase/schema.sql`.

The SQL creates:
- `public.registrations`
- Auth trigger
- `registration-photos` private Storage bucket
- RLS policies

## 2. Auth setting required for this exact one-page flow

The frontend signs up first and then uploads the picture using the newly-created authenticated session.

For this immediate-flow version, turn **Email Confirmations OFF** in Supabase Authentication settings. Otherwise `signUp()` can return a user without a session and the browser cannot upload the private photo immediately.

If you want verified-email registration instead, implement a confirmation page and move the photo upload to that authenticated step.

## 3. Configure frontend

Copy `.env.example` to `.env` and put in:
- Supabase Project URL
- Supabase Publishable Key

Never put a Supabase secret/service-role key in this frontend.

## 4. Run

```bash
npm install
npm run dev
```

## 5. Build/deploy

```bash
npm run build
```

The `dist/` directory can be deployed to a free static host such as GitHub Pages (with an appropriate Vite base setting) or another static hosting service.

## Important

“Completely free” means this project is designed to run within free-tier quotas. Hosting providers and Supabase can change quotas/limits, so check the current plan before launching a high-traffic production site.
