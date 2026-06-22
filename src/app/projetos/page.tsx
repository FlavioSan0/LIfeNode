import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDialog } from "@/components/projects/project-form";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getLookupData } from "@/lib/data/lookups";
import { prisma } from "@/lib/prisma";
import { serializeArea } from "@/lib/serializers";
import { requireUser } from "@/lib/auth/require-user";
import type { ProjectView } from "@/types/entities";

export const metadata: Metadata = {
  title: "Projetos"
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireUser();
  const lookups = await getLookupData(user.id);
  const now = new Date();

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      area: true,
      tasks: {
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 3
      },
      events: {
        where: { userId: user.id, startsAt: { gte: now } },
        orderBy: { startsAt: "asc" },
        take: 3
      },
      _count: {
        select: {
          tasks: true,
          events: true
        }
      }
    },
    orderBy: [{ status: "asc" }, { name: "asc" }]
  });

  const serializedProjects: ProjectView[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    area: serializeArea(project.area),
    taskCount: project._count.tasks,
    eventCount: project._count.events,
    tasks: project.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.toISOString() ?? null
    })),
    events: project.events.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt.toISOString()
    }))
  }));

  return (
    <AppShell userEmail={user.email}>
      <PageHeader
        title="Projetos"
        description="Acompanhe projetos ativos, pausados, concluídos e arquivados."
        action={
          <ProjectDialog
            areas={lookups.areas}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo projeto
              </Button>
            }
          />
        }
      />

      <section className="grid gap-3 xl:grid-cols-2">
        {serializedProjects.length > 0 ? (
          serializedProjects.map((project) => <ProjectCard key={project.id} project={project} areas={lookups.areas} />)
        ) : (
          <div className="xl:col-span-2">
            <EmptyState title="Nenhum projeto" description="Crie projetos para agrupar tarefas e eventos." />
          </div>
        )}
      </section>
    </AppShell>
  );
}
