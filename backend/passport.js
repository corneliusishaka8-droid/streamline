import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { databaseConfigured, pool } from "./db.js"

// Enable OAuth only after PostgreSQL and both Google credentials are supplied.
export const googleOAuthConfigured = Boolean(
    databaseConfigured && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
)

// Register the Google strategy only when its provider credentials are available.
if (googleOAuthConfigured) {
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            state: true,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                // Upsert the Google account so repeat sign-ins refresh public profile data.
                const result = await pool.query(
                    "INSERT INTO users (google_id, name, email, avatar_url) " +
                    "VALUES ($1, $2, $3, $4) " +
                    "ON CONFLICT (google_id) DO UPDATE SET name = EXCLUDED.name, " +
                    "email = EXCLUDED.email, avatar_url = EXCLUDED.avatar_url, updated_at = NOW() " +
                    "RETURNING id, google_id, name, email, avatar_url",
                    [
                        profile.id,
                        profile.displayName || "Google user",
                        profile.emails?.[0]?.value || null,
                        profile.photos?.[0]?.value || null,
                    ],
                )
                return done(null, result.rows[0])
            } catch (error) {
                return done(error)
            }
        },
    ))
}

// Keep only the internal user ID in Passport's serialized session data.
passport.serializeUser((user, done) => done(null, user.id))

// Reload the user from PostgreSQL instead of trusting profile data in a cookie.
passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query(
            "SELECT id, google_id, name, email, avatar_url FROM users WHERE id = $1",
            [id],
        )
        return done(null, result.rows[0] || false)
    } catch (error) {
        return done(error)
    }
})

export default passport

