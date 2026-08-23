import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Profile() {
  const {
    user: currentUser,
    updateAuthUser,
  } = useAuth();

  const { userId } = useParams();

  const [profileUser, setProfileUser] =
    useState(null);

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [following, setFollowing] =
    useState(false);

  const [followLoading, setFollowLoading] =
    useState(false);

  const [deletingPostId, setDeletingPostId] =
    useState("");

  // ==========================================
  // COMMENT STATES
  // ==========================================

  const [commentText, setCommentText] =
    useState({});

  const [commenting, setCommenting] =
    useState({});

  // ==========================================
  // EDIT PROFILE
  // ==========================================

  const [editing, setEditing] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [editForm, setEditForm] =
    useState({
      name: "",
      bio: "",
    });

  // ==========================================
  // PROFILE PHOTO
  // ==========================================

  const [profilePhoto, setProfilePhoto] =
    useState(null);

  const [
    profilePhotoPreview,
    setProfilePhotoPreview,
  ] = useState("");

  const profilePhotoInputRef =
    useRef(null);

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await api(
        `/users/${userId}`
      );

      setProfileUser(
        data.user
      );

      setPosts(
        data.posts || []
      );

      const currentUserId =
        currentUser?._id ||
        currentUser?.id;

      const isFollowing =
        data.user?.followers?.some(
          (follower) => {
            const followerId =
              typeof follower ===
              "object"
                ? follower?._id ||
                  follower?.id
                : follower;

            return (
              followerId?.toString() ===
              currentUserId?.toString()
            );
          }
        );

      setFollowing(
        Boolean(isFollowing)
      );

      setEditForm({
        name:
          data.user?.name || "",

        bio:
          data.user?.bio || "",
      });
    } catch (error) {
      console.error(
        "Profile load error:",
        error
      );

      setError(
        error.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD ON USER CHANGE
  // ==========================================

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  // ==========================================
  // CLEAN PREVIEW
  // ==========================================

  useEffect(() => {
    return () => {
      if (
        profilePhotoPreview &&
        profilePhotoPreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          profilePhotoPreview
        );
      }
    };
  }, [profilePhotoPreview]);

  // ==========================================
  // FOLLOW USER
  // ==========================================

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      setError("");

      await api(
        `/users/${userId}/follow`,
        {
          method: "POST",
        }
      );

      setFollowing(true);

      setProfileUser(
        (current) => ({
          ...current,

          followers: [
            ...(current.followers ||
              []),

            currentUser,
          ],
        })
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to follow user."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  // ==========================================
  // UNFOLLOW USER
  // ==========================================

  const handleUnfollow = async () => {
    try {
      setFollowLoading(true);
      setError("");

      await api(
        `/users/${userId}/unfollow`,
        {
          method: "POST",
        }
      );

      setFollowing(false);

      const currentUserId =
        currentUser?._id ||
        currentUser?.id;

      setProfileUser(
        (current) => ({
          ...current,

          followers: (
            current.followers || []
          ).filter(
            (follower) => {
              const followerId =
                typeof follower ===
                "object"
                  ? follower?._id ||
                    follower?.id
                  : follower;

              return (
                followerId?.toString() !==
                currentUserId?.toString()
              );
            }
          ),
        })
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to unfollow user."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  // ==========================================
  // LIKE / UNLIKE PROFILE POST
  // ==========================================

  const handleLike = async (
    postId
  ) => {
    try {
      setError("");

      const data = await api(
        `/posts/${postId}/like`,
        {
          method: "POST",
        }
      );

      const currentUserId =
        currentUser?._id ||
        currentUser?.id;

      setPosts((currentPosts) =>
        currentPosts.map(
          (post) => {
            if (
              post._id !== postId
            ) {
              return post;
            }

            let updatedLikes = [
              ...(post.likes || []),
            ];

            if (data.liked) {
              const alreadyLiked =
                updatedLikes.some(
                  (like) => {
                    const likeId =
                      typeof like ===
                      "object"
                        ? like?._id ||
                          like?.id
                        : like;

                    return (
                      likeId?.toString() ===
                      currentUserId?.toString()
                    );
                  }
                );

              if (!alreadyLiked) {
                updatedLikes.push(
                  currentUserId
                );
              }
            } else {
              updatedLikes =
                updatedLikes.filter(
                  (like) => {
                    const likeId =
                      typeof like ===
                      "object"
                        ? like?._id ||
                          like?.id
                        : like;

                    return (
                      likeId?.toString() !==
                      currentUserId?.toString()
                    );
                  }
                );
            }

            return {
              ...post,
              likes: updatedLikes,
            };
          }
        )
      );
    } catch (error) {
      console.error(
        "Profile post like error:",
        error
      );

      setError(
        error.message ||
          "Unable to like post."
      );
    }
  };

  // ==========================================
  // CREATE COMMENT
  // ==========================================

  const handleCreateComment =
    async (postId) => {
      const text =
        commentText[postId];

      if (
        !text ||
        !text.trim()
      ) {
        return;
      }

      try {
        setCommenting(
          (current) => ({
            ...current,
            [postId]: true,
          })
        );

        setError("");

        const data = await api(
          `/posts/${postId}/comments`,
          {
            method: "POST",

            body: JSON.stringify({
              text:
                text.trim(),
            }),
          }
        );

        setPosts(
          (currentPosts) =>
            currentPosts.map(
              (post) => {
                if (
                  post._id !==
                  postId
                ) {
                  return post;
                }

                return {
                  ...post,

                  comments: [
                    ...(post.comments ||
                      []),

                    data.comment,
                  ],
                };
              }
            )
        );

        setCommentText(
          (current) => ({
            ...current,
            [postId]: "",
          })
        );
      } catch (error) {
        console.error(
          "Profile comment error:",
          error
        );

        setError(
          error.message ||
            "Unable to comment."
        );
      } finally {
        setCommenting(
          (current) => ({
            ...current,
            [postId]: false,
          })
        );
      }
    };

  // ==========================================
  // DELETE OWN COMMENT
  // ==========================================

  const handleDeleteComment =
    async (
      postId,
      commentId
    ) => {
      try {
        setError("");

        await api(
          `/posts/${postId}/comments/${commentId}`,
          {
            method: "DELETE",
          }
        );

        setPosts(
          (currentPosts) =>
            currentPosts.map(
              (post) => {
                if (
                  post._id !==
                  postId
                ) {
                  return post;
                }

                return {
                  ...post,

                  comments: (
                    post.comments || []
                  ).filter(
                    (comment) =>
                      comment._id !==
                      commentId
                  ),
                };
              }
            )
        );
      } catch (error) {
        console.error(
          "Delete comment error:",
          error
        );

        setError(
          error.message ||
            "Unable to delete comment."
        );
      }
    };

  // ==========================================
  // DELETE OWN POST
  // ==========================================

  const handleDeletePost = async (
    postId
  ) => {
    if (!postId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPostId(postId);
      setError("");
      setSuccess("");

      await api(
        `/posts/${postId}`,
        {
          method: "DELETE",
        }
      );

      setPosts(
        (currentPosts) =>
          currentPosts.filter(
            (post) =>
              post._id !== postId
          )
      );

      setSuccess(
        "Post deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete post error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete post."
      );
    } finally {
      setDeletingPostId("");
    }
  };

  // ==========================================
  // OPEN EDIT PROFILE
  // ==========================================

  const openEditProfile = () => {
    setError("");
    setSuccess("");

    setEditForm({
      name:
        profileUser?.name || "",

      bio:
        profileUser?.bio || "",
    });

    setProfilePhoto(null);

    setProfilePhotoPreview(
      profileUser?.profilePicture ||
        ""
    );

    setEditing(true);
  };

  // ==========================================
  // CLOSE EDIT PROFILE
  // ==========================================

  const closeEditProfile = () => {
    if (savingProfile) {
      return;
    }

    if (
      profilePhotoPreview &&
      profilePhotoPreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        profilePhotoPreview
      );
    }

    setProfilePhoto(null);
    setProfilePhotoPreview("");
    setEditing(false);
  };

  // ==========================================
  // EDIT INPUT
  // ==========================================

  const handleEditChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setEditForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  // ==========================================
  // SELECT PROFILE PHOTO
  // ==========================================

  const handleProfilePhotoChange =
    (e) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        setError(
          "Please select a JPG, PNG or WEBP image."
        );

        e.target.value = "";

        return;
      }

      // Profile photos should not
      // need huge files.
      const maxSize =
        10 *
        1024 *
        1024;

      if (
        file.size > maxSize
      ) {
        setError(
          "Profile photo must be smaller than 10 MB."
        );

        e.target.value = "";

        return;
      }

      if (
        profilePhotoPreview &&
        profilePhotoPreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          profilePhotoPreview
        );
      }

      const preview =
        URL.createObjectURL(
          file
        );

      setProfilePhoto(file);

      setProfilePhotoPreview(
        preview
      );

      setError("");

      e.target.value = "";
    };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSaveProfile = async (
    e
  ) => {
    e.preventDefault();

    if (
      !editForm.name.trim()
    ) {
      setError(
        "Name cannot be empty."
      );

      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      // ======================================
      // FORMDATA
      // ======================================

      const formData =
        new FormData();

      formData.append(
        "name",
        editForm.name.trim()
      );

      formData.append(
        "bio",
        editForm.bio.trim()
      );

      if (profilePhoto) {
        formData.append(
          "profilePicture",
          profilePhoto
        );
      }

      // ======================================
      // UPDATE PROFILE
      // ======================================

      const data = await api(
        "/users/profile",
        {
          method: "PUT",
          body: formData,
        }
      );

      // ======================================
      // UPDATE PAGE USER
      // ======================================

      setProfileUser(
        (current) => ({
          ...current,
          ...data.user,

          name:
            data.user?.name ||
            editForm.name.trim(),

          bio:
            data.user?.bio ?? "",

          profilePicture:
            data.user
              ?.profilePicture ||
            current
              ?.profilePicture ||
            "",
        })
      );

      // ======================================
      // UPDATE LOGGED-IN USER
      // Navbar / Home / comments can update
      // ======================================

      if (updateAuthUser) {
        updateAuthUser(
          data.user
        );
      }

      // ======================================
      // UPDATE AUTHOR IN LOCAL POSTS
      // ======================================

      setPosts(
        (currentPosts) =>
          currentPosts.map(
            (post) => ({
              ...post,

              author:
                typeof post.author ===
                "object"
                  ? {
                      ...post.author,

                      name:
                        data.user
                          ?.name ||
                        editForm.name.trim(),

                      profilePicture:
                        data.user
                          ?.profilePicture ||
                        post.author
                          ?.profilePicture ||
                        "",
                    }
                  : post.author,
            })
          )
      );

      if (
        profilePhotoPreview &&
        profilePhotoPreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          profilePhotoPreview
        );
      }

      setProfilePhoto(null);
      setProfilePhotoPreview("");

      setEditing(false);

      setSuccess(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setError(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="profile-page">

        <div className="profile-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading profile...
          </p>

        </div>

      </main>
    );
  }

  if (
    error &&
    !profileUser
  ) {
    return (
      <main className="profile-page">

        <div className="profile-error-card">

          <h3>
            Unable to load profile
          </h3>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadProfile
            }
          >
            Try again
          </button>

        </div>

      </main>
    );
  }

  if (!profileUser) {
    return null;
  }

  // ==========================================
  // PROFILE DATA
  // ==========================================

  const currentUserId =
    currentUser?._id ||
    currentUser?.id;

  const profileUserId =
    profileUser?._id ||
    profileUser?.id;

  const isOwnProfile =
    currentUserId?.toString() ===
    profileUserId?.toString();

  const followersCount =
    profileUser.followers?.length ||
    0;

  const followingCount =
    profileUser.following?.length ||
    0;

  const initial =
    profileUser.name
      ?.charAt(0)
      ?.toUpperCase() || "U";

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="profile-page">

      {/* ======================================
          PROFILE CARD
      ====================================== */}

      <section className="profile-card">

        <div className="profile-cover"></div>

        <div className="profile-card-content">

          <div className="profile-top-row">

            <div className="profile-main-avatar">

              {profileUser.profilePicture ? (
                <img
                  src={
                    profileUser.profilePicture
                  }
                  alt={
                    profileUser.name
                  }
                />
              ) : (
                initial
              )}

            </div>

            <div className="profile-actions">

              {!isOwnProfile && (
                <button
                  type="button"
                  className={
                    following
                      ? "profile-unfollow-button"
                      : "profile-follow-button"
                  }
                  onClick={
                    following
                      ? handleUnfollow
                      : handleFollow
                  }
                  disabled={
                    followLoading
                  }
                >
                  {followLoading
                    ? "Please wait..."
                    : following
                    ? "Following"
                    : "Follow"}
                </button>
              )}

              {isOwnProfile && (
                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={
                    openEditProfile
                  }
                >
                  Edit profile
                </button>
              )}

            </div>

          </div>

          <div className="profile-info">

            <h1>
              {profileUser.name}
            </h1>

            <p className="profile-email">
              {profileUser.email}
            </p>

            <p className="profile-bio">
              {profileUser.bio ||
                "No bio added yet."}
            </p>

          </div>

          <div className="profile-stats">

            <div>
              <strong>
                {posts.length}
              </strong>

              <span>
                Posts
              </span>
            </div>

            <div>
              <strong>
                {followersCount}
              </strong>

              <span>
                Followers
              </span>
            </div>

            <div>
              <strong>
                {followingCount}
              </strong>

              <span>
                Following
              </span>
            </div>

          </div>

        </div>

      </section>

      {success && (
        <div className="profile-success">
          {success}
        </div>
      )}

      {error && (
        <div className="profile-inline-error">
          {error}
        </div>
      )}

      {/* ======================================
          POSTS TITLE
      ====================================== */}

      <div className="profile-posts-header">

        <div>

          <p className="profile-eyebrow">
            ACTIVITY
          </p>

          <h2>
            {isOwnProfile
              ? "Your Posts"
              : `${profileUser.name}'s Posts`}
          </h2>

        </div>

      </div>

      {/* ======================================
          EMPTY POSTS
      ====================================== */}

      {posts.length === 0 && (
        <section className="profile-empty-posts">

          <div className="profile-empty-icon">
            ✦
          </div>

          <h3>
            No posts yet
          </h3>

          <p>
            {isOwnProfile
              ? "Your posts will appear here."
              : "This user hasn't posted anything yet."}
          </p>

        </section>
      )}

      {/* ======================================
          PROFILE POSTS
      ====================================== */}

      <div className="profile-posts-list">

        {posts.map(
          (post) => {
            const likes =
              post.likes || [];

            const comments =
              post.comments || [];

            const media =
              post.media || [];

            const isLiked =
              likes.some(
                (like) => {
                  const likeId =
                    typeof like ===
                    "object"
                      ? like?._id ||
                        like?.id
                      : like;

                  return (
                    likeId?.toString() ===
                    currentUserId?.toString()
                  );
                }
              );

            return (
              <article
                key={post._id}
                className="profile-post-card"
              >

                {/* AUTHOR + DELETE */}

                <div className="profile-post-header-row">

                  <div className="profile-post-author">

                    <div className="profile-post-avatar">

                      {profileUser.profilePicture ? (
                        <img
                          src={
                            profileUser.profilePicture
                          }
                          alt={
                            profileUser.name
                          }
                        />
                      ) : (
                        initial
                      )}

                    </div>

                    <div>

                      <Link
                        to={`/profile/${profileUserId}`}
                        className="profile-post-name"
                      >
                        {profileUser.name}
                      </Link>

                      <small>
                        {post.createdAt
                          ? new Date(
                              post.createdAt
                            ).toLocaleString()
                          : ""}
                      </small>

                    </div>

                  </div>

                  {isOwnProfile && (
                    <button
                      type="button"
                      className="profile-post-delete"
                      onClick={() =>
                        handleDeletePost(
                          post._id
                        )
                      }
                      disabled={
                        deletingPostId ===
                        post._id
                      }
                    >
                      {deletingPostId ===
                      post._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  )}

                </div>

                {/* CONTENT */}

                {post.content && (
                  <div className="profile-post-content">
                    {post.content}
                  </div>
                )}

                {/* ==================================
                    MEDIA
                ================================== */}

                {media.length > 0 && (
                  <div
                    className={`post-media-grid post-media-count-${Math.min(
                      media.length,
                      4
                    )}`}
                  >

                    {media.map(
                      (
                        mediaItem,
                        index
                      ) => (
                        <div
                          key={
                            mediaItem.publicId ||
                            mediaItem.url ||
                            index
                          }
                          className="post-media-item"
                        >

                          {mediaItem.resourceType ===
                          "video" ? (
                            <video
                              src={
                                mediaItem.url
                              }
                              controls
                              preload="metadata"
                              playsInline
                            />
                          ) : (
                            <img
                              src={
                                mediaItem.url
                              }
                              alt={`Post media ${
                                index +
                                1
                              }`}
                              loading="lazy"
                            />
                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

                {/* STATS */}

                <div className="profile-post-meta">

                  <span>
                    {likes.length}{" "}
                    {likes.length === 1
                      ? "like"
                      : "likes"}
                  </span>

                  <span>
                    {comments.length}{" "}
                    {comments.length === 1
                      ? "comment"
                      : "comments"}
                  </span>

                </div>

                {/* ACTIONS */}

                <div className="profile-post-actions">

                  <button
                    type="button"
                    className={
                      isLiked
                        ? "profile-post-action liked"
                        : "profile-post-action"
                    }
                    onClick={() =>
                      handleLike(
                        post._id
                      )
                    }
                  >
                    <span>
                      {isLiked
                        ? "♥"
                        : "♡"}
                    </span>

                    {isLiked
                      ? "Liked"
                      : "Like"}
                  </button>

                  <span className="profile-post-comment-label">
                    <span>
                      ○
                    </span>

                    Comment
                  </span>

                </div>

                {/* COMMENTS */}

                <div className="profile-comments-section">

                  <div className="profile-comments-heading">
                    Comments
                  </div>

                  {comments.length ===
                    0 && (
                    <p className="profile-no-comments">
                      No comments yet.
                      Start the conversation.
                    </p>
                  )}

                  {comments.map(
                    (comment) => {
                      const commentUser =
                        comment.user ||
                        comment.author;

                      const commentTextValue =
                        comment.text ||
                        comment.content ||
                        "";

                      const commentUserId =
                        commentUser?._id ||
                        commentUser?.id;

                      return (
                        <div
                          key={
                            comment._id
                          }
                          className="profile-comment-item"
                        >

                          <div className="profile-comment-avatar">

                            {commentUser
                              ?.profilePicture ? (
                              <img
                                src={
                                  commentUser
                                    .profilePicture
                                }
                                alt={
                                  commentUser
                                    .name ||
                                  "User"
                                }
                              />
                            ) : (
                              commentUser
                                ?.name
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase() ||
                              "U"
                            )}

                          </div>

                          <div className="profile-comment-body">

                            <div className="profile-comment-top">

                              {commentUserId ? (
                                <Link
                                  to={`/profile/${commentUserId}`}
                                  className="profile-comment-user"
                                >
                                  {commentUser.name ||
                                    "Unknown User"}
                                </Link>
                              ) : (
                                <span className="profile-comment-user">
                                  Unknown User
                                </span>
                              )}

                              {commentUserId
                                ?.toString() ===
                                currentUserId
                                  ?.toString() && (
                                <button
                                  type="button"
                                  className="profile-comment-delete"
                                  onClick={() =>
                                    handleDeleteComment(
                                      post._id,
                                      comment._id
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              )}

                            </div>

                            <p>
                              {
                                commentTextValue
                              }
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                  {/* ADD COMMENT */}

                  <div className="profile-comment-form">

                    <div className="profile-comment-input-avatar">

                      {currentUser?.profilePicture ? (
                        <img
                          src={
                            currentUser.profilePicture
                          }
                          alt={
                            currentUser.name ||
                            "User"
                          }
                        />
                      ) : (
                        currentUser?.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "U"
                      )}

                    </div>

                    <input
                      type="text"
                      value={
                        commentText[
                          post._id
                        ] || ""
                      }
                      onChange={(e) =>
                        setCommentText(
                          (current) => ({
                            ...current,

                            [post._id]:
                              e.target.value,
                          })
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                            "Enter" &&
                          !e.shiftKey
                        ) {
                          e.preventDefault();

                          handleCreateComment(
                            post._id
                          );
                        }
                      }}
                      placeholder="Write a comment..."
                      maxLength="500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleCreateComment(
                          post._id
                        )
                      }
                      disabled={
                        commenting[
                          post._id
                        ] ||
                        !(
                          commentText[
                            post._id
                          ] || ""
                        ).trim()
                      }
                    >
                      {commenting[
                        post._id
                      ]
                        ? "..."
                        : "Send"}
                    </button>

                  </div>

                </div>

              </article>
            );
          }
        )}

      </div>

      {/* ======================================
          EDIT PROFILE MODAL
      ====================================== */}

      {editing && (
        <div
          className="edit-profile-overlay"
          onMouseDown={
            closeEditProfile
          }
        >

          <div
            className="edit-profile-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            <div className="edit-profile-header">

              <div>

                <p className="profile-eyebrow">
                  PROFILE
                </p>

                <h2>
                  Edit profile
                </h2>

              </div>

              <button
                type="button"
                className="edit-profile-close"
                onClick={
                  closeEditProfile
                }
                disabled={
                  savingProfile
                }
              >
                ×
              </button>

            </div>

            <form
              className="edit-profile-form"
              onSubmit={
                handleSaveProfile
              }
            >

              {/* ==============================
                  PROFILE PHOTO
              ============================== */}

              <div className="edit-profile-photo-section">

                <div className="edit-profile-photo-preview">

                  {profilePhotoPreview ? (
                    <img
                      src={
                        profilePhotoPreview
                      }
                      alt="Profile preview"
                    />
                  ) : (
                    profileUser.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                    "U"
                  )}

                </div>

                <div className="edit-profile-photo-controls">

                  <strong>
                    Profile photo
                  </strong>

                  <p>
                    JPG, PNG or WEBP.
                    Maximum 10 MB.
                  </p>

                  <button
                    type="button"
                    className="edit-profile-photo-button"
                    onClick={() =>
                      profilePhotoInputRef
                        .current
                        ?.click()
                    }
                    disabled={
                      savingProfile
                    }
                  >
                    {profilePhoto
                      ? "Choose another photo"
                      : profileUser.profilePicture
                      ? "Change photo"
                      : "Upload photo"}
                  </button>

                  <input
                    ref={
                      profilePhotoInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleProfilePhotoChange
                    }
                    className="edit-profile-photo-input"
                  />

                </div>

              </div>

              {/* NAME */}

              <div className="edit-profile-field">

                <label htmlFor="profile-name">
                  Name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={
                    editForm.name
                  }
                  onChange={
                    handleEditChange
                  }
                  maxLength="80"
                  required
                />

              </div>

              {/* BIO */}

              <div className="edit-profile-field">

                <label htmlFor="profile-bio">
                  Bio
                </label>

                <textarea
                  id="profile-bio"
                  name="bio"
                  value={
                    editForm.bio
                  }
                  onChange={
                    handleEditChange
                  }
                  rows="4"
                  maxLength="160"
                />

                <small>
                  {editForm.bio.length}
                  /160
                </small>

              </div>

              {/* ACTIONS */}

              <div className="edit-profile-actions">

                <button
                  type="button"
                  className="edit-profile-cancel"
                  onClick={
                    closeEditProfile
                  }
                  disabled={
                    savingProfile
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-profile-save"
                  disabled={
                    savingProfile ||
                    !editForm.name.trim()
                  }
                >
                  {savingProfile
                    ? profilePhoto
                      ? "Uploading..."
                      : "Saving..."
                    : "Save changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

export default Profile;