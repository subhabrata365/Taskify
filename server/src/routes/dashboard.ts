import { Router, Request, Response } from "express";
import { Role, TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { calcProgress, getUserTeamIds } from "../lib/access";

const router = Router();

router.get("/stats", authenticate, async (req: Request, res: Response) => {
  try {
    const teamIds = await getUserTeamIds(req.user!.userId, req.user!.role === Role.ADMIN);

    if (teamIds.length === 0) {
      res.json({
        stats: {
          totalProjects: 0,
          ongoingProjects: 0,
          completedProjects: 0,
          totalTasks: 0,
          tasksByStatus: { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
          overdueTasks: 0,
          overallProgress: 0,
        },
        projects: [],
      });
      return;
    }

    const projects = await prisma.project.findMany({
      where: { teamId: { in: teamIds } },
      include: { tasks: true },
      orderBy: { updatedAt: "desc" },
    });

    const allTasks = projects.flatMap((p) => p.tasks);
    const now = new Date();

    const tasksByStatus = {
      TODO: allTasks.filter((t) => t.status === TaskStatus.TODO).length,
      IN_PROGRESS: allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      DONE: allTasks.filter((t) => t.status === TaskStatus.DONE).length,
    };

    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== TaskStatus.DONE
    ).length;

    res.json({
      stats: {
        totalProjects: projects.length,
        ongoingProjects: projects.filter((p) => p.status === "ONGOING").length,
        completedProjects: projects.filter((p) => p.status === "COMPLETED").length,
        totalTasks: allTasks.length,
        tasksByStatus,
        overdueTasks,
        overallProgress: calcProgress(allTasks),
      },
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: calcProgress(p.tasks),
        taskCount: p.tasks.length,
        doneCount: p.tasks.filter((t) => t.status === TaskStatus.DONE).length,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
