# Streamline Movie App

## Run locally

1. Copy the root .env.example to .env and add VITE_TMDB_TOKEN; leave VITE_API_URL blank for the Vite proxy.
2. Copy backend/.env.example to backend/.env, then fill in PostgreSQL settings and a random session secret.
3. Create the movie_app database, then run psql "postgresql://postgres:password@localhost:5432/movie_app" -f backend/schema.sql from the project root, replacing the connection values.
4. Create a Google OAuth client and allow the redirect URI http://localhost:3000/api/auth/google/callback.
5. Run npm install in the project root and npm install in backend.
6. Start the API with npm run dev from backend; start Vite with npm run dev from the project root.

Google sign-in requires PostgreSQL plus both Google credentials. The API can start while local values are pending; database-backed authentication stays disabled until they are set. PostgreSQL also stores Passport sessions after the connection is configured.

## Deploy

1. Build and deploy the Vite frontend, setting VITE_TMDB_TOKEN and VITE_API_URL to the public backend origin.
2. Deploy the Express backend separately with DATABASE_URL, SESSION_SECRET, FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.
3. Set GOOGLE_CALLBACK_URL to the backend origin plus /api/auth/google/callback, then register that exact HTTPS URL in Google Cloud Console.
4. The backend defaults deployed cookies to SameSite=None and Secure; use a stable random SESSION_SECRET.

## Validation

Run npm run lint and npm run build before deploying the frontend.
