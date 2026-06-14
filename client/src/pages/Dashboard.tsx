import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Taskify</h1>
          <p>Team Task Manager</p>
        </div>
        <div className="user-info">
          <span>
            {user?.name} · <strong>{user?.role}</strong>
          </span>
          <button type="button" onClick={logout} className="btn-secondary">
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="placeholder-card">
          <h2>Dashboard</h2>
          <p>
            Auth is working. Next up: projects, teams, tasks, and progress
            tracking.
          </p>
        </div>
      </main>
    </div>
  );
}
