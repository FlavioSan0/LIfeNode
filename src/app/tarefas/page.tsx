import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Prisma } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskDialog } from "@/components/tasks/task-form";
import { TaskFilters } from "@/components/tasks/task-filters";
import { Button } from "@/components/ui/button";
import { priorities, taskStatuses } from "@/constants/options";
import { getLookupData } from "@/lib/data/lookups";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/serializers";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Tarefas"
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TasksPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const lookups = await getLookupData(user.id);
  const q = one(searchParams.q)?.trim();
  const status = one(searchParams.status);
  const priority = one(searchParams.priority);
  const areaId = one(searchParams.areaId);
  const projectId = one(searchParams.projectId);
  const clientId = one(searchParams.clientId);

  const where: Prisma.TaskWhereInput = { userId: user.id };

  if (q) where.title = { contains: q, mode: "insensitive" };
  if (status && taskStatuses.some((item) => item.value === status)) where.status = status as Prisma.EnumTaskStatusFilter["equals"];
  if (priority && priorities.some((item) => item.value === priority)) where.priority = priority as Prisma.EnumPriorityFilter["equals"];
  if (areaId) where.areaId = areaId;
  if (projectId) where.projectId = projectId;
  if (clientId) where.clientId = clientId;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      area: true,
      project: true,
      client: true
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }]
  });

  const serializedTasks = tasks.map(serializeTask);

  return (
    <AppShell userEmail={user.email}>
      <PageHeader
        title="Tarefas"
        description="Capture, filtre, edite, conclua e cancele tarefas com isolamento por usuário."
        action={
          <TaskDialog
            areas={lookups.areas}
            projects={lookups.projects}
            clients={lookups.clients}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova tarefa
              </Button>
            }
          />
        }
      />
      <TaskFilters areas={lookups.areas} projects={lookups.projects} clients={lookups.clients} />

      <section className="grid gap-3 xl:grid-cols-2">
        {serializedTasks.length > 0 ? (
          serializedTasks.map((task) => (
            <TaskCard key={task.id} task={task} areas={lookups.areas} projects={lookups.projects} clients={lookups.clients} />
          ))
        ) : (
          <div className="xl:col-span-2">
            <EmptyState title="Nenhuma tarefa encontrada" description="Ajuste os filtros ou crie a primeira tarefa." />
          </div>
        )}
      </section>
    </AppShell>
  );
}
