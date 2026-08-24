import { useEffect, useState } from "react";
import {
  getTaskComments,
  createTaskComment,
  deleteTaskComment,
  getTaskActivity,
  updateTask,
  deleteTask,
} from "../api/api.js";

function newestFirst(items) {
  return [...items].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
}

function getDetails(details) {
  if (!details) return {};

  if (typeof details === "string") {
    try {
      return JSON.parse(details);
    } catch {
      return {};
    }
  }

  return details;
}

function formatActivity(item) {
  const details = getDetails(item.details);
  const from = details.fromName || "No column";
  const to = details.toName || "No column";

  if (item.action === "status_changed") {
    return `changed status from ${from} to ${to}`;
  }

  if (item.action === "assigned") {
    return `assigned the task to ${to}`;
  }

  if (item.action === "unassigned") {
    return `removed ${from} from the task`;
  }

  if (item.action === "commented") {
    return "added a note";
  }

  if (item.action === "comment_deleted") {
    return "deleted a note";
  }

  return item.action.replaceAll("_", " ");
}

export default function TaskDetailsModal({
  task,
  token,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(task.priority || "medium");
  }, [task]);

  useEffect(() => {
    async function loadDetails() {
      try {
        setError("");

        const [commentsRes, activityRes] = await Promise.all([
          getTaskComments(task.id, token),
          getTaskActivity(task.id, token),
        ]);

        setComments(newestFirst(commentsRes.comments || []));
        setActivity(newestFirst(activityRes.activity || []));
      } catch (err) {
        setError(err.message);
      }
    }

    loadDetails();
  }, [task.id, token]);

  const refreshActivity = async () => {
    const activityRes = await getTaskActivity(task.id, token);
    setActivity(newestFirst(activityRes.activity || []));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const { task: updatedTask } = await updateTask(
        task.id,
        {
          title: title.trim(),
          description: description.trim(),
          priority,
        },
        token,
      );

      onTaskUpdated(updatedTask);
      await refreshActivity();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setError("");

      const { comment } = await createTaskComment(
        task.id,
        newComment.trim(),
        token,
      );

      setComments((current) => newestFirst([comment, ...current]));
      setNewComment("");
      await refreshActivity();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      setDeletingComment(true);
      setError("");
      await deleteTaskComment(commentToDelete.id, token);
      setComments((current) =>
        current.filter((comment) => comment.id !== commentToDelete.id),
      );
      setCommentToDelete(null);
      await refreshActivity();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingComment(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      await deleteTask(task.id, token);
      onTaskDeleted(task.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay open" onMouseDown={onClose}>
      <div className="task-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="task-modal-header">
          <h2>Task details</h2>
          <button className="delete-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <p className="settings-error">{error}</p>}

        <div className="task-details-section">
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
            />
          </label>

          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete task"}
            </button>

            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        <div className="task-details-section">
          <h3>Notes</h3>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="placeholder">No notes yet.</p>
            ) : (
              comments.map((comment) => (
                <div className="comment" key={comment.id}>
                  <div className="comment-header">
                    <strong>
                      {comment.author_name || "Project member"}
                    </strong>

                    <button
                      className="comment-delete-btn"
                      onClick={() => setCommentToDelete(comment)}
                      aria-label="Delete note"
                    >
                      ×
                    </button>
                  </div>

                  <p>{comment.body}</p>
                  <span>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          <textarea
            placeholder="Add a note..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <button className="btn-primary" onClick={handleAddComment}>
            Add note
          </button>
        </div>

        <div className="task-details-section">
          <h3>Activity</h3>

          <div className="activity-list">
            {activity.length === 0 ? (
              <p className="placeholder">No activity yet.</p>
            ) : (
              activity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <strong>{item.user_name || "Project member"}</strong>
                  {formatActivity(item)}
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {commentToDelete && (
          <div
            className="confirm-overlay"
            onMouseDown={() => setCommentToDelete(null)}
          >
            <div
              className="confirm-modal"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h3>Delete note permanently?</h3>
              <p>
                This note will be permanently removed from the task. This
                cannot be undone.
              </p>

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setCommentToDelete(null)}
                  disabled={deletingComment}
                >
                  Cancel
                </button>

                <button
                  className="danger-btn"
                  onClick={handleDeleteComment}
                  disabled={deletingComment}
                >
                  {deletingComment ? "Deleting..." : "Delete note"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}