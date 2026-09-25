import { Link } from "react-router"
import "../components/app.css"

function Legal({ type }) {
    const privacy = type === "privacy"
    return <div className="home-page"><header className="home-header"><Link className="home-logo" to="/">streamline<span>.</span></Link><Link className="back-link" to="/profile">Back to profile</Link></header>
        <main className="browse-section legal-page"><p className="eyebrow dark-eyebrow">Streamline</p><h1 className="search-title animate-title">{privacy ? "Privacy" : "Policies"}</h1>
            {privacy ? <><h2>Your privacy</h2><p>Streamline uses the information you provide to operate this demo experience. Your saved titles and account details currently live only in app memory and are cleared when you refresh or close the page.</p><h2>Information and choices</h2><p>This version does not save profile or viewing data to a database, sell personal information, or provide account recovery. Avoid entering sensitive information.</p><h2>Questions</h2><p>For questions, contact the Streamline support team.</p></> : <><h2>Using Streamline</h2><p>Use Streamline to discover movies and series for personal, lawful use. Do not misuse the service or attempt to disrupt access for other users.</p><h2>Content</h2><p>Movie information and artwork are supplied by TMDB. Availability and details may change and Streamline does not host the films or series.</p><h2>Demo service</h2><p>This is an early demo. Features may change, and in this version lists and sign-in details are kept only in temporary app state.</p></>}
        </main></div>
}

export default Legal
