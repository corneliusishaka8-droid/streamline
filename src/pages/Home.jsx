import { useMemo, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import "../components/app.css"
import { fallbackImage, getTmdbError, normalizeTitle, tmdbApi } from "../lib/tmdb"
import { useAppState } from "../lib/AppState"

const views = ["All", "Movies", "Series", "Animation", "Drama"]
const tmdbToken = import.meta.env.VITE_TMDB_TOKEN

function Home() {
    const navigate = useNavigate()
    const { savedMovies, toggleSavedMovie, user } = useAppState()
    const [movies, setMovies] = useState([])
    const [series, setSeries] = useState([])
    const [trendingTitles, setTrendingTitles] = useState([])
    const [featured, setFeatured] = useState(null)
    const [isLoading, setIsLoading] = useState(Boolean(tmdbToken))
    const [error, setError] = useState(tmdbToken ? "" : "TMDB token is missing. Add VITE_TMDB_TOKEN to the project .env file and restart Vite.")

    useEffect(() => {
        if (!tmdbToken) return

        // Home combines daily movies, top-rated series, and trending series.
        Promise.all([
            tmdbApi.get("/trending/movie/day", { params: { language: "en-US" } }),
            tmdbApi.get("/tv/top_rated", { params: { language: "en-US", page: 1 } }),
            tmdbApi.get("/trending/tv/week", { params: { language: "en-US" } }),
        ]).then(([movieResponse, seriesResponse, trendingSeriesResponse]) => {
            const nextMovies = movieResponse.data.results.map((item) => normalizeTitle(item, "movie"))
            const nextSeries = seriesResponse.data.results.map((item) => normalizeTitle(item, "tv"))
            const nextTrendingSeries = trendingSeriesResponse.data.results.map((item) => normalizeTitle(item, "tv"))
            setMovies(nextMovies)
            setSeries(nextSeries)
            setTrendingTitles([...nextMovies, ...nextTrendingSeries])
            const allTitles = [...nextMovies, ...nextSeries]
            setFeatured(allTitles[Math.floor(Math.random() * allTitles.length)] || null)
        }).catch((requestError) => {
            console.error("Error fetching TMDB data:", requestError)
            setError(getTmdbError(requestError))
        }).finally(() => setIsLoading(false))
    }, [])



    const [activeGenre, setActiveGenre] = useState("All")
    const [search, setSearch] = useState("")
    const [visibleCount, setVisibleCount] = useState(8)
    const searchTerm = search.toLowerCase().trim()
    const filteredMovies = useMemo(() => movies.filter((movie) => movie.title.toLowerCase().includes(searchTerm)), [movies, searchTerm])
    const filteredSeries = useMemo(() => series.filter((movie) => movie.title.toLowerCase().includes(searchTerm)), [searchTerm, series])
    const filteredAnimation = useMemo(() => trendingTitles.filter((movie) => movie.genreIds.includes(16) && movie.title.toLowerCase().includes(searchTerm)), [searchTerm, trendingTitles])
    const filteredDrama = useMemo(() => trendingTitles.filter((movie) => movie.genreIds.includes(18) && movie.title.toLowerCase().includes(searchTerm)), [searchTerm, trendingTitles])
    const activeItems = { Movies: filteredMovies, Series: filteredSeries, Animation: filteredAnimation, Drama: filteredDrama }[activeGenre] || []
    const resultCount = activeGenre === "All"
        ? filteredMovies.length + filteredSeries.length + filteredAnimation.length + filteredDrama.length
        : activeItems.length
    const hasMoreItems = activeGenre === "All"
        ? [filteredMovies, filteredSeries, filteredAnimation, filteredDrama].some((items) => items.length > visibleCount)
        : activeItems.length > visibleCount

    const handleGenreChange = (genre) => {
        setActiveGenre(genre)
        setVisibleCount(8)
    }

    const handleSearchChange = (event) => {
        setSearch(event.target.value)
        setVisibleCount(8)
    }

    const handleSearchSubmit = (event) => {
        event.preventDefault()
        if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
    }

    const renderMovieCard = (movie) => (
        // Every card points to the shared movie or series details route.
        <article className="movie-card" key={`${movie.id}-${movie.media_type}`}>
        <Link className="movie-card-link" to={`/details/${movie.media_type}/${movie.id}`}>
            <div className="movie-poster"><img src={movie.poster} alt={`${movie.title} poster`} /></div>
            <div className="movie-info"><h3>{movie.title}</h3><p>{movie.year} <span>•</span> {movie.genre} <strong>★ {movie.rating}</strong></p></div>
        </Link>
        <button className="save-movie-button" type="button" onClick={() => toggleSavedMovie(movie)} aria-label={`Add ${movie.title} to my list`}>{savedMovies.some((saved) => saved.id === movie.id && saved.media_type === movie.media_type) ? "✓" : "+"}</button>
        </article>
    )

    const renderBlock = (title, items) => (
        <section className="catalog-block" key={title}>
            <div className="catalog-block-heading"><h3>{title}</h3><span>{items.length} titles</span></div>
            <div className="movie-grid">{items.slice(0, visibleCount).map(renderMovieCard)}</div>
        </section>
    )

    return (
        <div className="home-page">
            <header className="home-header">
                <Link className="home-logo" to="/" aria-label="Streamline home">streamline<span>.</span></Link>
                <nav className="home-nav" aria-label="Main navigation">
                    <a className="active" href="#browse">Browse</a>
                    <Link to="/my-lists">My List</Link>
                </nav>
                <div className="home-actions">
                    <form className="search-box" onSubmit={handleSearchSubmit}>
                        <span aria-hidden="true">⌕</span>
                        <input value={search} onChange={handleSearchChange} placeholder="Search titles" aria-label="Search titles" />
                    </form>
                    <Link className="avatar" to="/profile" aria-label="Open profile">{user?.name?.[0] || "A"}</Link>
                </div>
            </header>

            <main>
                <section className="featured-movie">
                    <img src={featured?.backdrop || fallbackImage} alt={featured ? `${featured.title} backdrop` : "Featured movie"} />
                    <div className="featured-shade" />
                    <div className="featured-content">
                        <p className="eyebrow">Featured now <span>•</span> {featured?.genre || "Movie"}</p>
                <h1 className="animate-title">{isLoading ? "Loading..." : featured?.title || "No featured title"}</h1>
                        <p className="featured-copy">{featured?.overview || "Discover your next favorite story from this week's most watched titles."}</p>
                        <div className="featured-meta"><span>{featured?.year || "N/A"}</span><span>★ {featured?.rating || "N/A"}</span><span>{featured?.genre || "Movie"}</span></div>
                        <div className="featured-actions">
                           <a href={`/details/${featured?.media_type}/${featured?.id}`}> <button className="watch-button" type="button"><span aria-hidden="true">▶</span> Watch now</button></a>
                            {featured && <button className="list-button" type="button" onClick={() => toggleSavedMovie(featured)} aria-label={`Add ${featured.title} to my list`}>{savedMovies.some((saved) => saved.id === featured.id && saved.media_type === featured.media_type) ? "✓" : "+"}</button>}
                        </div>
                    </div>
                </section>

                <section className="browse-section" id="browse">
                    <div className="browse-heading">
                        <h2 className="animate-title">Find your next story</h2>
                        <p className="result-count">{resultCount} titles</p>
                    </div>
                    <div className="genre-list" aria-label="Filter by genre">
                        {views.map((view) => <button className={activeGenre === view ? "selected" : ""} onClick={() => handleGenreChange(view)} type="button" key={view}>{view}</button>)}
                    </div>
                    {error ? <p className="catalog-message error-message">{error}</p> : activeGenre === "All" ? (
                        <div className="catalog-blocks">
                            {renderBlock("Movies", filteredMovies)}
                            {renderBlock("Series", filteredSeries)}
                            {renderBlock("Animation", filteredAnimation)}
                            {renderBlock("Drama", filteredDrama)}
                        </div>
                    ) : activeGenre === "Movies" ? renderBlock("Movies", filteredMovies)
                        : activeGenre === "Series" ? renderBlock("Series", filteredSeries)
                            : activeGenre === "Animation" ? renderBlock("Animation", filteredAnimation)
                                : renderBlock("Drama", filteredDrama)}
                    {!isLoading && hasMoreItems && <button className="show-more-button" type="button" onClick={() => setVisibleCount((count) => count + 8)}>Show more</button>}
                </section>
            </main>
        </div>
    )
}

export default Home
