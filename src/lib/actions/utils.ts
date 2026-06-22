import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

export function validationError(error: unknown): ActionResult {
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "Não foi possível concluir a ação." };
}

export function zodError(message: string, fieldErrors?: Record<string, string[] | undefined>): ActionResult {
  return { ok: false, message, fieldErrors };
}

export function nullable(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

export function dateFromInput(value?: string) {
  return value ? new Date(`${value}T12:00:00.000Z`) : null;
}

export function dateTimeFromInput(value?: string) {
  return value ? new Date(value) : null;
}

export async function assertOwnedLinks(
  userId: string,
  links: {
    areaId?: string;
    projectId?: string;
    clientId?: string;
  }
) {
  const [area, project, client] = await Promise.all([
    links.areaId ? prisma.area.findFirst({ where: { id: links.areaId, userId }, select: { id: true } }) : null,
    links.projectId ? prisma.project.findFirst({ where: { id: links.projectId, userId }, select: { id: true } }) : null,
    links.clientId ? prisma.client.findFirst({ where: { id: links.clientId, userId }, select: { id: true } }) : null
  ]);

  if (links.areaId && !area) throw new Error("Área não encontrada para este usuário.");
  if (links.projectId && !project) throw new Error("Projeto não encontrado para este usuário.");
  if (links.clientId && !client) throw new Error("Cliente não encontrado para este usuário.");
}

export async function logActivity(params: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.activityLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata
    }
  });
}
