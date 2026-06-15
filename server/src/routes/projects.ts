import { Router, Request, Response } from "express";
import { Role, TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../middleware/auth";
import { calcProgress, getProjectForUser, getUserTeamIds } from "../lib/access";

const PROJECT_STATUSES = ["ONGOING", "COMPLETED"] as const;
type ProjectStatus = (typeof PROJECT_STATUSES)[number];

function formatProject(project: {
  id: string;
  name: string;
  description?: string | null;
  status?: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
  tasks: { status: string }[];
  team?: { name: string; members: unknown[] };
}) {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    status: project.status ?? "ONGOING",
    teamId: project.teamId,
    teamName: project.team?.name,
    memberCount: project.team?.members?.length ?? 0,
    taskCount: project.tasks.length,
    progress: calcProgress(project.tasks),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as ProjectStatus | undefined;
    const teamIds = await getUserTeamIds(req.user!.userId, req.user!.role === Role.ADMIN);

    if (teamIds.length === 0) {
      res.json({ projects: [] });
      return;
    }

    const projects = await prisma.project.findMany({
      where: {
        teamId: { in: teamIds },
        ...(status ? { status } : {}),
      },
      include: {
        tasks: { select: { status: true } },
        team: { include: { members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ projects: projects.map(formatProject) });
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const project = await getProjectForUser(String(req.params.id), req.user!.userId, req.user!.role);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json({
      project: {
        ...formatProject(project),
        team: {
          id: project.team.id,
          name: project.team.name,
          members: project.team.members.map((m) => ({
            id: m.id,
            role: m.role,
            user: m.user,
          })),
        },
        tasks: project.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          dueDate: t.dueDate,
          assignee: t.assignee,
          createdAt: t.createdAt,
        })),
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.post("/", authenticate, requireRole(Role.ADMIN), async (req: Request, res: Response) => {
  try {
    const { name, description, teamName } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ error: "Project name is required" });
      return;
    }

    const team = await prisma.team.create({
      data: {
        name: teamName?.trim() || `${name.trim()} Team`,
        members: { create: { userId: req.user!.userId, role: Role.ADMIN } },
      },
    });

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        teamId: team.id,
      },
      include: { tasks: true, team: { include: { members: true } } },
    });

    res.status(201).json({ project: formatProject(project) });
  } catch {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const project = await getProjectForUser(String(req.params.id), req.user!.userId, req.user!.role);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const { name, description, status } = req.body;
    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(status && PROJECT_STATUSES.includes(status) ? { status } : {}),
      },
      include: { tasks: true, team: { include: { members: true } } },
    });

    res.json({ project: formatProject(updated) });
  } catch {
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.post("/:id/tasks", authenticate, async (req: Request, res: Response) => {
  try {
    const project = await getProjectForUser(String(req.params.id), req.user!.userId, req.user!.role);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const { title, description, dueDate, assigneeId } = req.body;
    if (!title?.trim()) {
      res.status(400).json({ error: "Task title is required" });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        projectId: project.id,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ task });
  } catch {
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/:projectId/tasks/:taskId", authenticate, async (req: Request, res: Response) => {
  try {
    const project = await getProjectForUser(String(req.params.projectId), req.user!.userId, req.user!.role);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const { title, description, status, dueDate, assigneeId } = req.body;
    const task = await prisma.task.update({
      where: { id: String(req.params.taskId), projectId: project.id },
      data: {
        ...(title?.trim() ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(status && Object.values(TaskStatus).includes(status) ? { status } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(assigneeId !== undefined ? { assigneeId: assigneeId || null } : {}),
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });

    res.json({ task });
  } catch {
    res.status(500).json({ error: "Failed to update task" });
  }
});

export default router;
