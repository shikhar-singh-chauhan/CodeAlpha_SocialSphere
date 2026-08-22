import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Search() {
  const { user: currentUser } = useAuth();

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // SEARCH USERS
  // =====================================================

  const searchUsers = async (searchQuery) => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setUsers([]);
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await api(
        `/users/search?query=${encodeURIComponent(
          trimmedQuery
        )}`
      );

      setUsers(data.users || []);
    } catch (error) {
      console.error(
        "Search users error:",
        error
      );

      setError(
        error.message ||
          "Unable to search users."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LIVE SEARCH WITH DELAY
  // =====================================================

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setUsers([]);
      setLoading(false);
      setError("");
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(trimmedQuery);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // =====================================================
  // SUBMIT SEARCH
  // =====================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    searchUsers(query);
  };

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  const clearSearch = () => {
    setQuery("");
    setUsers([]);
    setError("");
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="search-page">

      {/* ================================================
          HEADER
      ================================================ */}

      <div className="search-page-header">

        <p className="search-eyebrow">
          DISCOVER
        </p>

        <h1>
          Find People
        </h1>

        <p className="search-subtitle">
          Search for people on SocialSphere
          by name or email.
        </p>

      </div>

      {/* ================================================
          SEARCH BOX
      ================================================ */}

      <section className="search-box-card">

        <form
          className="search-form"
          onSubmit={handleSubmit}
        >

          <div className="search-input-wrapper">

            <span className="search-input-icon">
              ⌕
            </span>

            <input
              type="text"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search people..."
              autoComplete="off"
            />

            {query && (
              <button
                type="button"
                className="search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

          <button
            type="submit"
            className="search-submit"
            disabled={
              !query.trim() ||
              loading
            }
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>

        </form>

      </section>

      {/* ================================================
          ERROR
      ================================================ */}

      {error && (
        <div className="search-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              searchUsers(query)
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* ================================================
          INITIAL STATE
      ================================================ */}

      {!query.trim() &&
        !error && (
          <section className="search-empty">

            <div className="search-empty-icon">
              ⌕
            </div>

            <h3>
              Discover your community
            </h3>

            <p>
              Search by name or email to
              find people and explore their
              profiles.
            </p>

          </section>
        )}

      {/* ================================================
          LOADING
      ================================================ */}

      {loading && (
        <div className="search-loading">

          <div className="loading-spinner"></div>

          <p>
            Finding people...
          </p>

        </div>
      )}

      {/* ================================================
          NO RESULTS
      ================================================ */}

      {!loading &&
        !error &&
        query.trim() &&
        users.length === 0 && (
          <section className="search-empty">

            <div className="search-empty-icon">
              ◌
            </div>

            <h3>
              No people found
            </h3>

            <p>
              We couldn't find anyone matching
              "{query}".
            </p>

          </section>
        )}

      {/* ================================================
          RESULTS
      ================================================ */}

      {!loading &&
        !error &&
        users.length > 0 && (
          <div className="search-results">

            <div className="search-results-header">

              <span>
                Search results
              </span>

              <span>
                {users.length}{" "}
                {users.length === 1
                  ? "person"
                  : "people"}
              </span>

            </div>

            <div className="search-users-list">

              {users.map((user) => {
                const initial =
                  user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U";

                const followersCount =
                  user.followers?.length || 0;

                const followingCount =
                  user.following?.length || 0;

                const isCurrentUser =
                  user._id?.toString() ===
                  currentUser?._id?.toString();

                return (
                  <article
                    key={user._id}
                    className="search-user-card"
                  >

                    {/* AVATAR */}

                    <Link
                      to={`/profile/${user._id}`}
                      className="search-user-avatar"
                    >
                      {user.profilePicture ? (
                        <img
                          src={
                            user.profilePicture
                          }
                          alt={user.name}
                        />
                      ) : (
                        initial
                      )}
                    </Link>

                    {/* INFORMATION */}

                    <div className="search-user-info">

                      <div className="search-user-name-row">

                        <Link
                          to={`/profile/${user._id}`}
                          className="search-user-name"
                        >
                          {user.name ||
                            "Unknown User"}
                        </Link>

                        {isCurrentUser && (
                          <span className="search-you-badge">
                            You
                          </span>
                        )}

                      </div>

                      <p className="search-user-email">
                        {user.email}
                      </p>

                      {user.bio && (
                        <p className="search-user-bio">
                          {user.bio}
                        </p>
                      )}

                      <div className="search-user-stats">

                        <span>
                          <strong>
                            {followersCount}
                          </strong>{" "}
                          Followers
                        </span>

                        <span>
                          <strong>
                            {followingCount}
                          </strong>{" "}
                          Following
                        </span>

                      </div>

                    </div>

                    {/* PROFILE BUTTON */}

                    <Link
                      to={`/profile/${user._id}`}
                      className="search-view-profile"
                    >
                      View profile
                    </Link>

                  </article>
                );
              })}

            </div>

          </div>
        )}

    </main>
  );
}

export default Search;