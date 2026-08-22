import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import PostCard from "../components/PostCard";

function Home() {
  const { user } = useAuth();

  const [posts, setPosts] =
    useState([]);

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD FEED
  // =====================================================

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api(
        "/posts/feed"
      );

      setPosts(
        data.posts || []
      );
    } catch (error) {
      console.error(
        "Feed error:",
        error
      );

      setError(
        error.message ||
          "Unable to load your feed."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadFeed();
  }, []);

  // =====================================================
  // CREATE POST
  // =====================================================

  const handleCreatePost = async (
    e
  ) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const data = await api(
        "/posts",
        {
          method: "POST",

          body: JSON.stringify({
            content:
              content.trim(),
          }),
        }
      );

      if (data.post) {
        setPosts(
          (currentPosts) => [
            data.post,
            ...currentPosts,
          ]
        );
      }

      setContent("");
    } catch (error) {
      console.error(
        "Create post error:",
        error
      );

      setError(
        error.message ||
          "Unable to create post."
      );
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // UPDATE SINGLE POST
  // =====================================================

  const handlePostUpdate = (
    updatedPost
  ) => {
    setPosts(
      (currentPosts) =>
        currentPosts.map(
          (post) =>
            post._id ===
            updatedPost._id
              ? updatedPost
              : post
        )
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="home-page">
        <div className="home-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading your feed...
          </p>

        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="home-page">

      {/* ===============================================
          PAGE INTRO
      =============================================== */}

      <div className="home-header">

        <div>

          <p className="home-eyebrow">
            YOUR SPACE
          </p>

          <h1>
            Your Feed
          </h1>

          <p className="home-subtitle">
            Welcome back,{" "}
            <strong>
              {user?.name ||
                "there"}
            </strong>
          </p>

        </div>

      </div>

      {/* ===============================================
          ERROR
      =============================================== */}

      {error && (
        <div className="home-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* ===============================================
          CREATE POST
      =============================================== */}

      <section className="create-post-card">

        <div className="create-post-header">

          <div className="create-post-avatar">

            {user?.profilePicture ? (
              <img
                src={
                  user.profilePicture
                }
                alt={
                  user.name ||
                  "User"
                }
              />
            ) : (
              user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
              "U"
            )}

          </div>

          <div>

            <h3>
              Create a Post
            </h3>

            <p>
              Share something with your
              SocialSphere.
            </p>

          </div>

        </div>

        <form
          onSubmit={
            handleCreatePost
          }
          className="create-post-form"
        >

          <textarea
            value={content}
            onChange={(e) =>
              setContent(
                e.target.value
              )
            }
            placeholder="What's on your mind?"
            rows="4"
            maxLength="5000"
          />

          <div className="create-post-footer">

            <span className="character-count">
              {content.length}/5000
            </span>

            <button
              type="submit"
              disabled={
                creating ||
                !content.trim()
              }
            >
              {creating
                ? "Posting..."
                : "Publish Post"}
            </button>

          </div>

        </form>

      </section>

      {/* ===============================================
          EMPTY FEED
      =============================================== */}

      {!error &&
        posts.length === 0 && (
          <section className="empty-feed">

            <div className="empty-feed-icon">
              ✦
            </div>

            <h3>
              Your feed is quiet
            </h3>

            <p>
              Be the first to share
              something with your
              community.
            </p>

          </section>
        )}

      {/* ===============================================
          POSTS
      =============================================== */}

      <div className="posts-feed">

        {posts.map(
          (post) => (
            <PostCard
              key={
                post._id
              }
              post={
                post
              }
              onPostUpdate={
                handlePostUpdate
              }
              onError={
                setError
              }
            />
          )
        )}

      </div>

    </main>
  );
}

export default Home;