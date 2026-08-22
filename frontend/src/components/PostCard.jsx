import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function PostCard({
  post,
  onPostUpdate,
  onError,
}) {
  const { user } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [commentText, setCommentText] =
    useState("");

  const [commenting, setCommenting] =
    useState(false);

  const [liking, setLiking] =
    useState(false);

  const [
    showAllComments,
    setShowAllComments,
  ] = useState(false);

  // =====================================================
  // POST DATA
  // =====================================================

  const likes = post.likes || [];
  const comments = post.comments || [];

  // =====================================================
  // COMMENTS TO DISPLAY
  // =====================================================

  const visibleComments = showAllComments
    ? comments
    : comments.slice(-3);

  // =====================================================
  // CURRENT USER ID
  // =====================================================

  const currentUserId =
    user?._id || user?.id;

  // =====================================================
  // CHECK IF POST IS LIKED
  // =====================================================

  const isLiked = likes.some((like) => {
    const likeId =
      typeof like === "object"
        ? like?._id || like?.id
        : like;

    return (
      likeId?.toString() ===
      currentUserId?.toString()
    );
  });

  // =====================================================
  // AUTHOR
  // =====================================================

  const author = post.author;

  const authorId =
    typeof author === "object"
      ? author?._id || author?.id
      : author;

  const authorName =
    typeof author === "object"
      ? author?.name || "Unknown User"
      : "Unknown User";

  const authorInitial =
    authorName
      ?.charAt(0)
      ?.toUpperCase() || "U";

  // =====================================================
  // IS THIS MY POST?
  // =====================================================

  const isOwnPost =
    authorId?.toString() ===
    currentUserId?.toString();

  // =====================================================
  // UPDATE POST IN PARENT
  // =====================================================

  const updatePost = (updatedPost) => {
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
    }
  };

  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  const handleLike = async () => {
    if (liking) {
      return;
    }

    try {
      setLiking(true);

      if (onError) {
        onError("");
      }

      const data = await api(
        `/posts/${post._id}/like`,
        {
          method: "POST",
        }
      );

      let updatedLikes = [...likes];

      // ===============================================
      // LIKED
      // ===============================================

      if (data.liked) {
        const alreadyLiked =
          updatedLikes.some((like) => {
            const likeId =
              typeof like === "object"
                ? like?._id || like?.id
                : like;

            return (
              likeId?.toString() ===
              currentUserId?.toString()
            );
          });

        if (!alreadyLiked) {
          updatedLikes.push(
            currentUserId
          );
        }
      }

      // ===============================================
      // UNLIKED
      // ===============================================

      else {
        updatedLikes =
          updatedLikes.filter((like) => {
            const likeId =
              typeof like === "object"
                ? like?._id || like?.id
                : like;

            return (
              likeId?.toString() !==
              currentUserId?.toString()
            );
          });
      }

      updatePost({
        ...post,
        likes: updatedLikes,
      });
    } catch (error) {
      console.error(
        "Like error:",
        error
      );

      if (onError) {
        onError(
          error.message ||
            "Unable to like post."
        );
      }
    } finally {
      setLiking(false);
    }
  };

  // =====================================================
  // CREATE COMMENT
  // =====================================================

  const handleCreateComment =
    async () => {
      const text =
        commentText.trim();

      if (!text || commenting) {
        return;
      }

      try {
        setCommenting(true);

        if (onError) {
          onError("");
        }

        const data = await api(
          `/posts/${post._id}/comments`,
          {
            method: "POST",

            body: JSON.stringify({
              text,
            }),
          }
        );

        if (!data.comment) {
          throw new Error(
            "Comment was not returned by server."
          );
        }

        updatePost({
          ...post,

          comments: [
            ...comments,
            data.comment,
          ],
        });

        setCommentText("");
      } catch (error) {
        console.error(
          "Create comment error:",
          error
        );

        if (onError) {
          onError(
            error.message ||
              "Unable to create comment."
          );
        }
      } finally {
        setCommenting(false);
      }
    };

  // =====================================================
  // DELETE COMMENT
  // =====================================================

  const handleDeleteComment =
    async (commentId) => {
      if (!commentId) {
        return;
      }

      try {
        if (onError) {
          onError("");
        }

        await api(
          `/posts/${post._id}/comments/${commentId}`,
          {
            method: "DELETE",
          }
        );

        updatePost({
          ...post,

          comments:
            comments.filter(
              (comment) =>
                comment._id !==
                commentId
            ),
        });
      } catch (error) {
        console.error(
          "Delete comment error:",
          error
        );

        if (onError) {
          onError(
            error.message ||
              "Unable to delete comment."
          );
        }
      }
    };

  // =====================================================
  // FOCUS COMMENT INPUT
  // =====================================================

  const focusCommentInput = () => {
    document
      .getElementById(
        `comment-${post._id}`
      )
      ?.focus();
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <article
      className={
        isOwnPost
          ? "post-card own-post-card"
          : "post-card other-post-card"
      }
    >

      {/* =================================================
          YOUR POST LABEL
      ================================================= */}

      {isOwnPost && (
        <span className="own-post-label">
          YOUR POST
        </span>
      )}

      {/* =================================================
          POST HEADER
      ================================================= */}

      <div className="post-header">

        <div className="post-author">

          {/* AVATAR */}

          <div className="post-avatar">

            {author?.profilePicture ? (
              <img
                src={
                  author.profilePicture
                }
                alt={authorName}
              />
            ) : (
              authorInitial
            )}

          </div>

          {/* AUTHOR INFORMATION */}

          <div className="post-author-details">

            {authorId ? (
              <Link
                to={`/profile/${authorId}`}
                className="post-author-name"
              >
                {authorName}
              </Link>
            ) : (
              <span className="post-author-name">
                {authorName}
              </span>
            )}

            <small>
              {post.createdAt
                ? new Date(
                    post.createdAt
                  ).toLocaleString()
                : ""}
            </small>

          </div>

        </div>

      </div>

      {/* =================================================
          POST CONTENT
      ================================================= */}

      <div className="post-content">
        {post.content}
      </div>

      {/* =================================================
          POST STATS
      ================================================= */}

      <div className="post-stats">

        <span>
          <strong>
            {likes.length}
          </strong>{" "}
          {likes.length === 1
            ? "like"
            : "likes"}
        </span>

        <span>
          <strong>
            {comments.length}
          </strong>{" "}
          {comments.length === 1
            ? "comment"
            : "comments"}
        </span>

      </div>

      {/* =================================================
          POST ACTIONS
      ================================================= */}

      <div className="post-actions">

        {/* LIKE */}

        <button
          type="button"
          className={
            isLiked
              ? "post-action liked"
              : "post-action"
          }
          onClick={handleLike}
          disabled={liking}
        >

          <span className="post-action-icon">
            {isLiked
              ? "♥"
              : "♡"}
          </span>

          <span>
            {liking
              ? "..."
              : isLiked
              ? "Liked"
              : "Like"}
          </span>

        </button>

        {/* COMMENT */}

        <button
          type="button"
          className="post-action"
          onClick={
            focusCommentInput
          }
        >

          <span className="post-action-icon">
            ◯
          </span>

          <span>
            Comment
          </span>

        </button>

      </div>

      {/* =================================================
          COMMENTS SECTION
      ================================================= */}

      <div className="comments-section">

        {/* COMMENTS HEADER */}

        <div className="comments-heading">

          <span>
            Comments
          </span>

          {comments.length > 0 && (
            <span className="comments-count">
              {comments.length}
            </span>
          )}

        </div>

        {/* =================================================
            NO COMMENTS
        ================================================= */}

        {comments.length === 0 && (
          <p className="no-comments">
            No comments yet. Start the
            conversation.
          </p>
        )}

        {/* =================================================
            COMMENT LIST
        ================================================= */}

        {comments.length > 0 && (
          <div className="comments-list">

            {visibleComments.map(
              (comment) => {
                // Support both:
                // comment.user / text
                // comment.author / content

                const commentUser =
                  comment.user ||
                  comment.author;

                const commentUserId =
                  commentUser?._id ||
                  commentUser?.id;

                const text =
                  comment.text ||
                  comment.content ||
                  "";

                const commentName =
                  commentUser?.name ||
                  "Unknown User";

                const commentInitial =
                  commentName
                    ?.charAt(0)
                    ?.toUpperCase() ||
                  "U";

                const canDelete =
                  commentUserId
                    ?.toString() ===
                  currentUserId
                    ?.toString();

                return (
                  <div
                    key={comment._id}
                    className="comment-item"
                  >

                    {/* COMMENT AVATAR */}

                    <div className="comment-avatar">

                      {commentUser
                        ?.profilePicture ? (
                        <img
                          src={
                            commentUser
                              .profilePicture
                          }
                          alt={
                            commentName
                          }
                        />
                      ) : (
                        commentInitial
                      )}

                    </div>

                    {/* COMMENT BODY */}

                    <div className="comment-body">

                      <div className="comment-top">

                        {/* COMMENT USER */}

                        {commentUserId ? (
                          <Link
                            to={`/profile/${commentUserId}`}
                            className="comment-user"
                          >
                            {commentName}
                          </Link>
                        ) : (
                          <span className="comment-user">
                            {commentName}
                          </span>
                        )}

                        {/* DELETE */}

                        {canDelete && (
                          <button
                            type="button"
                            className="comment-delete"
                            onClick={() =>
                              handleDeleteComment(
                                comment._id
                              )
                            }
                          >
                            Delete
                          </button>
                        )}

                      </div>

                      {/* COMMENT TEXT */}

                      <p>
                        {text}
                      </p>

                      {/* COMMENT DATE */}

                      {comment.createdAt && (
                        <small className="comment-date">
                          {new Date(
                            comment.createdAt
                          ).toLocaleString()}
                        </small>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

        {/* =================================================
            VIEW ALL / SHOW LESS
        ================================================= */}

        {comments.length > 3 && (
          <button
            type="button"
            className="view-comments-button"
            onClick={() =>
              setShowAllComments(
                (current) =>
                  !current
              )
            }
          >
            {showAllComments
              ? "Show less"
              : `View all ${comments.length} comments`}
          </button>
        )}

        {/* =================================================
            COMMENT FORM
        ================================================= */}

        <div className="comment-form">

          {/* CURRENT USER AVATAR */}

          <div className="comment-input-avatar">

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

          {/* INPUT + SEND */}

          <div className="comment-input-wrapper">

            <input
              id={`comment-${post._id}`}
              type="text"
              value={commentText}
              onChange={(e) =>
                setCommentText(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  handleCreateComment();
                }
              }}
              placeholder="Write a comment..."
              maxLength="500"
            />

            <button
              type="button"
              className="comment-send-button"
              onClick={
                handleCreateComment
              }
              disabled={
                commenting ||
                !commentText.trim()
              }
            >
              {commenting
                ? "..."
                : "Send"}
            </button>

          </div>

        </div>

      </div>

    </article>
  );
}

export default PostCard;