import { z } from "zod";
import { optionalDate, optionalId } from "@/lib/validations/common";

export const quickEntrySchema = z.object({
  content: z.string().trim().min(3, "Digite a entrada rápida.").max(2000, "Use até 2000 caracteres."),
  type: z.enum(["TASK", "NOTE"]),
  areaId: optionalId,
  projectId: optionalId,
  clientId: optionalId,
  date: optionalDate,
  priority: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional()
  )
});

export type QuickEntryInput = z.infer<typeof quickEntrySchema>;
