import "dotenv/config"
import cors from "cors"
import express from "express"
import session from "express-session"
import connectPgSimple from "connect-pg-simple"
import path from "node:path"
import { fileURLToPath } from "node:url"
import authRouter from "./auth.js"
import { databaseConfigured, pool } from "./db.js"
import passport, { googleOAuthConfigured } from "./passport.js"

const app = express()
const port = Number(process.env.PORT) || 3000
const backendDir = path.dirname(fileURLToPath(import.meta.url))
const frontendBuild = path.resolve(backendDir, "../dist")
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
const sessionSecret = process.env.SESSION_SECRET
const isProduction = process.env.NODE_ENV === "production"
const PgSessionStore = connectPgSimple(session)

// Fail early in production if session signing or persistent database settings are missing.
if (isProduction && !sessionSecret) {
    throw new Error("SESSION_SECRET must be set when NODE_ENV=production")
}
if (isProduction && !databaseConfigured) {
    throw new Error("Set DATABASE_URL or PGHOST, PGDATABASE, and PGUSER in production")
}

// Trust the hosting proxy so secure session cookies are sent over HTTPS.
if (isProduction) app.set("trust proxy", 1)

// Restrict credentialed API requests to the configured frontend origin.
app.use(cors({ origin: frontendUrl, credentials: true }))
app.use(express.json())

// Store sessions in PostgreSQL when configured and in memory during initial local setup.
app.use(session({
    name: "movie-app.sid",
    secret: sessionSecret || "local-development-session-secret-change-before-deploy",
    resave: false,
    saveUninitialized: false,
    store: databaseConfigured ? new PgSessionStore({ pool, createTableIfMissing: true }) : undefined,
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax"),
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
}))

// Initialize Passport only after Express session middleware is ready.
app.locals.passport = passport
app.locals.frontendUrl = frontendUrl
app.use(passport.initialize())
app.use(passport.session())
app.use("/api/auth", authRouter)

// Persist saved titles per authenticated user.
app.get("/api/lists", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Sign in to view your list." })
    try {
        const result = await pool.query('SELECT tmdb_id AS id, media_type, title, year, rating, genre, poster, backdrop, overview, genre_ids AS "genreIds" FROM saved_movies WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id])
        return res.json({ movies: result.rows })
    } catch (error) { return next(error) }
})

app.put("/api/lists/:mediaType/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Sign in to save titles." })
    const { mediaType } = req.params
    const id = Number(req.params.id)
    const movie = req.body
    if (!Number.isSafeInteger(id) || id <= 0 || !["movie", "tv"].includes(mediaType) || !movie || typeof movie.title !== "string" || typeof movie.poster !== "string") return res.status(400).json({ error: "A valid movie or series is required." })
    try {
        const result = await pool.query('INSERT INTO saved_movies (user_id,tmdb_id,media_type,title,year,rating,genre,poster,backdrop,overview,genre_ids) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (user_id,tmdb_id,media_type) DO UPDATE SET title=EXCLUDED.title,year=EXCLUDED.year,rating=EXCLUDED.rating,genre=EXCLUDED.genre,poster=EXCLUDED.poster,backdrop=EXCLUDED.backdrop,overview=EXCLUDED.overview,genre_ids=EXCLUDED.genre_ids RETURNING tmdb_id AS id,media_type,title,year,rating,genre,poster,backdrop,overview,genre_ids AS "genreIds"',
            [req.user.id,id,mediaType,movie.title,String(movie.year||"N/A"),String(movie.rating||"N/A"),String(movie.genre||(mediaType==="tv"?"Series":"Movie")),movie.poster,String(movie.backdrop||""),String(movie.overview||""),Array.isArray(movie.genreIds)?movie.genreIds.filter(Number.isInteger):[]])
        return res.json({ movie: result.rows[0] })
    } catch (error) { return next(error) }
})

app.delete("/api/lists/:mediaType/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Sign in to edit your list." })
    if (!["movie", "tv"].includes(req.params.mediaType) || !/^\d+$/.test(req.params.id)) return res.status(400).json({ error: "A valid movie or series is required." })
    try {
        await pool.query("DELETE FROM saved_movies WHERE user_id=$1 AND tmdb_id=$2 AND media_type=$3", [req.user.id, req.params.id, req.params.mediaType])
        return res.json({ removed: true })
    } catch (error) { return next(error) }
})

// Keep the current informational page catalogue in memory for the frontend.
const pages = [
    { slug: "home", title: "Home", path: "/", description: "Browse movies and series." },
    { slug: "search", title: "Search", path: "/search", description: "Search movies and series." },
    { slug: "details", title: "Details", path: "/details/:mediaType/:id", description: "View a movie or series." },
    { slug: "profile", title: "Profile", path: "/profile", description: "Manage your profile." },
    { slug: "my-lists", title: "My Lists", path: "/my-lists", description: "View saved movies and series." },
    { slug: "privacy", title: "Privacy", path: "/privacy", description: "Read the privacy information." },
    { slug: "policies", title: "Policies", path: "/policies", description: "Read the service policies." },
    { slug: "login", title: "Login", path: "/login", description: "Sign in with Google." },
]

// Expose service readiness without leaking database or OAuth credentials.
app.get("/api/health", (_req, res) => res.json({
    status: "ok",
    database: databaseConfigured ? "configured" : "not_configured",
    googleOAuth: googleOAuthConfigured ? "configured" : "not_configured",
}))

// Return the full page catalogue used by the app.
app.get("/api/pages", (_req, res) => res.json({ pages }))

// Return one page record or a consistent API not-found response.
app.get("/api/pages/:slug", (req, res) => {
    const page = pages.find((item) => item.slug === req.params.slug)
    if (!page) return res.status(404).json({ error: "Page not found" })
    return res.json({ page })
})

// Serve built frontend assets and support client-side route refreshes.
app.use(express.static(frontendBuild))
app.use("/api", (_req, res) => res.status(404).json({ error: "API route not found" }))
app.get("/{*path}", (_req, res) => res.sendFile(path.join(frontendBuild, "index.html")))

// Return safe API errors while keeping detailed diagnostics in the server logs.
app.use((error, _req, res, _next) => {
    console.error("Request failed:", error.message)
    if (res.headersSent) return
    return res.status(500).json({ error: "The request could not be completed." })
})

// Start the HTTP server after registering middleware and routes.
app.listen(port, () => {
    console.log("Movie app server listening on port " + port)
    if (!databaseConfigured) console.warn("PostgreSQL is not configured; database-backed auth is disabled.")
    if (!googleOAuthConfigured) console.warn("Google OAuth is not configured; sign-in is disabled.")
})

// Close the PostgreSQL pool cleanly when the process is stopped.
for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, async () => {
        await pool.end()
        process.exit(0)
    })
}

