import { Router } from "express"
import { googleOAuthConfigured } from "./passport.js"

// Group Google sign-in, profile, and sign-out routes under /api/auth.
const authRouter = Router()

// Start the Google OAuth flow only after database and provider setup is complete.
authRouter.get("/google", (req, res, next) => {
    if (!googleOAuthConfigured) {
        return res.status(503).json({
            error: "Google sign-in needs PostgreSQL and Google OAuth credentials.",
        })
    }
    return req.app.locals.passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
    })(req, res, next)
})

// Validate Google's callback, establish a session, and return to the frontend.
authRouter.get(
    "/google/callback",
    (req, res, next) => {
        if (!googleOAuthConfigured) {
            return res.redirect(req.app.locals.frontendUrl + "/login?auth=not-configured")
        }
        return req.app.locals.passport.authenticate("google", {
            failureRedirect: req.app.locals.frontendUrl + "/login?auth=failed",
        })(req, res, next)
    },
    (_req, res) => res.redirect(res.app.locals.frontendUrl + "/profile?auth=success"),
)

// Return only profile fields the frontend needs.
authRouter.get("/me", (req, res) => {
    if (!req.isAuthenticated()) return res.json({ user: null })
    const { id, name, email, avatar_url: avatarUrl } = req.user
    return res.json({ user: { id, name, email, avatarUrl } })
})

// Remove both the Passport login and the persisted server-side session.
authRouter.post("/logout", (req, res, next) => {
    req.logout((logoutError) => {
        if (logoutError) return next(logoutError)
        req.session.destroy((sessionError) => {
            if (sessionError) return next(sessionError)
            res.clearCookie("movie-app.sid")
            return res.json({ user: null })
        })
    })
})

export default authRouter
