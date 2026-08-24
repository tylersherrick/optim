import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import TaskDetailsModal from "../components/TaskDetailModal.jsx";
import {
  getProjectBoard,
  getColumns,
  getTasks,
  createTask,
  moveTask,
  createColumn,
  renameColumn,
  reorderColumns,
  deleteColumn,
  getProjectMembers,
  assignTask,
  addProjectMember,
} from "../api/api.js";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const RAIL_COLORS = [
  "#504d63",
  "#4a5765",
  "#819aa3",
  "#8fb87a",
  "#d9a54a",
  "#c96a5a",
];

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .replace(".", "")
    .toUpperCase();
}

export default function Kanban({ projectId }) {
  const { token, user } = useAuth();

  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");

  const [editingColId, setEditingColId] = useState(null);
  const [editingColName, setEditingColName] = useState("");

  const [addingTaskCol, setAddingTaskCol] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");

  const [addingMember, setAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const [activeFilters, setActiveFilters] = useState(new Set());
  const [dragOverMember, setDragOverMember] = useState(null);
  const [flashTaskId, setFlashTaskId] = useState(null);
  const [popMemberId, setPopMemberId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimerRef = useRef(null);

  const load = useCallback(() => {
    if (!projectId || !token) return;

    setLoading(true);
    setError("");

    getProjectBoard(projectId, token)
      .then(({ board }) =>
        Promise.all([
          board,
          getColumns(board.id, token),
          getTasks(projectId, token),
          getProjectMembers(projectId, token),
        ]),
      )
      .then(
        ([loadedBoard, columnsResponse, tasksResponse, membersResponse]) => {
          setBoard(loadedBoard);
          setColumns(columnsResponse.columns);
          setTasks(tasksResponse.tasks);
          setMembers(membersResponse.members);
        },
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(""), 2600);
  };

  const flash = (taskId) => {
    setFlashTaskId(taskId);
    setTimeout(
      () => setFlashTaskId((cur) => (cur === taskId ? null : cur)),
      1200,
    );
  };

  const passesFilters = (task) => {
    if (activeFilters.has("mine") && task.assignee_id !== user?.id)
      return false;
    const priorityFilters = [...activeFilters].filter((f) => f !== "mine");
    if (priorityFilters.length && !priorityFilters.includes(task.priority))
      return false;
    return true;
  };

  const tasksForColumn = (columnId) =>
    tasks.filter((task) => task.column_id === columnId && passesFilters(task));

  const unassigned = tasks.filter(
    (task) => task.column_id == null && passesFilters(task),
  );

  const lastColumnId = columns[columns.length - 1]?.id;
  const activeCounts = {};
  members.forEach((m) => {
    activeCounts[m.id] = tasks.filter(
      (t) => t.assignee_id === m.id && t.column_id !== lastColumnId,
    ).length;
  });

  const toggleFilter = (key) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const moveTaskOnBoard = async (taskId, columnId) => {
    const previousTasks = tasks;
    const movingTask = previousTasks.find((t) => t.id === taskId);

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              column_id: columnId,
            }
          : task,
      ),
    );

    try {
      const { task: updatedTask } = await moveTask(taskId, columnId, token);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );

      setSelectedTask((currentTask) =>
        currentTask?.id === updatedTask.id ? updatedTask : currentTask,
      );

      flash(taskId);
      const colName = columns.find((c) => c.id === columnId)?.name;
      if (movingTask && colName)
        showToast(`${movingTask.title} moved to ${colName}`);
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  };

  const handleDrop = (event, columnId) => {
    event.preventDefault();

    const taskId = Number(event.dataTransfer.getData("text/task-id"));

    if (taskId) {
      moveTaskOnBoard(taskId, columnId);
    }
  };

  const handleRailDrop = async (event, memberId) => {
    event.preventDefault();
    setDragOverMember(null);

    const taskId = Number(event.dataTransfer.getData("text/task-id"));
    if (!taskId) return;

    const previousTasks = tasks;
    const targetTask = previousTasks.find((t) => t.id === taskId);

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, assignee_id: memberId } : task,
      ),
    );

    flash(taskId);
    setPopMemberId(memberId);
    setTimeout(
      () => setPopMemberId((cur) => (cur === memberId ? null : cur)),
      600,
    );

    try {
      const { task: updatedTask } = await assignTask(taskId, memberId, token);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );

      setSelectedTask((currentTask) =>
        currentTask?.id === updatedTask.id ? updatedTask : currentTask,
      );

      const member = members.find((m) => m.id === memberId);
      showToast(
        `${targetTask?.title ?? "Task"} assigned to ${member?.name?.split(" ")[0] ?? "teammate"}`,
      );
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  };

  const handleAddColumn = async () => {
    if (!newColName.trim()) return;

    try {
      const { column } = await createColumn(board.id, newColName.trim(), token);

      setColumns((currentColumns) => [...currentColumns, column]);

      setNewColName("");
      setAddingCol(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRenameColumn = async (columnId) => {
    if (!editingColName.trim()) {
      setEditingColId(null);
      return;
    }

    try {
      const { column } = await renameColumn(
        columnId,
        editingColName.trim(),
        token,
      );

      setColumns((currentColumns) =>
        currentColumns.map((currentColumn) =>
          currentColumn.id === columnId ? column : currentColumn,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setEditingColId(null);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      await deleteColumn(columnId, token);

      setColumns((currentColumns) =>
        currentColumns.filter((column) => column.id !== columnId),
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.column_id === columnId
            ? {
                ...task,
                column_id: null,
              }
            : task,
        ),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const moveColumn = async (index, direction) => {
    const nextColumns = [...columns];
    const swapIndex = index + direction;

    if (swapIndex < 0 || swapIndex >= nextColumns.length) {
      return;
    }

    [nextColumns[index], nextColumns[swapIndex]] = [
      nextColumns[swapIndex],
      nextColumns[index],
    ];

    setColumns(nextColumns);

    try {
      await reorderColumns(
        board.id,
        nextColumns.map((column) => column.id),
        token,
      );
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const handleAddTask = async (columnId) => {
    if (!newTaskTitle.trim()) return;

    try {
      const { task } = await createTask(
        projectId,
        {
          columnId,
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
        },
        token,
      );

      setTasks((currentTasks) => [...currentTasks, task]);

      setNewTaskTitle("");
      setNewTaskPriority("medium");
      setAddingTaskCol(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    try {
      const { member } = await addProjectMember(
        projectId,
        newMemberEmail.trim(),
        token,
      );
      setMembers((currentMembers) => [...currentMembers, member]);
      setNewMemberEmail("");
      setAddingMember(false);
      showToast(`${member.name} added to the project`);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleTaskUpdated = (updatedTask) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    );

    setSelectedTask(updatedTask);
  };

  const handleTaskDragStart = (event, taskId) => {
    event.dataTransfer.setData("text/task-id", String(taskId));
  };

  if (!projectId) {
    return (
      <div>
        <div className="main-header">
          <h1>Kanban board</h1>
        </div>

        <p className="settings-message">
          Select a project from Home to see its board.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main-header">
        <h1>Kanban board</h1>
      </div>
    );
  }

  return (
    <div className="kanban-view">
      <aside className="kanban-rail">
        <h3>Team — drag a card here</h3>
        {members.map((m, i) => (
          <div
            key={m.id}
            className={`rail-member ${dragOverMember === m.id ? "droptarget" : ""} ${popMemberId === m.id ? "assign-pop" : ""}`}
            onDragEnter={() => setDragOverMember(m.id)}
            onDragLeave={() =>
              setDragOverMember((cur) => (cur === m.id ? null : cur))
            }
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleRailDrop(event, m.id)}
          >
            <div
              className="rail-av"
              style={{ background: RAIL_COLORS[i % RAIL_COLORS.length] }}
            >
              {initials(m.name)}
            </div>
            <div className="rail-info">
              <div className="rail-name">{m.name}</div>
            </div>
            <div className="rail-count">{activeCounts[m.id] ?? 0}</div>
          </div>
        ))}
        {addingMember ? (
          <div className="rail-add">
            <input
              autoFocus
              type="email"
              placeholder="teammate@email.com"
              value={newMemberEmail}
              onChange={(event) => setNewMemberEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAddMember();
              }}
            />
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setAddingMember(false);
                  setNewMemberEmail("");
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddMember}>
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            className="rail-add-btn"
            onClick={() => setAddingMember(true)}
          >
            + Add to project
          </button>
        )}
        <p className="rail-hint">
          <b>Quick-assign:</b> drag any card onto a teammate to assign it.
        </p>
      </aside>

      <div className="kanban-main">
        <div className="main-header">
          <h1>{board?.name ?? "Kanban board"}</h1>

          <button className="btn-primary" onClick={() => setAddingCol(true)}>
            + New column
          </button>
        </div>

        <div className="chips">
          <button
            className={`chip ${activeFilters.has("mine") ? "on green" : ""}`}
            onClick={() => toggleFilter("mine")}
          >
            Assigned to me
          </button>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              className={`chip ${activeFilters.has(p) ? "on" : ""}`}
              onClick={() => toggleFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {error && <p className="settings-error">{error}</p>}

        <div className="kanban">
          {columns.map((column, index) => (
            <div
              className="kcol"
              key={column.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, column.id)}
            >
              <div className="kcol-header">
                {editingColId === column.id ? (
                  <input
                    autoFocus
                    value={editingColName}
                    onChange={(event) => setEditingColName(event.target.value)}
                    onBlur={() => handleRenameColumn(column.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleRenameColumn(column.id);
                      }
                    }}
                  />
                ) : (
                  <h4
                    onClick={() => {
                      setEditingColId(column.id);
                      setEditingColName(column.name);
                    }}
                  >
                    {column.name}
                  </h4>
                )}

                <div className="kcol-actions">
                  <button
                    disabled={index === 0}
                    onClick={() => moveColumn(index, -1)}
                  >
                    &larr;
                  </button>

                  <button
                    disabled={index === columns.length - 1}
                    onClick={() => moveColumn(index, 1)}
                  >
                    &rarr;
                  </button>

                  <button onClick={() => handleDeleteColumn(column.id)}>
                    &times;
                  </button>
                </div>
              </div>

              {tasksForColumn(column.id).map((task) => {
                const assignee = members.find((m) => m.id === task.assignee_id);
                return (
                  <div
                    className={`ktask ${flashTaskId === task.id ? "just-assigned" : ""}`}
                    key={task.id}
                    draggable
                    onDragStart={(event) => handleTaskDragStart(event, task.id)}
                    onClick={() => setSelectedTask(task)}
                  >
                    <span
                      className={`priority-dot priority-${task.priority}`}
                    />

                    <span className="ktask-title">{task.title}</span>

                    <span
                      className={`ktask-assignee ${assignee ? "" : "unassigned"}`}
                    >
                      {assignee ? initials(assignee.name) : "+"}
                    </span>
                  </div>
                );
              })}

              {addingTaskCol === column.id ? (
                <div className="ktask-new">
                  <input
                    autoFocus
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleAddTask(column.id);
                      }
                    }}
                  />

                  <select
                    value={newTaskPriority}
                    onChange={(event) => setNewTaskPriority(event.target.value)}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>

                  <div className="modal-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setAddingTaskCol(null);
                        setNewTaskTitle("");
                        setNewTaskPriority("medium");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn-primary"
                      onClick={() => handleAddTask(column.id)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="add-task-btn"
                  onClick={() => setAddingTaskCol(column.id)}
                >
                  + Add task
                </button>
              )}
            </div>
          ))}

          {addingCol && (
            <div className="kcol kcol-new">
              <input
                autoFocus
                placeholder="Column name"
                value={newColName}
                onChange={(event) => setNewColName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleAddColumn();
                  }
                }}
              />

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setAddingCol(false);
                    setNewColName("");
                  }}
                >
                  Cancel
                </button>

                <button className="btn-primary" onClick={handleAddColumn}>
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {unassigned.length > 0 && (
          <div className="kanban-unassigned">
            <h4>No column</h4>

            {unassigned.map((task) => (
              <div
                className="ktask"
                key={task.id}
                draggable
                onDragStart={(event) => handleTaskDragStart(event, task.id)}
                onClick={() => setSelectedTask(task)}
              >
                <span className={`priority-dot priority-${task.priority}`} />

                <span className="ktask-title">{task.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {toastMsg && (
        <div className="kanban-toast show">
          <span className="kanban-toast-tick">✓</span>
          {toastMsg}
        </div>
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          token={token}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
