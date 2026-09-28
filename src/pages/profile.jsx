import { useState } from "react"
import Myacc from "../components/myaccount"
import { Link } from "react-router"
import { useAppState } from "../lib/AppState"
import { apiUrl } from "../lib/api"

function Profile() {
    const { user, setUser } = useAppState()
    const [error, setError] = useState("")

    // End the Passport session on the server before clearing the local profile.
    const signOut = async () => {
        setError("")
        try {
            const response = await fetch(apiUrl("/api/auth/logout"), {
                method: "POST",
                credentials: "include",
            })
            if (!response.ok) throw new Error("Sign out failed")
            setUser(null)
        } catch {
            setError("Could not sign out. Please try again.")
        }
    }

    return (
        <div className="profile">
            <div className="profille-head">
                <Link className="profile-home-link" to="/">← Home</Link>
                <Link className="profilepiciv" to={user ? "/profile" : "/login"} title={user ? `${user.name}'s profile` : "Sign in or view profile"} aria-label={user ? `${user.name}'s profile` : "Sign in or view profile"}>
                    <svg className="profilepic profilepic-fallback" viewBox="0 0 100 100" role="img" aria-label="Default profile avatar">
                        <circle cx="50" cy="50" r="50" fill="#d9e5e2" />
                        <circle cx="50" cy="36" r="17" fill="#647772" />
                        <path d="M17 88c3-19 15-29 33-29s30 10 33 29v2H17z" fill="#647772" />
                    </svg>
                    {user?.avatarUrl && <img className="profilepic profilepic-google" src={user.avatarUrl} alt={`${user.name}'s Google profile`} onError={(event) => { event.currentTarget.remove() }} />}
                    {!user && <span className="profilepic-add">+</span>}
                </Link>
                <h1 className="animate-title">{user ? `Welcome, ${user.name}` : "Welcome, guest"}</h1>
                <nav><ul>
                    <li><Link to="/profile">my account</Link></li>
                    <li><Link to="/my-lists">my lists</Link></li>
                </ul></nav>
            </div>
            <Myacc user={user} />
            {error && <p role="alert">{error}</p>}
            {user && <button className="show-more-button" type="button" onClick={signOut}>Sign out</button>}
        </div>
    )
}

export default Profile

