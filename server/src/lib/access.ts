import { Role } from "@prisma/client";
import { prisma } from "./prisma";

export async function getUserTeamIds(userId: string, isAdmin: boolean) {
  if (isAdmin) {
    const teams = await prisma.team.findMany({ select: { id: true } });
    return teams.map((t) => t.id);
  }
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  return memberships.map((m) => m.teamId);
}

export function calcProgress(tasks: { status: string }[]) {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}

export async function getProjectForUser(projectId: string, userId: string, role: Role) {
  const teamIds = await getUserTeamIds(userId, role === Role.ADMIN);
  return prisma.project.findFirst({
    where: { id: projectId, teamId: { in: teamIds } },
    include: {
      team: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, role: true } } },
          },
        },
      },
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
