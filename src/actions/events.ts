"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { eventSchema, type EventInput } from "@/lib/validations/events";
import {
  assertOwnedLinks,
  dateTimeFromInput,
  logActivity,
  nullable,
  validationError,
  zodError
} from "@/lib/actions/utils";
import type { ActionResult } from "@/types";

function revalidateEventViews() {
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");
  revalidatePath("/clientes");
}

async function getOwnedEvent(userId: string, id: string) {
  const event = await prisma.event.findFirst({ where: { id, userId }, select: { id: true, title: true } });
  if (!event) throw new Error("Evento não encontrado para este usuário.");
  return event;
}

function parseEventDates(input: EventInput) {
  const startsAt = dateTimeFromInput(input.startsAt);
  const endsAt = dateTimeFromInput(input.endsAt);

  if (!startsAt || Number.isNaN(startsAt.getTime())) {
    throw new Error("Informe um início válido para o evento.");
  }

  if (endsAt && Number.isNaN(endsAt.getTime())) {
    throw new Error("Informe um fim válido para o evento.");
  }

  return { startsAt, endsAt };
}

export async function createEventAction(input: EventInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = eventSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos do evento.", parsed.error.flatten().fieldErrors);
  }

  try {
    const data = parsed.data;
    await assertOwnedLinks(user.id, data);
    const { startsAt, endsAt } = parseEventDates(data);

    const event = await prisma.event.create({
      data: {
        userId: user.id,
        title: data.title,
        description: nullable(data.description),
        location: nullable(data.location),
        startsAt,
        endsAt,
        areaId: data.areaId ?? null,
        projectId: data.projectId ?? null,
        clientId: data.clientId ?? null
      }
    });

    await logActivity({ userId: user.id, action: "create", entity: "Event", entityId: event.id });
    revalidateEventViews();

    return { ok: true, message: "Evento criado." };
  } catch (error) {
    return validationError(error);
  }
}

export async function updateEventAction(id: string, input: EventInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = eventSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos do evento.", parsed.error.flatten().fieldErrors);
  }

  try {
    await getOwnedEvent(user.id, id);
    const data = parsed.data;
    await assertOwnedLinks(user.id, data);
    const { startsAt, endsAt } = parseEventDates(data);

    await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: nullable(data.description),
        location: nullable(data.location),
        startsAt,
        endsAt,
        areaId: data.areaId ?? null,
        projectId: data.projectId ?? null,
        clientId: data.clientId ?? null
      }
    });

    await logActivity({ userId: user.id, action: "update", entity: "Event", entityId: id });
    revalidateEventViews();

    return { ok: true, message: "Evento atualizado." };
  } catch (error) {
    return validationError(error);
  }
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  const user = await requireUser();

  try {
    await getOwnedEvent(user.id, id);
    await prisma.event.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Event", entityId: id });
    revalidateEventViews();

    return { ok: true, message: "Evento excluído." };
  } catch (error) {
    return validationError(error);
  }
}
