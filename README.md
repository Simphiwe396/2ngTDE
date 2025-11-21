# Clinch Glow — Full Stack (Render + PostgreSQL)

This package contains a static frontend (inside `public/`) and a Node.js + Express backend that uses PostgreSQL.

## Files included
- public/ (frontend files: index.html, store.html, cart.html, admin.html, success.html, style.css, store.js, cart.js, admin.js, products.json)
- server.js (Express API)
- package.json
- .env.example
- migrations.sql (create table SQL)

## Setup (local)
1. Install dependencies:
   ```
   npm install
   ```
2. Create a PostgreSQL database and set `DATABASE_URL` environment variable (or use .env).
3. Start server:
   ```
   DATABASE_URL=postgres://... node server.js
   ```
4. Visit http://localhost:3000

## Deploying to Render
1. Create a new Web Service on Render, connect your Git repo or upload these files.
2. Add a PostgreSQL database on Render.
3. Set `DATABASE_URL` env var in Render to the database URL provided.
4. Start command: `npm start`

Notes:
- The admin panel calls `/api/products` to add/delete. If the DB is empty the server will fall back to bundled `public/products.json`.
- PayFast credentials in frontend should be replaced with your merchant_id and merchant_key and return/cancel URLs updated.
