import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import PostCard from "../components/PostCard";

function Home() {
  const { user } = useAuth();

  const [posts, setPosts] =
    useState([]);

  const [content, setContent] =
    useState("");

  const [selectedMedia, setSelectedMedia] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const fileInputRef =
    useRef(null);

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
  // CLEAN PREVIEW URLS
  // =====================================================

  useEffect(() => {
    return () => {
      selectedMedia.forEach(
        (item) => {
          if (item.previewUrl) {
            URL.revokeObjectURL(
              item.previewUrl
            );
          }
        }
      );
    };
  }, [selectedMedia]);

  // =====================================================
  // SELECT MEDIA
  // =====================================================

  const handleMediaSelect = (
    e
  ) => {
    const files =
      Array.from(
        e.target.files || []
      );

    if (files.length === 0) {
      return;
    }

    // Remaining number of media slots
    const remainingSlots =
      4 -
      selectedMedia.length;

    if (remainingSlots <= 0) {
      setError(
        "You can upload a maximum of 4 files per post."
      );

      e.target.value = "";

      return;
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    const validFiles = [];

    for (const file of files) {
      if (
        validFiles.length >=
        remainingSlots
      ) {
        break;
      }

      const isImage =
        allowedImageTypes.includes(
          file.type
        );

      const isVideo =
        allowedVideoTypes.includes(
          file.type
        );

      if (
        !isImage &&
        !isVideo
      ) {
        setError(
          "Only JPG, PNG, WEBP, MP4, WEBM and MOV files are allowed."
        );

        continue;
      }

      // Backend limit is 50 MB
      const maxSize =
        50 *
        1024 *
        1024;

      if (
        file.size >
        maxSize
      ) {
        setError(
          `${file.name} is larger than 50 MB.`
        );

        continue;
      }

      validFiles.push({
        file,

        type:
          isVideo
            ? "video"
            : "image",

        previewUrl:
          URL.createObjectURL(
            file
          ),

        id:
          `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      });
    }

    setSelectedMedia(
      (current) => [
        ...current,
        ...validFiles,
      ]
    );

    // Allows selecting same file again later
    e.target.value = "";
  };

  // =====================================================
  // REMOVE SELECTED MEDIA
  // =====================================================

  const handleRemoveMedia = (
    mediaId
  ) => {
    setSelectedMedia(
      (current) => {
        const itemToRemove =
          current.find(
            (item) =>
              item.id ===
              mediaId
          );

        if (
          itemToRemove?.previewUrl
        ) {
          URL.revokeObjectURL(
            itemToRemove.previewUrl
          );
        }

        return current.filter(
          (item) =>
            item.id !==
            mediaId
        );
      }
    );

    setError("");
  };

  // =====================================================
  // OPEN FILE PICKER
  // =====================================================

  const handleOpenMediaPicker =
    () => {
      fileInputRef.current?.click();
    };

  // =====================================================
  // CREATE POST
  // =====================================================

  const handleCreatePost = async (
    e
  ) => {
    e.preventDefault();

    const hasText =
      content.trim().length > 0;

    const hasMedia =
      selectedMedia.length > 0;

    if (
      !hasText &&
      !hasMedia
    ) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      // ===============================================
      // CREATE FORMDATA
      // ===============================================

      const formData =
        new FormData();

      formData.append(
        "content",
        content.trim()
      );

      selectedMedia.forEach(
        (item) => {
          formData.append(
            "media",
            item.file
          );
        }
      );

      // ===============================================
      // SEND POST
      // ===============================================

      const data = await api(
        "/posts",
        {
          method: "POST",
          body: formData,
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

      // ===============================================
      // CLEAN OLD PREVIEW URLS
      // ===============================================

      selectedMedia.forEach(
        (item) => {
          if (
            item.previewUrl
          ) {
            URL.revokeObjectURL(
              item.previewUrl
            );
          }
        }
      );

      setContent("");
      setSelectedMedia([]);
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

          {/* TEXT */}

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

          {/* =========================================
              MEDIA PREVIEW
          ========================================= */}

          {selectedMedia.length >
            0 && (
            <div className="create-media-preview">

              {selectedMedia.map(
                (item) => (
                  <div
                    key={item.id}
                    className="create-media-item"
                  >

                    {item.type ===
                    "video" ? (
                      <video
                        src={
                          item.previewUrl
                        }
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={
                          item.previewUrl
                        }
                        alt="Post preview"
                      />
                    )}

                    <button
                      type="button"
                      className="create-media-remove"
                      onClick={() =>
                        handleRemoveMedia(
                          item.id
                        )
                      }
                      aria-label="Remove media"
                    >
                      ×
                    </button>

                    <span className="create-media-type">
                      {item.type ===
                      "video"
                        ? "VIDEO"
                        : "IMAGE"}
                    </span>

                  </div>
                )
              )}

            </div>
          )}

          {/* =========================================
              HIDDEN FILE INPUT
          ========================================= */}

          <input
            ref={
              fileInputRef
            }
            type="file"
            accept="
              image/jpeg,
              image/png,
              image/webp,
              video/mp4,
              video/webm,
              video/quicktime
            "
            multiple
            onChange={
              handleMediaSelect
            }
            className="create-media-input"
          />

          {/* =========================================
              TOOLBAR
          ========================================= */}

          <div className="create-post-toolbar">

            <button
              type="button"
              className="create-media-button"
              onClick={
                handleOpenMediaPicker
              }
              disabled={
                creating ||
                selectedMedia.length >=
                  4
              }
            >
              <span className="create-media-button-icon">
                +
              </span>

              <span>
                Photo / Video
              </span>
            </button>

            <span className="create-media-limit">
              {
                selectedMedia.length
              }
              /4 media
            </span>

          </div>

          {/* =========================================
              FOOTER
          ========================================= */}

          <div className="create-post-footer">

            <span className="character-count">
              {content.length}/5000
            </span>

            <button
              type="submit"
              disabled={
                creating ||
                (
                  !content.trim() &&
                  selectedMedia.length ===
                    0
                )
              }
            >
              {creating
                ? "Publishing..."
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