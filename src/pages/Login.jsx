import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useAppState } from "../lib/AppState"
import "../components/app.css"

function Login() {
    const { setUser } = useAppState()
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const submit = (event) => {
        event.preventDefault()
        if (!name.trim() || !email.trim()) return setMessage("Enter your name and email to continue.")
        setUser({ name: name.trim(), email: email.trim() })
        navigate("/profile")
    }
    return <div className="home-page"><header className="home-header"><Link className="home-logo" to="/">streamline<span>.</span></Link><Link className="back-link" to="/profile">Back to profile</Link></header><main className="login-page"><form className="login-card" onSubmit={submit}><p className="eyebrow dark-eyebrow">Your Streamline account</p><h1 className="animate-title">Welcome back</h1><p>Sign in locally to personalize this demo.</p><label>Name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>{message && <p role="alert">{message}</p>}<button className="show-more-button" type="submit">Continue</button><small>This demo does not verify credentials or save account data.</small></form></main></div>
}

export default Login
