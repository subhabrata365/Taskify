import { type FormEvent, useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import ProjectCard from "../components/ProjectCard";
import { api, type DashboardStats, type Project } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Tab = "ongoing" | "completed" | "progress";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<Tab>("ongoing");
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progressProjects, setProgressProjects] = useState<
    { id: string; name: string; status: string; progress: number; taskCount: number; doneCount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", teamName: "" });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      if (tab === "progress") {
        const data = await api.getDashboardStats(token);
        setStats(data.stats);
        setProgressProjects(data.projects);
      } else {
        const status = tab === "ongoing" ? "ONGOING" : "COMPLETED";
        const data = await api.getProjects(token, status);
        setProjects(data.projects);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.createProject(token, form);
      setForm({ name: "", description: "", teamName: "" });
      setShowForm(false);
      setTab("ongoing");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "ongoing", label: "Ongoing Projects", icon: "🚀" },
    { id: "completed", label: "Completed Projects", icon: "✅" },
    { id: "progress", label: "Progress Tracking", icon: "📊" },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Manage teams, projects, and track progress</p>
        </div>
        {user?.role === "ADMIN" && (
          <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
            + New Project
          </button>
        )}
      </div>

      {showForm && user?.role === "ADMIN" && (
        <form className="card form-card" onSubmit={handleCreate}>
          <h2>Create Project</h2>
          <div className="form-grid">
            <label>
              Project name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Team name
              <input value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} placeholder="Optional" />
            </label>
          </div>
          <label>
            Description
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="tabs">
        {tabs.map((t) => (
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

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : tab === "progress" ? (
        <div className="progress-dashboard">
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{stats.overallProgress}%</span>
                <span className="stat-label">Overall Progress</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.ongoingProjects}</span>
                <span className="stat-label">Ongoing</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.completedProjects}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-card stat-warn">
                <span className="stat-value">{stats.overdueTasks}</span>
                <span className="stat-label">Overdue Tasks</span>
              </div>
            </div>
          )}

          {stats && (
            <div className="card">
              <h2>Tasks by Status</h2>
              <div className="status-bars">
                {(["TODO", "IN_PROGRESS", "DONE"] as const).map((s) => (
                  <div key={s} className="status-row">
                    <span className={`task-status task-status-${s.toLowerCase()}`}>{s.replace("_", " ")}</span>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill fill-${s.toLowerCase()}`}
                        style={{
                          width: stats.totalTasks
                            ? `${(stats.tasksByStatus[s] / stats.totalTasks) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                    <span>{stats.tasksByStatus[s]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h2>Project Progress</h2>
            {progressProjects.length === 0 ? (
              <p className="empty-text">No projects yet.</p>
            ) : (
              <div className="progress-list">
                {progressProjects.map((p) => (
                  <div key={p.id} className="progress-item">
                    <div className="progress-item-head">
                      <strong>{p.name}</strong>
                      <span>{p.doneCount}/{p.taskCount} tasks · {p.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="card empty-state">
          <h2>No {tab === "ongoing" ? "ongoing" : "completed"} projects</h2>
          <p>
            {user?.role === "ADMIN"
              ? "Create a new project to get started."
              : "Ask an admin to add you to a team project."}
          </p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </Layout>
  );
}
