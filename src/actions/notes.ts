"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { quickEntrySchema, type QuickEntryInput } from "@/lib/validations/quick-entry";
import { assertOwnedLinks, dateFromInput, logActivity, validationError, zodError } from "@/lib/actions/utils";
import type { ActionResult } from "@/types";

export async function createQuickEntryAction(input: QuickEntryInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = quickEntrySchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise a entrada rápida.", parsed.error.flatten().fieldErrors);
  }

  try {
    const data = parsed.data;
    await assertOwnedLinks(user.id, data);

    if (data.type === "TASK") {
      const task = await prisma.task.create({
        data: {
          userId: user.id,
          title: data.content.slice(0, 140),
          description: data.content.length > 140 ? data.content : null,
          status: "PENDING",
          priority: data.priority ?? "MEDIUM",
          dueDate: dateFromInput(data.date),
          areaId: data.areaId ?? null,
          projectId: data.projectId ?? null,
          clientId: data.clientId ?? null
        }
      });

      await logActivity({ userId: user.id, action: "quick:create-task", entity: "Task", entityId: task.id });
      revalidatePath("/tarefas");
      revalidatePath("/dashboard");
      revalidatePath("/entrada-rapida");

      return { ok: true, message: "Entrada salva como tarefa." };
    }

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        content: data.content,
        type: "NOTE",
        date: dateFromInput(data.date),
        priority: data.priority ?? null,
        areaId: data.areaId ?? null,
        projectId: data.projectId ?? null,
        clientId: data.clientId ?? null
      }
    });

    await logActivity({ userId: user.id, action: "quick:create-note", entity: "Note", entityId: note.id });
    revalidatePath("/entrada-rapida");

    return { ok: true, message: "Entrada salva como nota." };
  } catch (error) {
    return validationError(error);
  }
}
