# Supabase 3D Registration Website

A responsive 3D/parallax registration form powered by Supabase Auth, PostgreSQL, and private Storage.

## Project structure

- src/main.js — frontend + Supabase registration flow
- src/style.css — 3D/parallax responsive UI
- supabase/schema.sql — database, RLS, trigger, and private photo bucket policies
- .env.example — required environment variable template
- .gitignore — prevents secrets/dependencies/build files from being committed

## Local setup

1. Copy .env.example to .env.
2. Set VITE_SUPABASE_URL to your Supabase project URL.
3. Set VITE_SUPABASE_PUBLISHABLE_KEY to your Supabase publishable key.
4. Run the SQL in supabase/schema.sql in Supabase SQL Editor.
5. Disable email confirmation for the immediate one-page registration flow.
6. Run npm install.
7. Run npm run dev.

Never commit .env or a Supabase secret/service-role key.

## Build

npm run build

The Vite output is dist/ and can be deployed to a free static host such as Netlify.
