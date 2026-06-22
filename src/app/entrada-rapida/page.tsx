import type { Metadata } from "next";
import { StickyNote } from "lucide-react";
import { QuickEntryForm } from "@/components/quick-entry/quick-entry-form";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { labelFor, priorities } from "@/constants/options";
import { getLookupData } from "@/lib/data/lookups";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Entrada rápida"
};

export const dynamic = "force-dynamic";

export default async function QuickEntryPage() {
  const user = await requireUser();
  const lookups = await getLookupData(user.id);

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    include: {
      area: true,
      project: true,
      client: true
    },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  return (
    <AppShell userEmail={user.email}>
      <PageHeader
        title="Entrada rápida"
        description="Capture uma frase solta e salve como tarefa ou nota simples. A interpretação automática fica para uma versão futura."
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <QuickEntryForm areas={lookups.areas} projects={lookups.projects} clients={lookups.clients} />

        <Card>
          <CardHeader>
            <CardTitle>Notas recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div key={note.id} className="rounded-md border border-life-line bg-life-bg p-3">
                  <p className="text-sm leading-relaxed">{note.content}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-life-muted">
                    {note.date ? <span>{formatDate(note.date)}</span> : null}
                    {note.priority ? <span>{labelFor(priorities, note.priority)}</span> : null}
                    {note.area ? <span>{note.area.name}</span> : null}
                    {note.project ? <span>{note.project.name}</span> : null}
                    {note.client ? <span>{note.client.name}</span> : null}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Sem notas ainda" description="Notas salvas pela entrada rápida aparecem aqui." icon={StickyNote} />
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
