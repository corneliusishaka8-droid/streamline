import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { getTmdbError, normalizeTitle, tmdbApi } from "../lib/tmdb"
import "../components/app.css"

function Details() {
    const { mediaType, id } = useParams()
    const [title, setTitle] = useState(null)
    const [contentRatings, setContentRatings] = useState([])
    const [episodeGroups, setEpisodeGroups] = useState([])
    const [episode, setEpisode] = useState(null)
    const [reviews, setReviews] = useState([])
    const [similar, setSimilar] = useState([])
    const [error, setError] = useState("")
    const [rating, setRating] = useState(0)
    const [ratingMessage, setRatingMessage] = useState("")

    useEffect(() => {
        let isCurrent = true

        async function loadDetails() {
            try {
                // Load the base title first so optional panels can fail independently.
                const detailsResponse = await tmdbApi.get(`/${mediaType}/${id}`, { params: { language: "en-US" } })
                if (!isCurrent) return
                const details = normalizeTitle(detailsResponse.data, mediaType)
                setTitle(details)

                const sharedRequests = [
                    tmdbApi.get(`/${mediaType}/${id}/reviews`, { params: { language: "en-US", page: 1 } }),
                    tmdbApi.get(`/${mediaType}/${id}/similar`, { params: { language: "en-US", page: 1 } }),
                ]

                if (mediaType === "tv") {
                    // TV-only metadata includes ratings, episode groups, and an episode preview.
                    const [ratingsResult, groupsResult, reviewsResult, similarResult] = await Promise.allSettled([
                        tmdbApi.get(`/tv/${id}/content_ratings`),
                        tmdbApi.get(`/tv/${id}/episode_groups`),
                        ...sharedRequests,
                    ])
                    if (!isCurrent) return
                    if (ratingsResult.status === "fulfilled") setContentRatings(ratingsResult.value.data.results || [])
                    if (groupsResult.status === "fulfilled") {
                        const groups = groupsResult.value.data.results || []
                        setEpisodeGroups(groups)
                        const firstSeason = details.seasons?.find((season) => season.season_number > 0)
                        if (firstSeason) {
                            try {
                                const episodeResponse = await tmdbApi.get(`/tv/${id}/season/${firstSeason.season_number}/episode/1`, { params: { language: "en-US" } })
                                if (isCurrent) setEpisode(episodeResponse.data)
                            } catch (episodeError) {
                                console.warn("Episode details unavailable:", episodeError)
                            }
                        }
                        if (groups[0]?.id) {
                            try {
                                await tmdbApi.get(`/tv/episode_group/${groups[0].id}`)
                            } catch (groupError) {
                                console.warn("Episode group details unavailable:", groupError)
                            }
                        }
                    }
                    if (reviewsResult.status === "fulfilled") setReviews(reviewsResult.value.data.results || [])
                    if (similarResult.status === "fulfilled") setSimilar((similarResult.value.data.results || []).map((item) => normalizeTitle(item, "tv")))
                } else {
                    const [reviewsResult, similarResult] = await Promise.allSettled(sharedRequests)
                    if (reviewsResult.status === "fulfilled") setReviews(reviewsResult.value.data.results || [])
                    if (similarResult.status === "fulfilled") setSimilar((similarResult.value.data.results || []).map((item) => normalizeTitle(item, "movie")))
                }
            } catch (requestError) {
                if (isCurrent) setError(getTmdbError(requestError))
            }
        }

        loadDetails()
        return () => { isCurrent = false }
    }, [id, mediaType])

    const submitRating = async () => {
        if (!rating) return
        // TMDB accepts this write only when the request has an authenticated session.
        try {
            await tmdbApi.post(`/${mediaType}/${id}/rating`, { value: rating })
            setRatingMessage("Your rating was submitted.")
        } catch (requestError) {
            setRatingMessage(`${getTmdbError(requestError)} TMDB requires an authenticated session for ratings.`)
        }
    }

    if (error) return <main className="details-page"><Link className="back-link" to="/">Back to browse</Link><p className="catalog-message error-message">{error}</p></main>
    if (!title) return <main className="details-page"><p className="catalog-message">Loading details...</p></main>

    return <main className="details-page" style={{ "--details-backdrop": `url(${title.backdrop})` }}>
        <Link className="back-link details-back-link" to="/">← Back to browse</Link>
        <div className="details-shade" />
        <section className="details-content">
            <img className="details-poster" src={title.poster} alt={`${title.title} poster`} />
            <div><p className="eyebrow">{title.genre} <span>•</span> {title.year}</p><h1>{title.title}</h1><p className="details-meta">★ {title.rating} {title.runtime ? `• ${title.runtime} min` : ""}</p><p className="details-overview">{title.overview || "No overview is available for this title yet."}</p><RatingControl rating={rating} setRating={setRating} submitRating={submitRating} message={ratingMessage} /></div>
        </section>
        {mediaType === "tv" && <section className="details-section"><h2>Series information</h2><div className="details-stat-grid"><p><strong>Seasons</strong>{title.number_of_seasons || "N/A"}</p><p><strong>Episodes</strong>{title.number_of_episodes || "N/A"}</p><p><strong>Content rating</strong>{contentRatings[0]?.rating || "Not rated"}</p><p><strong>Episode groups</strong>{episodeGroups.length || 0}</p></div>{episode && <div className="episode-preview"><h3>Featured episode: {episode.name}</h3><p>{episode.overview || "No episode overview is available."}</p><span>Season {episode.season_number}, episode {episode.episode_number}</span></div>}</section>}
        <DetailsCollection title="Similar titles" items={similar} />
        <section className="details-section"><h2>Reviews</h2>{reviews.length ? reviews.slice(0, 4).map((review) => <article className="review" key={review.id}><h3>{review.author}</h3><p>{review.content}</p></article>) : <p className="details-muted">No reviews available yet.</p>}</section>
    </main>
}

function RatingControl({ rating, setRating, submitRating, message }) {
    return <div className="rating-control"><span>Rate this title</span><div>{[1, 2, 3, 4, 5].map((value) => <button className={value <= rating ? "rated" : ""} key={value} onClick={() => setRating(value)} type="button" aria-label={`Rate ${value} out of 5`}>★</button>)}<button className="rate-submit" onClick={submitRating} type="button">Submit</button></div>{message && <small>{message}</small>}</div>
}

function DetailsCollection({ title, items }) {
    return <section className="details-section"><h2>{title}</h2>{items.length ? <div className="details-similar-grid">{items.slice(0, 6).map((item) => <Link className="similar-card" to={`/details/${item.media_type}/${item.id}`} key={`${item.media_type}-${item.id}`}><img src={item.poster} alt={`${item.title} poster`} /><strong>{item.title}</strong></Link>)}</div> : <p className="details-muted">No similar titles available yet.</p>}</section>
}

export default Details