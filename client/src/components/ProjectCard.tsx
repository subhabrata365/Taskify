import { Link } from "react-router-dom";
import type { Project } from "../api/client";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const isOverdue = project.status === "ONGOING" && project.progress < 100;

  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card-top">
        <h3>{project.name}</h3>
        <span className={`status-pill status-${project.status.toLowerCase()}`}>
          {project.status === "ONGOING" ? "Ongoing" : "Completed"}
        </span>
      </div>
      {project.description && <p className="project-desc">{project.description}</p>}
      <div className="project-meta">
        <span>{project.teamName}</span>
        <span>{project.memberCount} members</span>
        <span>{project.taskCount} tasks</span>
      </div>
      <div className="progress-block">
        <div className="progress-label">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${project.progress}%` }} />
        </div>
      </div>
      {isOverdue && project.taskCount > 0 && project.progress < 100 && (
        <span className="overdue-hint">Active — keep going!</span>
      )}
    </Link>
  );
}
