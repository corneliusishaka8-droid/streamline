import cors from "cors"
import express from "express"
import path from "node:path"
import { fileURLToPath } from "node:url"

const app = express()
const port = Number(process.env.PORT) || 3000
const backendDir = path.dirname(fileURLToPath(import.meta.url))
const frontendBuild = path.resolve(backendDir, "../dist")

// This is the app's current page catalogue. It is served from memory until
// page metadata needs to move into a database.
const pages = [
    { slug: "home", title: "Home", path: "/", description: "Browse movies and series." },
    { slug: "search", title: "Search", path: "/search", description: "Search movies and series." },
    { slug: "details", title: "Details", path: "/details/:mediaType/:id", description: "View a movie or series." },
    { slug: "profile", title: "Profile", path: "/profile", description: "Manage your profile." },
    { slug: "my-lists", title: "My Lists", path: "/my-lists", description: "View saved movies and series." },
    { slug: "privacy", title: "Privacy", path: "/privacy", description: "Read the privacy information." },
    { slug: "policies", title: "Policies", path: "/policies", description: "Read the service policies." },
    { slug: "login", title: "Login", path: "/login", description: "Sign in to your local demo profile." },
]

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => res.json({ status: "ok" }))
app.get("/api/pages", (_req, res) => res.json({ pages }))
app.get("/api/pages/:slug", (req, res) => {
    const page = pages.find((item) => item.slug === req.params.slug)
    if (!page) return res.status(404).json({ error: "Page not found" })
    return res.json({ page })
})

// Serve the React build in production so refreshes on client routes work.
app.use(express.static(frontendBuild))
app.use("/api", (_req, res) => res.status(404).json({ error: "API route not found" }))
app.get("/{*path}", (_req, res) => res.sendFile(path.join(frontendBuild, "index.html")))

app.listen(port, () => console.log(`Movie app server listening on port ${port}`))
