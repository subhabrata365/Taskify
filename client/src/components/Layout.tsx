import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/dashboard" className="brand-link">
          <Logo size="md" />
        </Link>
        <div className="header-actions">
          <span className="user-badge">
            {user?.name} · <strong>{user?.role}</strong>
          </span>
          <button type="button" onClick={logout} className="btn-ghost">
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
