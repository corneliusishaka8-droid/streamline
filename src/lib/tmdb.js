import axios from "axios"

// Keep TMDB authentication and response shaping in one place for every page.
export const imageBaseUrl = "https://image.tmdb.org/t/p/"
export const fallbackImage = "https://via.placeholder.com/500x750?text=No+Image"

export const tmdbApi = axios.create({
    baseURL: "https://api.themoviedb.org/3",
    headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` },
})

export function normalizeTitle(item, mediaType = item.media_type) {
    // Search, list, and detail responses use different title/date fields.
    const releaseDate = item.release_date || item.first_air_date || ""
    const type = mediaType === "tv" ? "Series" : "Movie"

    return {
        ...item,
        media_type: mediaType || "movie",
        title: item.title || item.name || "Untitled",
        year: releaseDate.slice(0, 4) || "N/A",
        rating: item.vote_average ? item.vote_average.toFixed(1) : "N/A",
        genre: type,
        genreIds: item.genre_ids || [],
        poster: item.poster_path ? `${imageBaseUrl}w500${item.poster_path}` : fallbackImage,
        backdrop: item.backdrop_path ? `${imageBaseUrl}original${item.backdrop_path}` : fallbackImage,
    }
}

export function getTmdbError(error) {
    // Convert Axios failures into text that can be safely shown in the UI.
    const status = error.response?.status
    const message = error.response?.data?.status_message
    return status ? `TMDB request failed (${status}): ${message || "Please try again."}` : "TMDB could not be reached. Check your connection and try again."
}