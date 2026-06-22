import type { Metadata } from "next";
import { format, isValid, parseISO, startOfDay, endOfDay } from "date-fns";
import { Plus } from "lucide-react";
import { DateFilter } from "@/components/agenda/date-filter";
import { EventCard } from "@/components/agenda/event-card";
import { EventDialog } from "@/components/agenda/event-form";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getLookupData } from "@/lib/data/lookups";
import { formatLongDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { serializeEvent } from "@/lib/serializers";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Agenda"
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const lookups = await getLookupData(user.id);
  const defaultDate = format(new Date(), "yyyy-MM-dd");
  const requestedDate = one(searchParams.date) ?? defaultDate;
  const parsedDate = parseISO(requestedDate);
  const selectedDate = isValid(parsedDate) ? parsedDate : new Date();
  const start = startOfDay(selectedDate);
  const end = endOfDay(selectedDate);

  const events = await prisma.event.findMany({
    where: {
      userId: user.id,
      startsAt: { gte: start, lte: end }
    },
    include: {
      area: true,
      project: true,
      client: true
    },
    orderBy: { startsAt: "asc" }
  });

  const serializedEvents = events.map(serializeEvent);

  return (
    <AppShell userEmail={user.email}>
      <PageHeader
        title="Agenda"
        description={formatLongDate(selectedDate)}
        action={
          <EventDialog
            areas={lookups.areas}
            projects={lookups.projects}
            clients={lookups.clients}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo evento
              </Button>
            }
          />
        }
      />

      <DateFilter defaultDate={defaultDate} />

      <section className="grid gap-3 xl:grid-cols-2">
        {serializedEvents.length > 0 ? (
          serializedEvents.map((event) => (
            <EventCard key={event.id} event={event} areas={lookups.areas} projects={lookups.projects} clients={lookups.clients} />
          ))
        ) : (
          <div className="xl:col-span-2">
            <EmptyState title="Nenhum evento nesta data" description="Escolha outra data ou crie um evento." />
          </div>
        )}
      </section>
    </AppShell>
  );
}
