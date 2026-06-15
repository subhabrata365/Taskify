const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ProjectStatus = "ONGOING" | "COMPLETED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  teamId: string;
  teamName?: string;
  memberCount: number;
  taskCount: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  role: string;
  user: Pick<User, "id" | "name" | "email" | "role">;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  assignee: Pick<User, "id" | "name" | "email"> | null;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  team: { id: string; name: string; members: TeamMember[] };
  tasks: Task[];
}

export interface DashboardStats {
  totalProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  totalTasks: number;
  tasksByStatus: { TODO: number; IN_PROGRESS: number; DONE: number };
  overdueTasks: number;
  overallProgress: number;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data as T;
}

function authRequest<T>(path: string, token: string, options: RequestInit = {}) {
  return request<T>(path, options, token);
}

export const api = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: (token: string) => authRequest<{ user: User }>("/auth/me", token),

  getProjects: (token: string, status?: ProjectStatus) =>
    authRequest<{ projects: Project[] }>(
      `/projects${status ? `?status=${status}` : ""}`,
      token
    ),

  getProject: (token: string, id: string) =>
    authRequest<{ project: ProjectDetail }>(`/projects/${id}`, token),

  createProject: (
    token: string,
    body: { name: string; description?: string; teamName?: string }
  ) =>
    authRequest<{ project: Project }>("/projects", token, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProject: (
    token: string,
    id: string,
    body: Partial<{ name: string; description: string; status: ProjectStatus }>
  ) =>
    authRequest<{ project: Project }>(`/projects/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  createTask: (
    token: string,
    projectId: string,
    body: { title: string; description?: string; dueDate?: string; assigneeId?: string }
  ) =>
    authRequest<{ task: Task }>(`/projects/${projectId}/tasks`, token, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateTask: (
    token: string,
    projectId: string,
    taskId: string,
    body: Partial<{ title: string; description: string; status: TaskStatus; dueDate: string | null; assigneeId: string | null }>
  ) =>
    authRequest<{ task: Task }>(`/projects/${projectId}/tasks/${taskId}`, token, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getDashboardStats: (token: string) =>
    authRequest<{
      stats: DashboardStats;
      projects: { id: string; name: string; status: ProjectStatus; progress: number; taskCount: number; doneCount: number }[];
    }>("/dashboard/stats", token),
};
