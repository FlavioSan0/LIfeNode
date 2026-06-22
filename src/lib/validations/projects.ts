import { z } from "zod";
import { optionalId, optionalText } from "@/lib/validations/common";

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do projeto.").max(120, "Use até 120 caracteres."),
  description: optionalText(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]),
  areaId: optionalId
});

export type ProjectInput = z.infer<typeof projectSchema>;
