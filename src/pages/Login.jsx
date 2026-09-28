import { Link } from "react-router"
import { apiUrl } from "../lib/api"
import "../components/app.css"

// Offer Google OAuth as the app's real sign-in path.
function Login() {
    return <div className="home-page">
        <header className="home-header">
            <Link className="home-logo" to="/">streamline<span>.</span></Link>
            <Link className="back-link" to="/profile">Back to profile</Link>
        </header>
        <main className="login-page">
            <section className="login-card">
                <p className="eyebrow dark-eyebrow">Your Streamline account</p>
                <h1 className="animate-title">Welcome back</h1>
                <p>Sign in securely with your Google account.</p>
                <a className="show-more-button" href={apiUrl("/api/auth/google")}>Continue with Google</a>
            </section>
        </main>
    </div>
}

export default Login

