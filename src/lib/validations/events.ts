import { z } from "zod";
import { optionalId, optionalText } from "@/lib/validations/common";

export const eventSchema = z
  .object({
    title: z.string().trim().min(2, "Informe o título do evento.").max(140, "Use até 140 caracteres."),
    description: optionalText(),
    location: optionalText(160),
    startsAt: z.string().min(1, "Informe o início."),
    endsAt: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().optional()
    ),
    areaId: optionalId,
    projectId: optionalId,
    clientId: optionalId
  })
  .refine(
    (data) => {
      if (!data.endsAt) return true;
      return new Date(data.endsAt).getTime() >= new Date(data.startsAt).getTime();
    },
    {
      path: ["endsAt"],
      message: "O fim deve ser depois do início."
    }
  );

export type EventInput = z.infer<typeof eventSchema>;
