import type { Metadata } from "next";
import { CalendarDays, CheckSquare, Clock3, Flame, FolderKanban } from "lucide-react";
import { endOfDay, startOfDay } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickCreateButton } from "@/components/shared/quick-create-button";
import { EmptyState } from "@/components/layout/empty-state";
import { TaskCard } from "@/components/tasks/task-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLookupData } from "@/lib/data/lookups";
import { formatDateTime, formatLongDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { serializeEvent, serializeTask } from "@/lib/serializers";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Dashboard"
};

export const dynamic = "force-dynamic";

const taskInclude = {
  area: true,
  project: true,
  client: true
};

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);
  const lookups = await getLookupData(user.id);

  const [todayTasksRaw, overdueTasksRaw, inProgressCount, activeProjectsCount, upcomingEventsRaw] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { gte: start, lte: end }
      },
      include: taskInclude,
      orderBy: [{ dueTime: "asc" }, { createdAt: "desc" }],
      take: 8
    }),
    prisma.task.findMany({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { lt: start }
      },
      include: taskInclude,
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
      take: 8
    }),
    prisma.task.count({
      where: { userId: user.id, status: "IN_PROGRESS" }
    }),
    prisma.project.count({
      where: { userId: user.id, status: "ACTIVE" }
    }),
    prisma.event.findMany({
      where: {
        userId: user.id,
        startsAt: { gte: now }
      },
      include: taskInclude,
      orderBy: { startsAt: "asc" },
      take: 6
    })
  ]);

  const todayTasks = todayTasksRaw.map(serializeTask);
  const overdueTasks = overdueTasksRaw.map(serializeTask);
  const upcomingEvents = upcomingEventsRaw.map(serializeEvent);
  const name = user.name ?? user.email?.split("@")[0] ?? "usuário";

  return (
    <AppShell userEmail={user.email}>
      <PageHeader
        title={`Olá, ${name}`}
        description={formatLongDate(now)}
        action={<QuickCreateButton />}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="tarefas de hoje" value={todayTasks.length} icon={CheckSquare} tone="cyan" />
        <StatCard label="tarefas atrasadas" value={overdueTasks.length} icon={Flame} tone="red" />
        <StatCard label="em andamento" value={inProgressCount} icon={Clock3} tone="amber" />
        <StatCard label="projetos ativos" value={activeProjectsCount} icon={FolderKanban} tone="green" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas de hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <TaskCard key={task.id} task={task} areas={lookups.areas} projects={lookups.projects} clients={lookups.clients} compact />
                ))
              ) : (
                <EmptyState title="Nada para hoje" description="Crie uma tarefa ou use a entrada rápida para capturar algo novo." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarefas atrasadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueTasks.length > 0 ? (
                overdueTasks.map((task) => (
                  <TaskCard key={task.id} task={task} areas={lookups.areas} projects={lookups.projects} clients={lookups.clients} compact />
                ))
              ) : (
                <EmptyState title="Sem atrasos" description="Boa. A caixa de pendências antigas está limpa." />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="rounded-md border border-life-line bg-life-bg p-3">
                  <p className="font-medium">{event.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-life-muted">
                    <CalendarDays className="h-4 w-4 text-life-cyan" />
                    {formatDateTime(event.startsAt)}
                  </p>
                  {event.client ? <p className="mt-1 text-xs text-life-muted">Cliente: {event.client.name}</p> : null}
                </div>
              ))
            ) : (
              <EmptyState title="Agenda livre" description="Nenhum evento futuro registrado." icon={CalendarDays} />
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
