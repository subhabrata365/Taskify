import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { api, type ProjectDetail, type TaskStatus } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Tab = "team" | "tasks" | "progress";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tab, setTab] = useState<Tab>("tasks");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "" });
  const [showTaskForm, setShowTaskForm] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const data = await api.getProject(token, id);
      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    try {
      await api.createTask(token, id, {
        title: taskForm.title,
        description: taskForm.description || undefined,
        dueDate: taskForm.dueDate || undefined,
      });
      setTaskForm({ title: "", description: "", dueDate: "" });
      setShowTaskForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    }
  };

  const handleTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (!token || !id) return;
    try {
      await api.updateTask(token, id, taskId, { status });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleCompleteProject = async () => {
    if (!token || !id) return;
    try {
      await api.updateProject(token, id, { status: "COMPLETED" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="loading-text">Loading project...</p>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="card empty-state">
          <h2>Project not found</h2>
          <Link to="/dashboard">← Back to dashboard</Link>
        </div>
      </Layout>
    );
  }

  const overdue = project.tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
  );

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        <span>{project.name}</span>
      </div>

      <div className="page-header">
        <div>
          <div className="title-row">
            <h1>{project.name}</h1>
            <span className={`status-pill status-${project.status.toLowerCase()}`}>
              {project.status === "ONGOING" ? "Ongoing" : "Completed"}
            </span>
          </div>
          {project.description && <p>{project.description}</p>}
        </div>
        {project.status === "ONGOING" && project.progress === 100 && user?.role === "ADMIN" && (
          <button type="button" className="btn-primary" onClick={handleCompleteProject}>
            Mark Completed
          </button>
        )}
      </div>

      <div className="project-summary card">
        <div className="summary-stat">
          <span className="stat-value">{project.progress}%</span>
          <span className="stat-label">Progress</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{project.tasks.length}</span>
          <span className="stat-label">Tasks</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{project.team.members.length}</span>
          <span className="stat-label">Team Members</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{overdue.length}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      <div className="tabs">
        {(
          [
            { id: "team" as Tab, label: "Team", icon: "👥" },
            { id: "tasks" as Tab, label: "Tasks & Progression", icon: "📋" },
            { id: "progress" as Tab, label: "Progress Tracking", icon: "📈" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? "tab-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {error && <p className="error-banner">{error}</p>}

      {tab === "team" && (
        <div className="card">
          <h2>{project.team.name}</h2>
          <div className="team-list">
            {project.team.members.map((m) => (
              <div key={m.id} className="team-member">
                <div className="avatar">{m.user.name.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{m.user.name}</strong>
                  <p>{m.user.email}</p>
                </div>
                <span className="role-pill">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="tasks-section">
          <div className="tasks-toolbar">
            <h2>Tasks</h2>
            {project.status === "ONGOING" && (
              <button type="button" className="btn-primary" onClick={() => setShowTaskForm(!showTaskForm)}>
                + Add Task
              </button>
            )}
          </div>

          {showTaskForm && (
            <form className="card form-card" onSubmit={handleAddTask}>
              <label>
                Title
                <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </label>
              <label>
                Description
                <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
              </label>
              <label>
                Due date
                <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </label>
              <button type="submit" className="btn-primary">Add Task</button>
            </form>
          )}

          {project.tasks.length === 0 ? (
            <div className="card empty-state"><p>No tasks yet.</p></div>
          ) : (
            <div className="task-list">
              {project.tasks.map((task) => {
                const isOverdue =
                  task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
                return (
                  <div key={task.id} className={`task-card ${isOverdue ? "task-overdue" : ""}`}>
                    <div className="task-card-head">
                      <h3>{task.title}</h3>
                      <span className={`task-status task-status-${task.status.toLowerCase()}`}>
                        {STATUS_LABELS[task.status]}
                      </span>
                    </div>
                    {task.description && <p>{task.description}</p>}
                    <div className="task-meta">
                      {task.assignee && <span>Assigned: {task.assignee.name}</span>}
                      {task.dueDate && (
                        <span className={isOverdue ? "overdue-text" : ""}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue && " (overdue)"}
                        </span>
                      )}
                    </div>
                    {project.status === "ONGOING" && (
                      <div className="task-actions">
                        {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`btn-sm ${task.status === s ? "btn-sm-active" : ""}`}
                            onClick={() => handleTaskStatus(task.id, s)}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "progress" && (
        <div className="progress-dashboard">
          <div className="card">
            <h2>Project Progress</h2>
            <div className="big-progress">
              <div className="big-progress-value">{project.progress}%</div>
              <div className="progress-bar large">
                <div className="progress-fill" style={{ width: `${project.progress}%` }} />
              </div>
              <p>{project.tasks.filter((t) => t.status === "DONE").length} of {project.tasks.length} tasks completed</p>
            </div>
          </div>

          <div className="card">
            <h2>Status Breakdown</h2>
            {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((s) => {
              const count = project.tasks.filter((t) => t.status === s).length;
              const pct = project.tasks.length ? Math.round((count / project.tasks.length) * 100) : 0;
              return (
                <div key={s} className="status-row">
                  <span className={`task-status task-status-${s.toLowerCase()}`}>{STATUS_LABELS[s]}</span>
                  <div className="progress-bar">
                    <div className={`progress-fill fill-${s.toLowerCase()}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>

          {overdue.length > 0 && (
            <div className="card card-warn">
              <h2>⚠️ Overdue Tasks ({overdue.length})</h2>
              <ul className="overdue-list">
                {overdue.map((t) => (
                  <li key={t.id}>{t.title} — due {new Date(t.dueDate!).toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
