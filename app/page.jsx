"use client";
import React, { useEffect, useState } from "react";
import { formatDuration } from "../util/formatDuration";
import { useDebounce } from "../util/debounce";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("ratingDesc");

  useEffect(() => {
    setLoading(true);
    fetch("/data/movies.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch movies");
        return res.json();
      })
      .then((data) => {
        setMovies(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  if (loading)
    return (
      <div role="status" aria-live="polite">
        Loading movies…
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  // Extract unique genres
  const genres = ["All", ...new Set(movies.flatMap((m) => m.genres))];

  // Filtering & Searching
  let filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  if (genre !== "All") {
    filtered = filtered.filter((m) => m.genres.includes(genre));
  }

  // Sorting
  filtered.sort((a, b) => {
    if (sort === "ratingDesc") return b.rating - a.rating;
    if (sort === "yearDesc") return b.year - a.year;
    if (sort === "yearAsc") return a.year - b.year;
    return 0;
  });

  return (
    <div className="p-4 space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <h1 className="text-2xl font-bold">Movies List</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
          aria-label="Search movies"
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="border p-2 rounded"
        >
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="ratingDesc">Sort by Rating (High → Low)</option>
          <option value="yearDesc">Sort by Year (New → Old)</option>
          <option value="yearAsc">Sort by Year (Old → New)</option>
        </select>
      </div>

      {/* Error handling */}
      {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}

      {/* Count */}
      <p className="text-sm text-gray-600">
        Showing {filtered.length} of {movies.length}
      </p>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <p>No movies match your filters.</p>
      ) : (
        <ul className="space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((movie) => (
            <li key={movie.id} className="p-4 border rounded shadow-sm">
              <h2 className="text-lg font-semibold">{movie.title}</h2>
              <p className="text-sm text-gray-600">
                {movie.year} • Rating: {movie.rating} •{" "}
                {formatDuration(movie.durationMin)}
              </p>
              <p className="text-sm">Genres: {movie.genres.join(", ")}</p>
              <button
                onClick={() => toggleFavorite(movie.id)}
                aria-pressed={favorites.includes(movie.id)}
                aria-label={
                  favorites.includes(movie.id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                className={`text-2xl ${
                  favorites.includes(movie.id)
                    ? "text-yellow-400"
                    : "text-gray-400"
                }`}
              >
                ★
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
