import "dotenv/config"
import pg from "pg"
// Require a URL or the key PostgreSQL fields before enabling database features.
const databaseUrl = process.env.DATABASE_URL?.trim()
export const databaseConfigured = Boolean(
    databaseUrl || (process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER),
)

// Use the provider URL when present, otherwise use the local connection fields.
const poolOptions = databaseUrl
    ? { connectionString: databaseUrl }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || "movie_app",
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || undefined,
    }

// Enable TLS only when the selected PostgreSQL provider requires it.
if (process.env.PGSSL === "true") {
    poolOptions.ssl = { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" }
}

// Share one bounded connection pool between authentication and API requests.
export const pool = new pg.Pool(poolOptions)
pool.on("error", (error) => console.error("Unexpected PostgreSQL pool error:", error.message))
