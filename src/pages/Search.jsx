import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { getTmdbError, normalizeTitle, tmdbApi } from "../lib/tmdb"
import { useAppState } from "../lib/AppState"
import "../components/app.css"

function Search() {
    const { savedMovies, toggleSavedMovie } = useAppState()
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q")?.trim() || ""
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(Boolean(query))
    const [error, setError] = useState("")

    useEffect(() => {
        if (!query) {
            return
        }

        // TMDB multi-search returns both movies and TV; people are excluded here.
        tmdbApi.get("/search/multi", { params: { include_adult: false, language: "en-US", page: 1, query } })
            .then((response) => setResults(response.data.results.filter((item) => item.media_type === "movie" || item.media_type === "tv").map((item) => normalizeTitle(item, item.media_type))))
            .catch((requestError) => setError(getTmdbError(requestError)))
            .finally(() => setIsLoading(false))
    }, [query])

    return (
        <div className="home-page search-page">
            <header className="home-header">
                <Link className="home-logo" to="/" aria-label="Streamline home">streamline<span>.</span></Link>
                <Link className="back-link" to="/">Back to browse</Link>
            </header>
            <main className="browse-section">
                <div className="browse-heading"><h1 className="search-title">Search results</h1><p className="result-count">{query ? `For “${query}”` : "Enter a title to search"}</p></div>
                {isLoading && <p className="catalog-message">Searching TMDB...</p>}
                {error && <p className="catalog-message error-message">{error}</p>}
                {!isLoading && !error && query && !results.length && <p className="catalog-message">No movies or series matched your search.</p>}
                <div className="movie-grid">{(query ? results : []).map((item) => <MovieCard movie={item} key={`${item.media_type}-${item.id}`} saved={savedMovies.some((saved) => saved.id === item.id && saved.media_type === item.media_type)} onToggle={() => toggleSavedMovie(item)} />)}</div>
            </main>
        </div>
    )
}

function MovieCard({ movie, saved, onToggle }) {
    return <article className="movie-card"><Link className="movie-card-link" to={`/details/${movie.media_type}/${movie.id}`}>
        <div className="movie-poster"><img src={movie.poster} alt={`${movie.title} poster`} /></div>
        <div className="movie-info"><h3>{movie.title}</h3><p>{movie.year} <span>•</span> {movie.genre} <strong>★ {movie.rating}</strong></p></div>
    </Link><button className="save-movie-button" type="button" onClick={onToggle} aria-label={`${saved ? "Remove" : "Add"} ${movie.title} ${saved ? "from" : "to"} my list`}>{saved ? "✓" : "+"}</button></article>
}

export default Search
