const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function request(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}

export const getWorkspace = (workspaceId, token) =>
  request(`/workspaces/${workspaceId}`, { token });

export const getMembers = (workspaceId, token) =>
  request(`/workspaces/${workspaceId}/members`, { token });

export const inviteMember = (workspaceId, email, token) =>
  request(`/workspaces/${workspaceId}/invite`, {
    token,
    method: "POST",
    body: { email },
  });

export const removeMember = (workspaceId, userId, token) =>
  request(`/workspaces/${workspaceId}/members/${userId}`, {
    token,
    method: "DELETE",
  });

export const getProjectBoard = (projectId, token) =>
  request(`/projects/${projectId}/board`, { token });

export const getColumns = (boardId, token) =>
  request(`/boards/${boardId}/columns`, { token });

export const getTasks = (projectId, token) =>
  request(`/projects/${projectId}/tasks`, { token });

export const createTask = (projectId, body, token) =>
  request(`/projects/${projectId}/tasks`, {
    token,
    method: "POST",
    body,
  });

export const moveTask = (taskId, columnId, token) =>
  request(`/tasks/${taskId}/move`, {
    token,
    method: "PATCH",
    body: { columnId },
  });

export const updateTask = (taskId, body, token) =>
  request(`/tasks/${taskId}`, {
    token,
    method: "PATCH",
    body,
  });

export const deleteTask = (taskId, token) =>
  request(`/tasks/${taskId}`, {
    token,
    method: "DELETE",
  });

export const createColumn = (boardId, name, token) =>
  request(`/boards/${boardId}/columns`, {
    token,
    method: "POST",
    body: { name },
  });

export const renameColumn = (columnId, name, token) =>
  request(`/columns/${columnId}`, {
    token,
    method: "PATCH",
    body: { name },
  });

export const reorderColumns = (boardId, orderedColumnIds, token) =>
  request(`/boards/${boardId}/columns/reorder`, {
    token,
    method: "PATCH",
    body: { orderedColumnIds },
  });

export const deleteColumn = (columnId, token) =>
  request(`/columns/${columnId}`, {
    token,
    method: "DELETE",
  });

export const getWorkspaces = (token) => request("/workspaces", { token });

export const getProjects = (workspaceId, token) =>
  request(`/projects?workspace_id=${workspaceId}`, { token });

export const createProject = (body, token) =>
  request("/projects", {
    token,
    method: "POST",
    body,
  });

export const createWorkspace = (name, token) =>
  request("/workspaces", {
    token,
    method: "POST",
    body: { name },
  });

export const deleteProject = (projectId, token) =>
  request(`/projects/${projectId}`, {
    token,
    method: "DELETE",
  });

export const getTaskComments = (taskId, token) =>
  request(`/tasks/${taskId}/comments`, { token });

export const createTaskComment = (taskId, body, token) =>
  request(`/tasks/${taskId}/comments`, {
    token,
    method: "POST",
    body: { body },
  });

export const deleteTaskComment = (commentId, token) =>
  request(`/comments/${commentId}`, {
    token,
    method: "DELETE",
  });

export const getTaskActivity = (taskId, token) =>
  request(`/tasks/${taskId}/activity`, { token });

export const getAnalytics = (projectId, token) =>
  request(`/projects/${projectId}/analytics`, { token });

export const getProjectMembers = (projectId, token) =>
  request(`/projects/${projectId}/members`, { token });

export const assignTask = (taskId, assigneeId, token) =>
  request(`/tasks/${taskId}/assignee`, {
    token,
    method: "PATCH",
    body: { assigneeId },
  });

export const addProjectMember = (projectId, email, token) =>
  request(`/projects/${projectId}/members`, {
    token,
    method: "POST",
    body: { email },
  });
