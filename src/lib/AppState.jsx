import { createContext, useContext, useEffect, useState } from "react"

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
    const [savedMovies, setSavedMovies] = useState([])
    const [user, setUser] = useState(null)
    const [notice, setNotice] = useState("")
    useEffect(() => {
        if (!notice) return undefined
        const timeout = window.setTimeout(() => setNotice(""), 2800)
        return () => window.clearTimeout(timeout)
    }, [notice])
    const toggleSavedMovie = (movie) => {
        const exists = savedMovies.some((saved) => saved.id === movie.id && saved.media_type === movie.media_type)
        setSavedMovies((current) => exists ? current.filter((saved) => saved.id !== movie.id || saved.media_type !== movie.media_type) : [...current, movie])
        setNotice(exists ? `${movie.title} removed from your list` : `${movie.title} added to your list`)
    }
    return <AppStateContext.Provider value={{ savedMovies, toggleSavedMovie, user, setUser }}>
        {children}
        {notice && <div className="list-toast" role="status" aria-live="polite"><span aria-hidden="true">✓</span>{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}
    </AppStateContext.Provider>
}

export function useAppState() {
    const context = useContext(AppStateContext)
    if (!context) throw new Error("useAppState must be used within AppStateProvider")
    return context
}
