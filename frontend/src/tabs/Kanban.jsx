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

function Dropdown({
  value,
  options,
  onChange,
  open,
  setOpen,
  label,
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
        minWidth: 0,
        flex: 1,
      }}
    >
      <button
        type="button"
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
          cursor: "pointer",
          textAlign: "left",
          boxShadow: open
            ? "0 0 0 3px rgba(147, 197, 145, 0.12)"
            : "none",
        }}
      >
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            gap: "1px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              lineHeight: 1,
              color: "var(--muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </span>

          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedOption?.label}
          </span>
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

      {open && (
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
                key={option.value}
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
  const [newTaskPriority, setNewTaskPriority] =
    useState("medium");

  const [addingMember, setAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const [viewFilter, setViewFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [mobileColumnId, setMobileColumnId] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

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
        ([
          loadedBoard,
          columnsResponse,
          tasksResponse,
          membersResponse,
        ]) => {
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

  useEffect(() => {
    if (!columns.length) {
      setMobileColumnId("");
      return;
    }

    setMobileColumnId((current) => {
      if (
        columns.some(
          (column) =>
            String(column.id) === String(current),
        )
      ) {
        return current;
      }

      return columns[0].id;
    });
  }, [columns]);

  useEffect(() => {
    if (
      !viewOpen &&
      !priorityOpen &&
      !statusOpen
    ) {
      return;
    }

    const handlePointerDown = (event) => {
      if (!event.target.closest(".kanban-filter-dropdown")) {
        setViewOpen(false);
        setPriorityOpen(false);
        setStatusOpen(false);
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
    viewOpen,
    priorityOpen,
    statusOpen,
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(
      () => setToastMsg(""),
      2600,
    );
  };

  const flash = (taskId) => {
    setFlashTaskId(taskId);

    setTimeout(
      () =>
        setFlashTaskId((cur) =>
          cur === taskId ? null : cur,
        ),
      1200,
    );
  };

  const passesFilters = (task) => {
    if (
      viewFilter === "mine" &&
      String(task.assignee_id) !== String(user?.id)
    ) {
      return false;
    }

    if (
      viewFilter === "unassigned" &&
      task.assignee_id !== null &&
      task.assignee_id !== undefined
    ) {
      return false;
    }

    if (
      viewFilter.startsWith("member:") &&
      String(task.assignee_id) !==
        viewFilter.replace("member:", "")
    ) {
      return false;
    }

    if (
      priorityFilter !== "all" &&
      task.priority !== priorityFilter
    ) {
      return false;
    }

    if (
      statusFilter !== "all" &&
      String(task.column_id) !== String(statusFilter)
    ) {
      return false;
    }

    return true;
  };

  const tasksForColumn = (columnId) =>
    tasks.filter(
      (task) =>
        task.column_id === columnId &&
        passesFilters(task),
    );

  const unassignedColumnTasks = tasks.filter(
    (task) =>
      task.column_id == null &&
      passesFilters(task),
  );

  const lastColumnId = columns[columns.length - 1]?.id;

  const activeCounts = {};

  members.forEach((member) => {
    activeCounts[member.id] = tasks.filter(
      (task) =>
        task.assignee_id === member.id &&
        task.column_id !== lastColumnId,
    ).length;
  });

  const moveTaskOnBoard = async (
    taskId,
    columnId,
  ) => {
    const previousTasks = tasks;

    const movingTask = previousTasks.find(
      (task) => task.id === taskId,
    );

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
      const { task: updatedTask } = await moveTask(
        taskId,
        columnId,
        token,
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task,
        ),
      );

      setSelectedTask((currentTask) =>
        currentTask?.id === updatedTask.id
          ? updatedTask
          : currentTask,
      );

      flash(taskId);

      const colName = columns.find(
        (column) => column.id === columnId,
      )?.name;

      if (movingTask && colName) {
        showToast(
          `${movingTask.title} moved to ${colName}`,
        );
      }
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  };

  const handleDrop = (event, columnId) => {
    event.preventDefault();

    const taskId = Number(
      event.dataTransfer.getData("text/task-id"),
    );

    if (taskId) {
      moveTaskOnBoard(taskId, columnId);
    }
  };

  const handleRailDrop = async (
    event,
    memberId,
  ) => {
    event.preventDefault();
    setDragOverMember(null);

    const taskId = Number(
      event.dataTransfer.getData("text/task-id"),
    );

    if (!taskId) return;

    const previousTasks = tasks;

    const targetTask = previousTasks.find(
      (task) => task.id === taskId,
    );

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignee_id: memberId,
            }
          : task,
      ),
    );

    flash(taskId);
    setPopMemberId(memberId);

    setTimeout(
      () =>
        setPopMemberId((cur) =>
          cur === memberId ? null : cur,
        ),
      600,
    );

    try {
      const { task: updatedTask } =
        await assignTask(
          taskId,
          memberId,
          token,
        );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task,
        ),
      );

      setSelectedTask((currentTask) =>
        currentTask?.id === updatedTask.id
          ? updatedTask
          : currentTask,
      );

      const member = members.find(
        (m) => m.id === memberId,
      );

      showToast(
        `${targetTask?.title ?? "Task"} assigned to ${
          member?.name?.split(" ")[0] ??
          "teammate"
        }`,
      );
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  };

  const handleAddColumn = async () => {
    if (!newColName.trim()) return;

    try {
      const { column } = await createColumn(
        board.id,
        newColName.trim(),
        token,
      );

      setColumns((currentColumns) => [
        ...currentColumns,
        column,
      ]);

      setNewColName("");
      setAddingCol(false);
      setMobileColumnId(String(column.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRenameColumn = async (
    columnId,
  ) => {
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
          currentColumn.id === columnId
            ? column
            : currentColumn,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setEditingColId(null);
    }
  };

  const handleDeleteColumn = async (
    columnId,
  ) => {
    try {
      await deleteColumn(columnId, token);

      setColumns((currentColumns) =>
        currentColumns.filter(
          (column) => column.id !== columnId,
        ),
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

  const moveColumn = async (
    index,
    direction,
  ) => {
    const nextColumns = [...columns];
    const swapIndex = index + direction;

    if (
      swapIndex < 0 ||
      swapIndex >= nextColumns.length
    ) {
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
        nextColumns.map(
          (column) => column.id,
        ),
        token,
      );
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const handleAddTask = async (
    columnId,
  ) => {
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

      setTasks((currentTasks) => [
        ...currentTasks,
        task,
      ]);

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
      const { member } =
        await addProjectMember(
          projectId,
          newMemberEmail.trim(),
          token,
        );

      setMembers((currentMembers) => [
        ...currentMembers,
        member,
      ]);

      setNewMemberEmail("");
      setAddingMember(false);

      showToast(
        `${member.name} added to the project`,
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskUpdated = (
    updatedTask,
  ) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id
          ? updatedTask
          : task,
      ),
    );

    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = (
    taskId,
  ) => {
    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task.id !== taskId,
      ),
    );

    setSelectedTask(null);
  };

  const handleTaskDragStart = (
    event,
    taskId,
  ) => {
    event.dataTransfer.setData(
      "text/task-id",
      String(taskId),
    );
  };

  const viewOptions = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "mine",
      label: "My tasks",
    },
    {
      value: "unassigned",
      label: "Unassigned",
    },
    ...members.map((member) => ({
      value: `member:${member.id}`,
      label: member.name,
    })),
  ];

  const priorityOptions = [
    {
      value: "all",
      label: "All",
    },
    ...PRIORITIES.map((priority) => ({
      value: priority,
      label:
        priority.charAt(0).toUpperCase() +
        priority.slice(1),
    })),
  ];

  const statusOptions = [
    {
      value: "all",
      label: "All",
    },
    ...columns.map((column) => ({
      value: column.id,
      label: column.name,
    })),
  ];

  if (!projectId) {
    return (
      <div>
        <div className="main-header">
          <h1>Kanban board</h1>
        </div>

        <p className="settings-message">
          Select a project from Home to see
          its board.
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

  const selectedMobileColumn =
    columns.find(
      (column) =>
        String(column.id) ===
        String(mobileColumnId),
    );

  const showingAllStatuses =
    statusFilter === "all";

  return (
    <div className="kanban-view">
      <aside className="kanban-rail">
        <h3>
          Team — drag a card here
        </h3>

        {members.map((member, index) => (
          <div
            key={member.id}
            className={`rail-member ${
              dragOverMember === member.id
                ? "droptarget"
                : ""
            } ${
              popMemberId === member.id
                ? "assign-pop"
                : ""
            }`}
            onDragEnter={() =>
              setDragOverMember(member.id)
            }
            onDragLeave={() =>
              setDragOverMember((current) =>
                current === member.id
                  ? null
                  : current,
              )
            }
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={(event) =>
              handleRailDrop(
                event,
                member.id,
              )
            }
          >
            <div
              className="rail-av"
              style={{
                background:
                  RAIL_COLORS[
                    index %
                      RAIL_COLORS.length
                  ],
              }}
            >
              {initials(member.name)}
            </div>

            <div className="rail-info">
              <div className="rail-name">
                {member.name}
              </div>
            </div>

            <div className="rail-count">
              {activeCounts[member.id] ?? 0}
            </div>
          </div>
        ))}

        {addingMember ? (
          <div className="rail-add">
            <input
              autoFocus
              type="email"
              placeholder="teammate@email.com"
              value={newMemberEmail}
              onChange={(event) =>
                setNewMemberEmail(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddMember();
                }
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

              <button
                className="btn-primary"
                onClick={handleAddMember}
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            className="rail-add-btn"
            onClick={() =>
              setAddingMember(true)
            }
          >
            + Add to project
          </button>
        )}

        <p className="rail-hint">
          <b>Quick-assign:</b> drag any card
          onto a teammate to assign it.
        </p>
      </aside>

      <div className="kanban-main">
        <div className="main-header">
          <h1>
            {board?.name ?? "Kanban board"}
          </h1>

          <button
            className="btn-primary"
            onClick={() =>
              setAddingCol(true)
            }
          >
            + New column
          </button>
        </div>

        <div className="kanban-filter-bar">
          <Dropdown
            label="View"
            value={viewFilter}
            options={viewOptions}
            onChange={(value) => {
              setViewFilter(value);
            }}
            open={viewOpen}
            setOpen={(isOpen) => {
              setViewOpen(isOpen);

              if (isOpen) {
                setPriorityOpen(false);
                setStatusOpen(false);
              }
            }}
          />

          <Dropdown
            label="Priority"
            value={priorityFilter}
            options={priorityOptions}
            onChange={(value) => {
              setPriorityFilter(value);
            }}
            open={priorityOpen}
            setOpen={(isOpen) => {
              setPriorityOpen(isOpen);

              if (isOpen) {
                setViewOpen(false);
                setStatusOpen(false);
              }
            }}
          />

          <Dropdown
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onChange={(value) => {
              setStatusFilter(value);

              if (
                value !== "all" &&
                columns.some(
                  (column) =>
                    String(column.id) ===
                    String(value),
                )
              ) {
                setMobileColumnId(String(value));
              }
            }}
            open={statusOpen}
            setOpen={(isOpen) => {
              setStatusOpen(isOpen);

              if (isOpen) {
                setViewOpen(false);
                setPriorityOpen(false);
              }
            }}
          />
        </div>

        {error && (
          <p className="settings-error">
            {error}
          </p>
        )}

        {viewFilter === "mine" ? (
          <div className="kanban-my-tasks">
            {columns.map((column) => {
              const columnTasks =
                tasksForColumn(column.id);

              if (!columnTasks.length) {
                return null;
              }

              return (
                <section
                  className="my-tasks-section"
                  key={column.id}
                >
                  <div className="my-tasks-heading">
                    <h3>{column.name}</h3>
                    <span>
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="my-tasks-list">
                    {columnTasks.map(
                      (task) => {
                        const assignee =
                          members.find(
                            (member) =>
                              member.id ===
                              task.assignee_id,
                          );

                        return (
                          <div
                            className={`ktask ${
                              flashTaskId ===
                              task.id
                                ? "just-assigned"
                                : ""
                            }`}
                            key={task.id}
                            draggable
                            onDragStart={(
                              event,
                            ) =>
                              handleTaskDragStart(
                                event,
                                task.id,
                              )
                            }
                            onClick={() =>
                              setSelectedTask(
                                task,
                              )
                            }
                          >
                            <span
                              className={`priority-dot priority-${task.priority}`}
                            />

                            <span className="ktask-title">
                              {task.title}
                            </span>

                            <span
                              className={`ktask-assignee ${
                                assignee
                                  ? ""
                                  : "unassigned"
                              }`}
                            >
                              {assignee
                                ? initials(
                                    assignee.name,
                                  )
                                : "+"}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </section>
              );
            })}

            {columns.every(
              (column) =>
                tasksForColumn(column.id)
                  .length === 0,
            ) && (
              <div className="my-tasks-empty">
                <h3>No tasks found</h3>
                <p>
                  You don't have any tasks
                  matching the current
                  filters.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {!showingAllStatuses &&
              selectedMobileColumn && (
                <div className="kanban-mobile-column-picker">
                  <span>
                    {selectedMobileColumn.name}
                  </span>
                </div>
              )}

            <div className="kanban">
              {columns
                .filter((column) => {
                  if (!showingAllStatuses) {
                    return (
                      String(column.id) ===
                      String(statusFilter)
                    );
                  }

                  return tasksForColumn(column.id).length > 0;
                })
                .map((column) => {
                  const index = columns.findIndex(
                    (item) => item.id === column.id,
                  );

                  return (
                    <div
                      className={`kcol ${
                        showingAllStatuses ||
                        String(mobileColumnId) === String(column.id)
                          ? "mobile-active"
                          : ""
                      }`}
                      key={column.id}
                      onDragOver={(event) =>
                        event.preventDefault()
                      }
                      onDrop={(event) =>
                        handleDrop(
                          event,
                          column.id,
                        )
                      }
                    >
                      <div className="kcol-header">
                        {editingColId ===
                        column.id ? (
                          <input
                            autoFocus
                            value={
                              editingColName
                            }
                            onChange={(event) =>
                              setEditingColName(
                                event.target
                                  .value,
                              )
                            }
                            onBlur={() =>
                              handleRenameColumn(
                                column.id,
                              )
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key ===
                                "Enter"
                              ) {
                                handleRenameColumn(
                                  column.id,
                                );
                              }
                            }}
                          />
                        ) : (
                          <h4
                            onClick={() => {
                              setEditingColId(
                                column.id,
                              );
                              setEditingColName(
                                column.name,
                              );
                            }}
                          >
                            {column.name}
                          </h4>
                        )}

                        <div className="kcol-actions">
                          <button
                            disabled={index === 0}
                            onClick={() =>
                              moveColumn(
                                index,
                                -1,
                              )
                            }
                          >
                            &larr;
                          </button>

                          <button
                            disabled={
                              index ===
                              columns.length -
                                1
                            }
                            onClick={() =>
                              moveColumn(
                                index,
                                1,
                              )
                            }
                          >
                            &rarr;
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteColumn(
                                column.id,
                              )
                            }
                          >
                            &times;
                          </button>
                        </div>
                      </div>

                      {tasksForColumn(
                        column.id,
                      ).map((task) => {
                        const assignee =
                          members.find(
                            (member) =>
                              member.id ===
                              task.assignee_id,
                          );

                        return (
                          <div
                            className={`ktask ${
                              flashTaskId ===
                              task.id
                                ? "just-assigned"
                                : ""
                            }`}
                            key={task.id}
                            draggable
                            onDragStart={(
                              event,
                            ) =>
                              handleTaskDragStart(
                                event,
                                task.id,
                              )
                            }
                            onClick={() =>
                              setSelectedTask(
                                task,
                              )
                            }
                          >
                            <span
                              className={`priority-dot priority-${task.priority}`}
                            />

                            <span className="ktask-title">
                              {task.title}
                            </span>

                            <span
                              className={`ktask-assignee ${
                                assignee
                                  ? ""
                                  : "unassigned"
                              }`}
                            >
                              {assignee
                                ? initials(
                                    assignee.name,
                                  )
                                : "+"}
                            </span>
                          </div>
                        );
                      })}

                      {addingTaskCol ===
                      column.id ? (
                        <div className="ktask-new">
                          <input
                            autoFocus
                            placeholder="Task title"
                            value={
                              newTaskTitle
                            }
                            onChange={(event) =>
                              setNewTaskTitle(
                                event.target
                                  .value,
                              )
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key ===
                                "Enter"
                              ) {
                                handleAddTask(
                                  column.id,
                                );
                              }
                            }}
                          />

                          <select
                            value={
                              newTaskPriority
                            }
                            onChange={(event) =>
                              setNewTaskPriority(
                                event.target
                                  .value,
                              )
                            }
                          >
                            {PRIORITIES.map(
                              (priority) => (
                                <option
                                  key={
                                    priority
                                  }
                                  value={
                                    priority
                                  }
                                >
                                  {priority}
                                </option>
                              ),
                            )}
                          </select>

                          <div className="modal-actions">
                            <button
                              className="btn-secondary"
                              onClick={() => {
                                setAddingTaskCol(
                                  null,
                                );
                                setNewTaskTitle(
                                  "",
                                );
                                setNewTaskPriority(
                                  "medium",
                                );
                              }}
                            >
                              Cancel
                            </button>

                            <button
                              className="btn-primary"
                              onClick={() =>
                                handleAddTask(
                                  column.id,
                                )
                              }
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="add-task-btn"
                          onClick={() =>
                            setAddingTaskCol(
                              column.id,
                            )
                          }
                        >
                          + Add task
                        </button>
                      )}
                    </div>
                  );
                },
              )}

              {addingCol && (
                <div className="kcol kcol-new">
                  <input
                    autoFocus
                    placeholder="Column name"
                    value={newColName}
                    onChange={(event) =>
                      setNewColName(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
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

                    <button
                      className="btn-primary"
                      onClick={
                        handleAddColumn
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {unassignedColumnTasks.length >
              0 && (
              <div className="kanban-unassigned">
                <h4>No column</h4>

                {unassignedColumnTasks.map(
                  (task) => (
                    <div
                      className="ktask"
                      key={task.id}
                      draggable
                      onDragStart={(event) =>
                        handleTaskDragStart(
                          event,
                          task.id,
                        )
                      }
                      onClick={() =>
                        setSelectedTask(
                          task,
                        )
                      }
                    >
                      <span
                        className={`priority-dot priority-${task.priority}`}
                      />

                      <span className="ktask-title">
                        {task.title}
                      </span>

                      <span
                        className={`ktask-assignee ${
                          task.assignee_id
                            ? ""
                            : "unassigned"
                        }`}
                      >
                        {task.assignee_id
                          ? initials(
                              members.find(
                                (member) =>
                                  member.id ===
                                  task.assignee_id,
                              )?.name ?? "",
                            )
                          : "+"}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </>
        )}
      </div>

      {toastMsg && (
        <div className="kanban-toast show">
          <span className="kanban-toast-tick">
            ✓
          </span>
          {toastMsg}
        </div>
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          token={token}
          columns={columns}
          members={members}
          onClose={() =>
            setSelectedTask(null)
          }
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}