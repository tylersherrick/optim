import { useEffect, useState } from "react";
import {
  getTaskComments,
  createTaskComment,
  deleteTaskComment,
  getTaskActivity,
  updateTask,
  deleteTask,
  moveTask,
  assignTask,
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
  const from = details.fromName || "No one";
  const to = details.toName || "No one";

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

function TaskDropdown({
  value,
  options,
  onChange,
  open,
  setOpen,
  disabled = false,
}) {
  const selectedOption =
    options.find(
      (option) => String(option.value) === String(value),
    ) ?? options[0];

  return (
    <div
      className="kanban-filter-dropdown"
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <button
        type="button"
        disabled={disabled}
        className={`kanban-filter-button ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: "100%",
          minWidth: 0,
          minHeight: "42px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "9px 13px",
          border: `1px solid ${
            open ? "var(--green)" : "var(--border)"
          }`,
          borderRadius: "10px",
          background: "var(--card)",
          color: "var(--text)",
          fontSize: "13px",
          fontWeight: 600,
          cursor: disabled ? "default" : "pointer",
          textAlign: "left",
          boxShadow: open
            ? "0 0 0 3px rgba(147, 197, 145, 0.12)"
            : "none",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedOption?.label}
        </span>

        <span
          style={{
            fontSize: "13px",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        >
          ▾
        </span>
      </button>

      {open && !disabled && (
        <div
          className="kanban-filter-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 300,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "6px",
            boxShadow: "0 10px 26px rgba(0, 0, 0, 0.14)",
            maxHeight: "280px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => {
            const selected =
              String(option.value) ===
              String(selectedOption?.value);

            return (
              <button
                type="button"
                key={String(option.value)}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  minHeight: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: "7px",
                  background: selected
                    ? "var(--green-light)"
                    : "transparent",
                  color: selected
                    ? "var(--on-track)"
                    : "var(--text)",
                  fontSize: "13px",
                  fontWeight: selected ? 600 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span>{option.label}</span>
                {selected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TaskDetailsModal({
  task,
  token,
  columns = [],
  members = [],
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(
    task.description || "",
  );
  const [priority, setPriority] = useState(
    task.priority || "medium",
  );
  const [status, setStatus] = useState(task.column_id || "");
  const [assignee, setAssignee] = useState(
    task.assignee_id ?? "",
  );

  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [moving, setMoving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);

  const [error, setError] = useState("");

  const [statusOpen, setStatusOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  useEffect(() => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(task.priority || "medium");
    setStatus(task.column_id || "");
    setAssignee(task.assignee_id ?? "");
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

  useEffect(() => {
    if (
      !statusOpen &&
      !assigneeOpen &&
      !priorityOpen
    ) {
      return;
    }

    const handlePointerDown = (event) => {
      if (!event.target.closest(".kanban-filter-dropdown")) {
        setStatusOpen(false);
        setAssigneeOpen(false);
        setPriorityOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, [
    statusOpen,
    assigneeOpen,
    priorityOpen,
  ]);

  const refreshActivity = async () => {
    const activityRes = await getTaskActivity(task.id, token);
    setActivity(newestFirst(activityRes.activity || []));
  };

  const handleStatusChange = async (value) => {
    const columnId = Number(value);

    if (!columnId || columnId === Number(task.column_id)) {
      return;
    }

    try {
      setMoving(true);
      setError("");

      const { task: updatedTask } = await moveTask(
        task.id,
        columnId,
        token,
      );

      setStatus(updatedTask.column_id);
      onTaskUpdated(updatedTask);
      await refreshActivity();
    } catch (err) {
      setError(err.message);
      setStatus(task.column_id || "");
    } finally {
      setMoving(false);
    }
  };

  const handleAssigneeChange = async (value) => {
    const assigneeId =
      value === "" ? null : Number(value);

    if (
      (assigneeId === null &&
        task.assignee_id == null) ||
      String(assigneeId) ===
        String(task.assignee_id)
    ) {
      return;
    }

    try {
      setAssigning(true);
      setError("");

      const { task: updatedTask } = await assignTask(
        task.id,
        assigneeId,
        token,
      );

      setAssignee(updatedTask.assignee_id ?? "");
      onTaskUpdated(updatedTask);
      await refreshActivity();
    } catch (err) {
      setError(err.message);
      setAssignee(task.assignee_id ?? "");
    } finally {
      setAssigning(false);
    }
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

      setComments((current) =>
        newestFirst([comment, ...current]),
      );

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

      await deleteTaskComment(
        commentToDelete.id,
        token,
      );

      setComments((current) =>
        current.filter(
          (comment) =>
            comment.id !== commentToDelete.id,
        ),
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
    const confirmed = window.confirm(
      `Delete "${task.title}"?`,
    );

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

  const statusOptions = columns.map((column) => ({
    value: column.id,
    label: column.name,
  }));

  const assigneeOptions = [
    {
      value: "",
      label: "No one — task pool",
    },
    ...members.map((member) => ({
      value: member.id,
      label: member.email
        ? `${member.name} (${member.email})`
        : member.name,
    })),
  ];

  const priorityOptions = [
    {
      value: "low",
      label: "Low",
    },
    {
      value: "medium",
      label: "Medium",
    },
    {
      value: "high",
      label: "High",
    },
    {
      value: "urgent",
      label: "Urgent",
    },
  ];

  return (
    <div
      className="modal-overlay open"
      onMouseDown={onClose}
    >
      <div
        className="task-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="task-modal-header">
          <h2>Task details</h2>

          <button
            className="delete-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && (
          <p className="settings-error">{error}</p>
        )}

        <div className="task-details-section">
          <label>
            Title

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Task title"
            />
          </label>

          <label>
            Status

            <TaskDropdown
              value={status}
              options={statusOptions}
              onChange={handleStatusChange}
              open={statusOpen}
              setOpen={setStatusOpen}
              disabled={moving}
            />

            {moving && (
              <span className="task-field-status">
                Moving task...
              </span>
            )}
          </label>

          <label>
            Assigned to

            <TaskDropdown
              value={assignee}
              options={assigneeOptions}
              onChange={handleAssigneeChange}
              open={assigneeOpen}
              setOpen={setAssigneeOpen}
              disabled={assigning}
            />

            {assigning && (
              <span className="task-field-status">
                Updating assignment...
              </span>
            )}
          </label>

          <label>
            Description

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Add a description..."
            />
          </label>

          <label>
            Priority

            <TaskDropdown
              value={priority}
              options={priorityOptions}
              onChange={setPriority}
              open={priorityOpen}
              setOpen={setPriorityOpen}
            />
          </label>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? "Deleting..."
                : "Delete task"}
            </button>

            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </div>

        <div className="task-details-section">
          <h3>Notes</h3>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="placeholder">
                No notes yet.
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  className="comment"
                  key={comment.id}
                >
                  <div className="comment-header">
                    <strong>
                      {comment.author_name ||
                        "Project member"}
                    </strong>

                    <button
                      className="comment-delete-btn"
                      onClick={() =>
                        setCommentToDelete(
                          comment,
                        )
                      }
                      aria-label="Delete note"
                    >
                      ×
                    </button>
                  </div>

                  <p>{comment.body}</p>

                  <span>
                    {new Date(
                      comment.created_at,
                    ).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          <textarea
            placeholder="Add a note..."
            value={newComment}
            onChange={(e) =>
              setNewComment(e.target.value)
            }
          />

          <button
            className="btn-primary"
            onClick={handleAddComment}
          >
            Add note
          </button>
        </div>

        <div className="task-details-section">
          <h3>Activity</h3>

          <div className="activity-list">
            {activity.length === 0 ? (
              <p className="placeholder">
                No activity yet.
              </p>
            ) : (
              activity.map((item) => (
                <div
                  className="activity-item"
                  key={item.id}
                >
                  <strong>
                    {item.user_name ||
                      "Project member"}
                  </strong>

                  {formatActivity(item)}

                  <span>
                    {new Date(
                      item.created_at,
                    ).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {commentToDelete && (
          <div
            className="confirm-overlay"
            onMouseDown={() =>
              setCommentToDelete(null)
            }
          >
            <div
              className="confirm-modal"
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >
              <h3>
                Delete note permanently?
              </h3>

              <p>
                This note will be permanently
                removed from the task. This
                cannot be undone.
              </p>

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() =>
                    setCommentToDelete(null)
                  }
                  disabled={deletingComment}
                >
                  Cancel
                </button>

                <button
                  className="danger-btn"
                  onClick={handleDeleteComment}
                  disabled={deletingComment}
                >
                  {deletingComment
                    ? "Deleting..."
                    : "Delete note"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}