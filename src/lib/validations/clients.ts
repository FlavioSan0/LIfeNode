import { z } from "zod";
import { optionalText } from "@/lib/validations/common";

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente.").max(120, "Use até 120 caracteres."),
  company: optionalText(120),
  phone: optionalText(40),
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().email("Informe um e-mail válido.").optional()
  ),
  serviceType: optionalText(120),
  status: z.enum(["LEAD", "CONTACTED", "PROPOSAL", "ACTIVE", "PAUSED", "FINISHED"]),
  observations: optionalText(2000)
});

export type ClientInput = z.infer<typeof clientSchema>;
