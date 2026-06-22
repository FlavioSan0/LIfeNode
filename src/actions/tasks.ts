"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { taskSchema, type TaskInput } from "@/lib/validations/tasks";
import {
  assertOwnedLinks,
  dateFromInput,
  logActivity,
  nullable,
  validationError,
  zodError
} from "@/lib/actions/utils";
import type { ActionResult } from "@/types";

function revalidateTaskViews() {
  revalidatePath("/dashboard");
  revalidatePath("/tarefas");
  revalidatePath("/projetos");
  revalidatePath("/clientes");
}

async function getOwnedTask(userId: string, id: string) {
  const task = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true, title: true }
  });

  if (!task) {
    throw new Error("Tarefa não encontrada para este usuário.");
  }

  return task;
}

export async function createTaskAction(input: TaskInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = taskSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos da tarefa.", parsed.error.flatten().fieldErrors);
  }

  try {
    const data = parsed.data;
    await assertOwnedLinks(user.id, data);

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: data.title,
        description: nullable(data.description),
        status: data.status,
        priority: data.priority,
        dueDate: dateFromInput(data.dueDate),
        dueTime: data.dueTime ?? null,
        areaId: data.areaId ?? null,
        projectId: data.projectId ?? null,
        clientId: data.clientId ?? null
      }
    });

    await logActivity({ userId: user.id, action: "create", entity: "Task", entityId: task.id });
    revalidateTaskViews();

    return { ok: true, message: "Tarefa criada." };
  } catch (error) {
    return validationError(error);
  }
}

export async function updateTaskAction(id: string, input: TaskInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = taskSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos da tarefa.", parsed.error.flatten().fieldErrors);
  }

  try {
    await getOwnedTask(user.id, id);
    const data = parsed.data;
    await assertOwnedLinks(user.id, data);

    await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: nullable(data.description),
        status: data.status,
        priority: data.priority,
        dueDate: dateFromInput(data.dueDate),
        dueTime: data.dueTime ?? null,
        areaId: data.areaId ?? null,
        projectId: data.projectId ?? null,
        clientId: data.clientId ?? null,
        completedAt: data.status === "DONE" ? new Date() : null,
        cancelledAt: data.status === "CANCELLED" ? new Date() : null
      }
    });

    await logActivity({ userId: user.id, action: "update", entity: "Task", entityId: id });
    revalidateTaskViews();

    return { ok: true, message: "Tarefa atualizada." };
  } catch (error) {
    return validationError(error);
  }
}

export async function setTaskStatusAction(id: string, status: TaskStatus): Promise<ActionResult> {
  const user = await requireUser();

  if (!["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"].includes(status)) {
    return { ok: false, message: "Status inválido." };
  }

  try {
    await getOwnedTask(user.id, id);

    await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === "DONE" ? new Date() : null,
        cancelledAt: status === "CANCELLED" ? new Date() : null
      }
    });

    await logActivity({ userId: user.id, action: `status:${status}`, entity: "Task", entityId: id });
    revalidateTaskViews();

    return { ok: true, message: "Status atualizado." };
  } catch (error) {
    return validationError(error);
  }
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  const user = await requireUser();

  try {
    await getOwnedTask(user.id, id);
    await prisma.task.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Task", entityId: id });
    revalidateTaskViews();

    return { ok: true, message: "Tarefa excluída." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, message: "Tarefa não encontrada." };
    }

    return validationError(error);
  }
}
