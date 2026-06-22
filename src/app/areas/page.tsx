import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AreaCard } from "@/components/areas/area-card";
import { AreaDialog } from "@/components/areas/area-form";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import type { AreaView } from "@/types/entities";

export const metadata: Metadata = {
  title: "Áreas"
};

export const dynamic = "force-dynamic";

export default async function AreasPage() {
  const user = await requireUser();
  const areas = await prisma.area.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: {
          tasks: true,
          projects: true,
          events: true,
          notes: true
        }
      }
    },
    orderBy: { name: "asc" }
  });

  const serializedAreas: AreaView[] = areas.map((area) => ({
    id: area.id,
    name: area.name,
    color: area.color,
    icon: area.icon,
    taskCount: area._count.tasks,
    projectCount: area._count.projects,
    eventCount: area._count.events,
    noteCount: area._count.notes
  }));

  return (
    <AppShell userEmail={user.email}>
      <PageHeader
        title="Áreas"
        description="Contextos para separar vida pessoal, trabalho, clientes, estudos e ideias."
        action={
          <AreaDialog
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova área
              </Button>
            }
          />
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {serializedAreas.length > 0 ? (
          serializedAreas.map((area) => <AreaCard key={area.id} area={area} />)
        ) : (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState title="Nenhuma área" description="Crie áreas para organizar suas tarefas, projetos e eventos." />
          </div>
        )}
      </section>
    </AppShell>
  );
}
