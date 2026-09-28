-- Create the account table used by the Google OAuth strategy.
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    google_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support optional email searches without requiring Google to share an email.
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Store each user's saved TMDB titles so My List survives refreshes and sign-ins.
CREATE TABLE IF NOT EXISTS saved_movies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id BIGINT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title TEXT NOT NULL,
    year TEXT NOT NULL DEFAULT 'N/A',
    rating TEXT NOT NULL DEFAULT 'N/A',
    genre TEXT NOT NULL DEFAULT 'Movie',
    poster TEXT NOT NULL,
    backdrop TEXT NOT NULL,
    overview TEXT NOT NULL DEFAULT '',
    genre_ids INTEGER[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, tmdb_id, media_type)
);

CREATE INDEX IF NOT EXISTS saved_movies_user_created_idx ON saved_movies (user_id, created_at DESC);
