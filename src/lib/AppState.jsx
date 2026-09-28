import { createContext, useContext, useEffect, useState } from "react"
import { apiUrl } from "./api"

const AppStateContext = createContext(null)

// Keep the signed-in Google profile synchronized with the server session.
export function AppStateProvider({ children }) {
    const [savedMovies, setSavedMovies] = useState([])
    const [user, setUser] = useState(null)
    const [notice, setNotice] = useState("")
    const [listLoading, setListLoading] = useState(true)
    const [listError, setListError] = useState("")

    // Restore the current profile from the session cookie when the app loads.
    useEffect(() => {
        let active = true
        fetch(apiUrl("/api/auth/me"), { credentials: "include" })
            .then((response) => response.ok ? response.json() : Promise.reject(new Error("Profile request failed")))
            .then(({ user: currentUser }) => {
                if (!active) return
                setUser(currentUser)
                if (!currentUser) {
                    setSavedMovies([])
                    setListLoading(false)
                    setListError("")
                    return
                }

                // Load the list separately so a list failure cannot clear a valid login.
                fetch(apiUrl("/api/lists"), { credentials: "include" })
                    .then((response) => response.ok ? response.json() : Promise.reject(new Error("List request failed")))
                    .then(({ movies }) => {
                        if (active) { setSavedMovies(movies); setListError("") }
                    })
                    .catch(() => {
                        if (active) setListError("Could not load your list. Check the database setup and try again.")
                    })
                    .finally(() => { if (active) setListLoading(false) })
            })
            .catch(() => {
                if (active) {
                    setUser(null)
                    setSavedMovies([])
                    setListError("Could not verify your sign-in. Please refresh or sign in again.")
                }
            })
            .finally(() => {
                // This finally runs after the profile request; list loading has its own finally.
                if (active) setListLoading(false)
            })
        return () => {
            active = false
        }
    }, [])

    // Clear transient saved-title notifications after a short delay.
    useEffect(() => {
        if (!notice) return undefined
        const timeout = window.setTimeout(() => setNotice(""), 2800)
        return () => window.clearTimeout(timeout)
    }, [notice])

    // Toggle a title in the in-memory list and announce the result.
    const toggleSavedMovie = async (movie) => {
        if (!user) { setNotice("Sign in to save titles to your list."); return }
        const exists = savedMovies.some((saved) => String(saved.id) === String(movie.id) && saved.media_type === movie.media_type)
        try {
            const response = await fetch(apiUrl(`/api/lists/${movie.media_type}/${movie.id}`), { method: exists ? "DELETE" : "PUT", credentials: "include", headers: exists ? undefined : { "Content-Type": "application/json" }, body: exists ? undefined : JSON.stringify(movie) })
            if (!response.ok) throw new Error("List update failed")
            setSavedMovies((current) => exists ? current.filter((saved) => !(String(saved.id) === String(movie.id) && saved.media_type === movie.media_type)) : [...current, movie])
            setNotice(exists ? movie.title + " removed from your list" : movie.title + " added to your list")
            setListError("")
        } catch { setListError("Could not update your list. Please try again.") }
    }

    // Share authentication and saved-title state across the React app.
    return <AppStateContext.Provider value={{ savedMovies, toggleSavedMovie, user, setUser, listLoading, listError }}>
        {children}
        {notice && <div className="list-toast" role="status" aria-live="polite"><span aria-hidden="true">âœ“</span>{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification">Ã—</button></div>}
    </AppStateContext.Provider>
}

// Require consumers to use the shared provider instead of a missing context.
export function useAppState() {
    const context = useContext(AppStateContext)
    if (!context) throw new Error("useAppState must be used within AppStateProvider")
    return context
}

