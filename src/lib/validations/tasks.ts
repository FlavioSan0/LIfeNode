import { z } from "zod";
import { optionalDate, optionalId, optionalText, optionalTime } from "@/lib/validations/common";

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Informe um título.").max(140, "Use até 140 caracteres."),
  description: optionalText(),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: optionalDate,
  dueTime: optionalTime,
  areaId: optionalId,
  projectId: optionalId,
  clientId: optionalId
});

export type TaskInput = z.infer<typeof taskSchema>;
