import { Link } from "react-router"
import { useAppState } from "../lib/AppState"
import "../components/app.css"

function MyLists() {
    const { savedMovies, toggleSavedMovie } = useAppState()
    return <div className="home-page">
        <header className="home-header"><Link className="home-logo" to="/">streamline<span>.</span></Link><Link className="back-link" to="/profile">Profile</Link></header>
        <main className="browse-section">
            <div className="browse-heading"><h1 className="search-title animate-title">My List</h1><p className="result-count">{savedMovies.length} titles</p></div>
            {!savedMovies.length ? <p className="empty-list">Nothing on your list yet. Add a movie or series with the + button while browsing.</p> : <div className="movie-grid">{savedMovies.map((movie) => <article className="movie-card" key={`${movie.media_type}-${movie.id}`}><Link className="movie-card-link" to={`/details/${movie.media_type}/${movie.id}`}><div className="movie-poster"><img src={movie.poster} alt={`${movie.title} poster`} /></div><div className="movie-info"><h3>{movie.title}</h3><p>{movie.year} · {movie.genre} <strong>★ {movie.rating}</strong></p></div></Link><button className="remove-movie-button" type="button" onClick={() => toggleSavedMovie(movie)}>Remove</button></article>)}</div>}
        </main>
    </div>
}

export default MyLists
