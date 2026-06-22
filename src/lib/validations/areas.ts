import { z } from "zod";
import { hexColor } from "@/lib/validations/common";

export const areaSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da área.").max(80, "Use até 80 caracteres."),
  color: hexColor,
  icon: z.string().trim().min(2, "Informe um ícone.").max(60, "Use até 60 caracteres.")
});

export type AreaInput = z.infer<typeof areaSchema>;
